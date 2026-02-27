/**
 * Transaction Controller
 * Handles CRUD operations for income/expense transactions
 * Includes smart auto-categorization and statistics
 */
const Transaction = require('../models/Transaction');
const { autoCategorize, getSpendingInsights } = require('../utils/categorize');

/**
 * GET /api/transactions
 * Fetch all transactions with optional filters
 */
exports.getTransactions = async (req, res) => {
    try {
        const { category, type, startDate, endDate, limit = 50, page = 1 } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const transactions = await Transaction.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(filter);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * POST /api/transactions
 * Create a new transaction with optional auto-categorization
 */
exports.createTransaction = async (req, res) => {
    try {
        const { type, amount, category, description, date } = req.body;

        // Smart auto-categorization if category not provided or is 'Others'
        const finalCategory = (!category || category === 'Others')
            ? autoCategorize(description)
            : category;

        const transaction = await Transaction.create({
            type,
            amount,
            category: finalCategory,
            description,
            date: date || Date.now()
        });

        // Include the suggested category info in response
        const autoSuggested = finalCategory !== category;

        res.status(201).json({
            success: true,
            data: transaction,
            autoSuggested,
            suggestedCategory: autoSuggested ? finalCategory : null
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, data: transaction });
    } catch (error) {
        console.error('Error updating transaction:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({ success: true, message: 'Transaction deleted' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/transactions/stats
 * Get transaction statistics for dashboard
 */
exports.getStats = async (req, res) => {
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

        res.json({
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
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/transactions/suggest-category
 * Suggest category for a description
 */
exports.suggestCategory = async (req, res) => {
    try {
        const { description } = req.query;
        const category = autoCategorize(description);
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
