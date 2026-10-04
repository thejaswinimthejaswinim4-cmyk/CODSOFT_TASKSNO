const express = require('express');
const router = express.Router();

/**
 * @route   GET /health and GET /api/health
 * @desc    API Health check endpoint
 */
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'Contact Management API is running.',
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)}s`
    });
});

module.exports = router;
