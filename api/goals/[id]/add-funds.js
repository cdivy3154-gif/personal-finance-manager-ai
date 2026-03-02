/**
 * POST /api/goals/:id/add-funds
 * Add funds to a specific savings goal
 */
const connectDB = require('../../../lib/db');
const SavingsGoal = require('../../../lib/models/SavingsGoal');
const cors = require('../../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { id } = req.query;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid positive amount' });
        }

        const goal = await SavingsGoal.findById(id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        goal.currentAmount += Number(amount);

        // The pre-save hook in the model will calculate isCompleted
        await goal.save();

        return res.status(200).json({ success: true, data: goal, justCompleted: goal.isCompleted });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});
