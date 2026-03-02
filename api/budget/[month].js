/**
 * GET/PUT /api/budget/:month
 * Get budget (GET) or set/update budget (PUT) for a specific month
 */
const connectDB = require('../../lib/db');
const Budget = require('../../lib/models/Budget');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    const { month } = req.query;

    if (req.method === 'GET') {
        try {
            let budget = await Budget.findOne({ month });

            if (!budget) {
                return res.json({
                    success: true,
                    data: {
                        month,
                        totalBudget: 0,
                        categories: {
                            Food: 0, Entertainment: 0, Academics: 0,
                            Transportation: 0, Utilities: 0, Shopping: 0, Others: 0
                        },
                        isDefault: true
                    }
                });
            }

            return res.json({ success: true, data: budget });
        } catch (error) {
            console.error('Error fetching budget:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { totalBudget, categories } = req.body;

            const budget = await Budget.findOneAndUpdate(
                { month },
                { month, totalBudget, categories },
                { new: true, upsert: true, runValidators: true }
            );

            return res.json({ success: true, data: budget });
        } catch (error) {
            console.error('Error setting budget:', error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({ success: false, message: messages.join(', ') });
            }
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
