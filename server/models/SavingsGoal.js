/**
 * SavingsGoal Model
 * Represents savings targets with calculated progression deadlines.
 */
const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    goalName: {
        type: String,
        required: [true, 'Goal name is required'],
        trim: true,
        maxlength: [50, 'Goal name cannot be more than 50 characters']
    },
    targetAmount: {
        type: Number,
        required: [true, 'Target amount is required'],
        min: [1, 'Target amount must be greater than 0']
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: [0, 'Current amount cannot be negative']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    category: {
        type: String,
        default: 'General'
    },
    color: {
        type: String, // E.g., hex code for UI display
        default: '#6c2fff'
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Calculate completion status before saving
savingsGoalSchema.pre('save', function (next) {
    if (this.currentAmount >= this.targetAmount) {
        this.isCompleted = true;
        this.currentAmount = this.targetAmount; // Cap it
    } else {
        this.isCompleted = false;
    }
    next();
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
