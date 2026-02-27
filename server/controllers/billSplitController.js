/**
 * Bill Split Controller
 * Handles creation of group expenses, calculating splits, and tracking settlements.
 */
const BillSplit = require('../models/BillSplit');

/**
 * GET /api/bills
 * Get all bill splits
 */
exports.getBills = async (req, res) => {
    try {
        const bills = await BillSplit.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: bills.length, data: bills });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * POST /api/bills
 * Create a new bill split
 */
exports.createBill = async (req, res) => {
    try {
        const { description, totalAmount, participants, splitType } = req.body;

        // Split logic depending on type
        let calculatedParticipants = [];

        if (splitType === 'equal') {
            const splitAmount = totalAmount / participants.length;
            calculatedParticipants = participants.map(p => ({
                name: p.name,
                amountOwed: splitAmount,
                isPaid: p.name === 'Me' // Assume the creator has already paid their share
            }));
        } else {
            // Custom splits provided by client
            calculatedParticipants = participants;
        }

        const bill = await BillSplit.create({
            description,
            totalAmount,
            participants: calculatedParticipants
        });

        res.status(201).json({ success: true, data: bill });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * PUT /api/bills/:id/settle
 * Mark a participant's share as settled
 */
exports.settleParticipant = async (req, res) => {
    try {
        const { participantName } = req.body;
        const bill = await BillSplit.findById(req.params.id);

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

        res.status(200).json({ success: true, data: bill });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * DELETE /api/bills/:id
 * Delete a bill
 */
exports.deleteBill = async (req, res) => {
    try {
        const bill = await BillSplit.findById(req.params.id);

        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }

        await bill.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
