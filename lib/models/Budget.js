/**
 * Budget Model
 * Stores monthly budget limits per category
 */
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    month: {
        type: String,  // Format: "YYYY-MM"
        required: [true, 'Month is required']
    },
    totalBudget: {
        type: Number,
        required: [true, 'Total budget is required'],
        min: [0, 'Budget must be positive']
    },
    categories: {
        Food: { type: Number, default: 0 },
        Entertainment: { type: Number, default: 0 },
        Academics: { type: Number, default: 0 },
        Transportation: { type: Number, default: 0 },
        Utilities: { type: Number, default: 0 },
        Shopping: { type: Number, default: 0 },
        Others: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Ensure one budget per month
budgetSchema.index({ month: 1 }, { unique: true });

module.exports = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
