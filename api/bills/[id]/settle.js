/**
 * POST /api/bills/:id/settle
 * Mark a participant's share as settled
 */
const connectDB = require('../../../lib/db');
const BillSplit = require('../../../lib/models/BillSplit');
const cors = require('../../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { id } = req.query;
        const { participantName } = req.body;
        const bill = await BillSplit.findById(id);

        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }

        // Find and update the participant
        const participant = bill.participants.find(p => p.name === participantName);
        if (!participant) {
            return res.status(404).json({ success: false, error: 'Participant not found in this bill' });
        }

        participant.isPaid = true;
        participant.paidAt = new Date();

        // Check if entire bill is now settled
        const allPaid = bill.participants.every(p => p.isPaid);
        const anyPaid = bill.participants.some(p => p.isPaid);

        if (allPaid) {
            bill.status = 'settled';
        } else if (anyPaid) {
            bill.status = 'partially';
        }

        await bill.save();

        return res.status(200).json({ success: true, data: bill });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});
