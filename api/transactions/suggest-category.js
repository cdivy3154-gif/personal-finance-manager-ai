/**
 * GET /api/transactions/suggest-category
 * Suggest category for a description
 */
const { autoCategorize } = require('../../lib/utils/categorize');
const cors = require('../../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { description } = req.query;
        const category = autoCategorize(description);
        return res.json({ success: true, category });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
