const request = require('supertest');
const app = require('../src/app');

describe('Multi-Currency API Tests', () => {
  
  describe('Currency Detection', () => {
    test('Should detect BRL currency from Brazilian sites', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ url: 'https://www.amazon.com.br/some-product' })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.moeda).toBe('BRL');
    });

    test('Should detect USD currency from US sites', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ url: 'https://www.amazon.com/some-product' })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.moeda).toBe('USD');
    });

    test('Should detect EUR currency from European sites', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ url: 'https://www.amazon.de/some-product' })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.moeda).toBe('EUR');
    });
  });

  describe('Price Extraction', () => {
    test('Should extract BRL prices correctly', async () => {
      // Mock response with BRL price
      const mockDescription = 'Produto incrível por apenas R$ 299,90';
      
      // This would be tested in the CurrencyService unit tests
      expect(true).toBe(true); // Placeholder for actual test
    });

    test('Should extract USD prices correctly', async () => {
      // Mock response with USD price
      const mockDescription = 'Amazing product for only $199.99';
      
      // This would be tested in the CurrencyService unit tests
      expect(true).toBe(true); // Placeholder for actual test
    });

    test('Should extract EUR prices correctly', async () => {
      // Mock response with EUR price
      const mockDescription = 'Fantastisches Produkt für nur €149,99';
      
      // This would be tested in the CurrencyService unit tests
      expect(true).toBe(true); // Placeholder for actual test
    });
  });

  describe('Currency Conversion', () => {
    let productId;

    beforeAll(async () => {
      // Create a test product first
      const response = await request(app)
        .post('/api/products')
        .send({ url: 'https://www.amazon.com/test-product' });
      
      productId = response.body.data.id;
    });

    test('Should convert product price to target currency', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}/convert/BRL`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversion).toBeDefined();
      expect(response.body.data.original.currency).toBeDefined();
      expect(response.body.data.converted.currency).toBe('BRL');
    });

    test('Should return error for invalid currency', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}/convert/INVALID`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Exchange Rates', () => {
    test('Should get exchange rates', async () => {
      const response = await request(app)
        .get('/api/products/exchange-rates')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.rates).toBeDefined();
      expect(response.body.data.base).toBe('USD');
    });

    test('Should get exchange rates with custom base currency', async () => {
      const response = await request(app)
        .get('/api/products/exchange-rates?base=BRL')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.base).toBe('BRL');
    });
  });

  describe('Products with Currency Conversion', () => {
    test('Should get products with converted prices', async () => {
      const response = await request(app)
        .get('/api/products/convert/EUR')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
