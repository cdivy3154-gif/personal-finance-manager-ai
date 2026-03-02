/**
 * GET /api/transactions/stats
 * Get transaction statistics for dashboard
 */
const connectDB = require('../../lib/db');
const Transaction = require('../../lib/models/Transaction');
const { getSpendingInsights } = require('../../lib/utils/categorize');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { month, year } = req.query;
        const now = new Date();
        const m = parseInt(month) || now.getMonth() + 1;
        const y = parseInt(year) || now.getFullYear();

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        // Aggregation for this month
        const stats = await Transaction.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Category breakdown for expenses
        const categoryStats = await Transaction.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate }, type: 'expense' } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Daily spending trend for the month
        const dailyTrend = await Transaction.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate }, type: 'expense' } },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date(y, m - 7, 1);
        const monthlyTrend = await Transaction.aggregate([
            { $match: { date: { $gte: sixMonthsAgo, $lte: endDate } } },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const income = stats.find(s => s._id === 'income')?.total || 0;
        const expense = stats.find(s => s._id === 'expense')?.total || 0;

        // Get insights
        const allTransactions = await Transaction.find({
            date: { $gte: sixMonthsAgo, $lte: endDate }
        });
        const insights = getSpendingInsights(allTransactions);

        return res.json({
            success: true,
            data: {
                totalIncome: income,
                totalExpense: expense,
                balance: income - expense,
                savingsRate: income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0,
                categoryBreakdown: categoryStats,
                dailyTrend,
                monthlyTrend,
                insights,
                transactionCount: stats.reduce((sum, s) => sum + s.count, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
