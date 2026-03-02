/**
 * /api/goals/:id and /api/goals/:id/add-funds
 * Handles DELETE goal and POST add-funds via catch-all route
 *
 * Vercel catch-all: req.query.params = ['<id>'] or ['<id>', 'add-funds']
 */
const connectDB = require('../../lib/db');
const SavingsGoal = require('../../lib/models/SavingsGoal');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    const params = req.query.params || [];
    const id = params[0];
    const action = params[1]; // 'add-funds' or undefined

    if (!id) {
        return res.status(400).json({ error: 'Missing goal ID' });
    }

    // POST /api/goals/:id/add-funds
    if (action === 'add-funds' && req.method === 'POST') {
        try {
            const { amount } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({ success: false, error: 'Please provide a valid positive amount' });
            }

            const goal = await SavingsGoal.findById(id);

            if (!goal) {
                return res.status(404).json({ success: false, error: 'Goal not found' });
            }

            goal.currentAmount += Number(amount);
            await goal.save();

            return res.status(200).json({ success: true, data: goal, justCompleted: goal.isCompleted });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    // DELETE /api/goals/:id
    if (!action && req.method === 'DELETE') {
        try {
            const goal = await SavingsGoal.findById(id);

            if (!goal) {
                return res.status(404).json({ success: false, error: 'Goal not found' });
            }

            await goal.deleteOne();
            return res.status(200).json({ success: true, data: {} });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
