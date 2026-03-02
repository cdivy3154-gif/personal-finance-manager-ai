/**
 * GET /api/budget/:month/utilization
 * Get budget utilization — compares budget vs actual spending
 */
const connectDB = require('../../../lib/db');
const Budget = require('../../../lib/models/Budget');
const Transaction = require('../../../lib/models/Transaction');
const cors = require('../../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { month } = req.query;
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr);
        const m = parseInt(monthStr);

        const startDate = new Date(year, m - 1, 1);
        const endDate = new Date(year, m, 0, 23, 59, 59);

        // Get budget
        const budget = await Budget.findOne({ month });

        // Get actual spending by category
        const spending = await Transaction.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate }, type: 'expense' } },
            {
                $group: {
                    _id: '$category',
                    spent: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalSpent = spending.reduce((sum, s) => sum + s.spent, 0);
        const categories = ['Food', 'Entertainment', 'Academics', 'Transportation', 'Utilities', 'Shopping', 'Others'];

        const utilization = categories.map(cat => {
            const catSpending = spending.find(s => s._id === cat);
            const budgetLimit = budget?.categories?.[cat] || 0;
            const spent = catSpending?.spent || 0;
            const percentage = budgetLimit > 0 ? (spent / budgetLimit * 100) : 0;

            return {
                category: cat,
                budgetLimit,
                spent,
                remaining: Math.max(0, budgetLimit - spent),
                percentage: Math.min(percentage, 100),
                overBudget: spent > budgetLimit && budgetLimit > 0,
                status: budgetLimit === 0 ? 'not-set' :
                    percentage >= 100 ? 'exceeded' :
                        percentage >= 80 ? 'warning' :
                            percentage >= 60 ? 'caution' : 'good'
            };
        });

        // Generate alerts
        const alerts = [];
        utilization.forEach(u => {
            if (u.status === 'exceeded') {
                alerts.push({
                    type: 'danger',
                    message: `🚨 ${u.category} budget exceeded! Spent ₹${u.spent.toFixed(2)} of ₹${u.budgetLimit.toFixed(2)}`
                });
            } else if (u.status === 'warning') {
                alerts.push({
                    type: 'warning',
                    message: `⚠️ ${u.category} at ${u.percentage.toFixed(0)}% — approaching limit!`
                });
            }
        });

        // Overall budget alert
        const totalBudget = budget?.totalBudget || 0;
        if (totalBudget > 0) {
            const overallPct = (totalSpent / totalBudget * 100);
            if (overallPct >= 100) {
                alerts.unshift({
                    type: 'danger',
                    message: `🚨 Overall budget exceeded! Spent ₹${totalSpent.toFixed(2)} of ₹${totalBudget.toFixed(2)}`
                });
            } else if (overallPct >= 80) {
                alerts.unshift({
                    type: 'warning',
                    message: `⚠️ Overall budget at ${overallPct.toFixed(0)}% — be careful!`
                });
            }
        }

        return res.json({
            success: true,
            data: {
                month,
                totalBudget,
                totalSpent,
                overallPercentage: totalBudget > 0 ? Math.min((totalSpent / totalBudget * 100), 100) : 0,
                categories: utilization,
                alerts
            }
        });
    } catch (error) {
        console.error('Error fetching utilization:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
