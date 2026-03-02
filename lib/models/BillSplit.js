/**
 * BillSplit Model
 * Represents group expenses and calculates split tracking.
 */
const mongoose = require('mongoose');

const billSplitSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [50, 'Description cannot be more than 50 characters']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Amount must be a positive number']
    },
    createdBy: {
        type: String,
        default: 'Me', // Simplified for no-auth
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['unsettled', 'partially', 'settled'],
        default: 'unsettled'
    },
    participants: [{
        name: {
            type: String,
            required: true
        },
        amountOwed: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: {
            type: Date
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.models.BillSplit || mongoose.model('BillSplit', billSplitSchema);
