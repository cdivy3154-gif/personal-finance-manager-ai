/**
 * GET/POST /api/transactions
 * List transactions (GET) or create a new one (POST)
 */
const connectDB = require('../../lib/db');
const Transaction = require('../../lib/models/Transaction');
const { autoCategorize } = require('../../lib/utils/categorize');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    if (req.method === 'GET') {
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

            return res.json({
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
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { type, amount, category, description, date } = req.body;

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

            const autoSuggested = finalCategory !== category;

            return res.status(201).json({
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
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
