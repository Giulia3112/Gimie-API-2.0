// React Web App API Service
// src/services/gimieApi.js

const BASE_URL = 'http://localhost:3000';

class GimieApiService {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Add product
  async addProduct(url) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Get products
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/api/products?${queryParams}`);
  }

  // Get products with currency conversion
  async getProductsInCurrency(currency) {
    return this.request(`/api/products/convert/${currency}`);
  }

  // Convert product price
  async convertProductPrice(productId, targetCurrency) {
    return this.request(`/api/products/${productId}/convert/${targetCurrency}`);
  }

  // Get exchange rates
  async getExchangeRates(baseCurrency = 'USD') {
    return this.request(`/api/products/exchange-rates?base=${baseCurrency}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new GimieApiService();

