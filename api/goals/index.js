/**
 * GET/POST /api/goals
 * List all goals (GET) or create a new savings goal (POST)
 */
const connectDB = require('../../lib/db');
const SavingsGoal = require('../../lib/models/SavingsGoal');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const goals = await SavingsGoal.find().sort({ createdAt: -1 });
            return res.status(200).json({ success: true, count: goals.length, data: goals });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const goal = await SavingsGoal.create(req.body);
            return res.status(201).json({ success: true, data: goal });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ success: false, error: messages });
            }
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
