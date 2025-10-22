// API Service for React Native
// api/gimieApi.js

const BASE_URL = 'http://localhost:3000'; // Change to your server IP for production

class GimieApiService {
  // Add a product from URL
  async addProduct(url) {
    try {
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product');
      }
      
      return data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Get all products
  async getProducts(page = 1, limit = 10, search = '') {
    try {
      const response = await fetch(
        `${BASE_URL}/api/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get products with currency conversion
  async getProductsInCurrency(currency = 'BRL') {
    try {
      const response = await fetch(`${BASE_URL}/api/products/convert/${currency}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Convert specific product price
  async convertProductPrice(productId, targetCurrency) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/products/${productId}/convert/${targetCurrency}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to convert price');
      }
      
      return data;
    } catch (error) {
      console.error('Error converting price:', error);
      throw error;
    }
  }

  // Get exchange rates
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const response = await fetch(
        `${BASE_URL}/api/products/exchange-rates?base=${baseCurrency}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch exchange rates');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export default new GimieApiService();

