const request = require('supertest');
const app = require('../src/app');

describe('Gimie API v2.0.0', () => {
  
  describe('Health Endpoints', () => {
    test('GET /health should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    test('GET /health/detailed should return detailed health info', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);
      
      expect(response.body.status).toBe('OK');
      expect(response.body.memory).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });
  });

  describe('Root Endpoint', () => {
    test('GET / should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body.message).toBe('Gimie API v2.0.0');
      expect(response.body.version).toBe('2.0.0');
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Products Endpoints', () => {
    test('GET /api/products should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/products should validate URL input', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ url: 'invalid-url' })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    test('POST /api/products should reject empty URL', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('GET /api/products/:id should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('Error Handling', () => {
    test('Should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });
});
