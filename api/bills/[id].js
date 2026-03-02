/**
 * DELETE /api/bills/:id
 * Delete a bill by ID
 */
const connectDB = require('../../lib/db');
const BillSplit = require('../../lib/models/BillSplit');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectDB();

    try {
        const { id } = req.query;
        const bill = await BillSplit.findById(id);

        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }

        await bill.deleteOne();

        return res.status(200).json({ success: true, data: {} });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});
