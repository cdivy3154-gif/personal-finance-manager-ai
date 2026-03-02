/**
 * Transaction Model
 * Stores income and expense entries with category, amount, and description
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Food', 'Entertainment', 'Academics', 'Transportation', 'Utilities', 'Shopping', 'Income', 'Others']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    receiptUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for efficient date-range queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
