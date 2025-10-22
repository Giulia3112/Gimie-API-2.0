const express = require('express');
const router = express.Router();

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '2.0.0'
  });
});

/**
 * @route GET /health/detailed
 * @desc Detailed health check
 * @access Public
 */
router.get('/detailed', async (req, res) => {
  try {
    // You can add database connectivity checks here
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected', // Add actual DB check
      external_apis: {
        microlink: 'Available' // Add actual API check
      }
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Service unavailable',
      error: error.message
    });
  }
});

module.exports = router;
