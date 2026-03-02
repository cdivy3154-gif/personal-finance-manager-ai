/**
 * GET /api/health
 * Health check endpoint
 */
const cors = require('../lib/cors');

module.exports = cors(async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
