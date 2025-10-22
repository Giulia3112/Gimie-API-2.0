// Security Configuration
// config/security.js

const SECURITY_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  
  // Rate Limiting (client-side)
  MAX_REQUESTS_PER_MINUTE: 60,
  
  // Request Timeout
  REQUEST_TIMEOUT: 10000, // 10 seconds
  
  // Retry Configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // CORS Configuration
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-app-domain.com'
  ],
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Gimie-Mobile-App/1.0.0'
  }
};

export default SECURITY_CONFIG;

