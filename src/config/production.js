// Production Configuration
// src/config/production.js

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Database configuration
  database: {
    // For production, use environment variable or cloud database
    path: process.env.DATABASE_PATH || './data/products.db'
  },
  
  // External APIs
  microlink: {
    apiKey: process.env.MICROLINK_API_KEY,
    baseUrl: 'https://api.microlink.io'
  },
  
  // CORS configuration for production
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://your-app-domain.com',
      'https://your-mobile-app.com'
    ]
  },
  
  // Rate limiting for production
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;
