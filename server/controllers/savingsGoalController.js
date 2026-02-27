/**
 * Savings Goal Controller
 * Handles setting goals and adding funds.
 */
const SavingsGoal = require('../models/SavingsGoal');

/**
 * GET /api/goals
 * Get all savings goals
 */
exports.getGoals = async (req, res) => {
    try {
        const goals = await SavingsGoal.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: goals.length, data: goals });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * POST /api/goals
 * Create a new savings goal
 */
exports.createGoal = async (req, res) => {
    try {
        const goal = await SavingsGoal.create(req.body);
        res.status(201).json({ success: true, data: goal });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * PUT /api/goals/:id/add-funds
 * Add funds to a specific savings goal
 */
exports.addFunds = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid positive amount' });
        }

        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        goal.currentAmount += Number(amount);

        // The pre-save hook in the model will calculate isCompleted
        await goal.save();

        res.status(200).json({ success: true, data: goal, justCompleted: goal.isCompleted });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * DELETE /api/goals/:id
 * Delete a savings goal
 */
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        await goal.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
