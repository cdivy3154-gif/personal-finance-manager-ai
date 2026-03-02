/**
 * CORS Utility for Vercel Serverless Functions
 * Adds CORS headers and handles preflight requests
 */

function cors(handler) {
    return async (req, res) => {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        // Handle preflight
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        return handler(req, res);
    };
}

module.exports = cors;
