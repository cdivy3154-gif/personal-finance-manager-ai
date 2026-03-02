/**
 * PUT/DELETE /api/transactions/:id
 * Update (PUT) or delete (DELETE) a transaction by ID
 */
const connectDB = require('../../lib/db');
const Transaction = require('../../lib/models/Transaction');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            const transaction = await Transaction.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!transaction) {
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            }

            return res.json({ success: true, data: transaction });
        } catch (error) {
            console.error('Error updating transaction:', error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({ success: false, message: messages.join(', ') });
            }
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const transaction = await Transaction.findByIdAndDelete(id);

            if (!transaction) {
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            }

            return res.json({ success: true, message: 'Transaction deleted' });
        } catch (error) {
            console.error('Error deleting transaction:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
