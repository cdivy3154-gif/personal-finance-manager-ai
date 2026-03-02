/**
 * /api/bills/:id and /api/bills/:id/settle
 * Handles DELETE bill and POST settle via catch-all route
 *
 * Vercel catch-all: req.query.params = ['<id>'] or ['<id>', 'settle']
 */
const connectDB = require('../../lib/db');
const BillSplit = require('../../lib/models/BillSplit');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    const params = req.query.params || [];
    const id = params[0];
    const action = params[1]; // 'settle' or undefined

    if (!id) {
        return res.status(400).json({ error: 'Missing bill ID' });
    }

    // POST /api/bills/:id/settle
    if (action === 'settle' && req.method === 'POST') {
        try {
            const { participantName } = req.body;
            const bill = await BillSplit.findById(id);

            if (!bill) {
                return res.status(404).json({ success: false, error: 'Bill not found' });
            }

            const participant = bill.participants.find(p => p.name === participantName);
            if (!participant) {
                return res.status(404).json({ success: false, error: 'Participant not found in this bill' });
            }

            participant.isPaid = true;
            participant.paidAt = new Date();

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
    }

    // DELETE /api/bills/:id
    if (!action && req.method === 'DELETE') {
        try {
            const bill = await BillSplit.findById(id);

            if (!bill) {
                return res.status(404).json({ success: false, error: 'Bill not found' });
            }

            await bill.deleteOne();
            return res.status(200).json({ success: true, data: {} });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
