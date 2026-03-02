/**
 * DELETE /api/goals/:id
 * Delete a savings goal by ID
 */
const connectDB = require('../../lib/db');
const SavingsGoal = require('../../lib/models/SavingsGoal');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { id } = req.query;
        const goal = await SavingsGoal.findById(id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        await goal.deleteOne();

        return res.status(200).json({ success: true, data: {} });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});
