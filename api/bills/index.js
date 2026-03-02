/**
 * GET/POST /api/bills
 * List all bills (GET) or create a new bill split (POST)
 */
const connectDB = require('../../lib/db');
const BillSplit = require('../../lib/models/BillSplit');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const bills = await BillSplit.find().sort({ createdAt: -1 });
            return res.status(200).json({ success: true, count: bills.length, data: bills });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { description, totalAmount, participants, splitType } = req.body;

            let calculatedParticipants = [];

            if (splitType === 'equal') {
                const splitAmount = totalAmount / participants.length;
                calculatedParticipants = participants.map(p => ({
                    name: p.name,
                    amountOwed: splitAmount,
                    isPaid: p.name === 'Me'
                }));
            } else {
                calculatedParticipants = participants;
            }

            const bill = await BillSplit.create({
                description,
                totalAmount,
                participants: calculatedParticipants
            });

            return res.status(201).json({ success: true, data: bill });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ success: false, error: messages });
            }
            return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
});
