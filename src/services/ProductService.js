const axios = require('axios');
const Database = require('../database/Database');
const CurrencyService = require('./CurrencyService');

class ProductService {
  constructor() {
    this.db = new Database();
    this.microlinkApiKey = process.env.MICROLINK_API_KEY;
    this.currencyService = new CurrencyService();
  }

  /**
   * Get all products with pagination and search
   */
  async getAllProducts({ page = 1, limit = 10, search = '' } = {}) {
    try {
      const offset = (page - 1) * limit;
      const products = await this.db.getProducts({ offset, limit, search });
      return products;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    try {
      const product = await this.db.getProductById(id);
      return product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  /**
   * Create product from URL using Microlink API
   */
  async createProductFromUrl(url) {
    try {
      // Check if product already exists
      const existingProduct = await this.db.getProductByUrl(url);
      if (existingProduct) {
        return existingProduct;
      }

      // Extract metadata from URL
      const metadata = await this.extractMetadata(url);
      
      // Extract price with currency detection
      const priceInfo = this.currencyService.extractPriceWithCurrency(metadata.description);
      
      // Detect currency from domain if price extraction failed
      const detectedCurrency = priceInfo?.currency || this.currencyService.detectCurrencyFromDomain(url);
      
      // Create product object
      const product = {
        nome: metadata.title || 'Sem título',
        preco: priceInfo?.formatted || 'Preço não disponível',
        preco_original: priceInfo?.original || '',
        moeda: detectedCurrency,
        valor_numerico: priceInfo?.amount || null,
        imagem: metadata.image?.url || '',
        url: metadata.url || url,
        descricao: metadata.description || '',
        site: this.extractDomain(url),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to database
      const savedProduct = await this.db.createProduct(product);
      return savedProduct;
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Update product
   */
  async updateProduct(id, updateData) {
    try {
      const product = await this.db.updateProduct(id, {
        ...updateData,
        updated_at: new Date().toISOString()
      });
      return product;
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    try {
      const deleted = await this.db.deleteProduct(id);
      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  /**
   * Extract metadata from URL using Microlink API
   */
  async extractMetadata(url) {
    try {
      const microlinkUrl = this.microlinkApiKey 
        ? `https://api.microlink.io/?url=${encodeURIComponent(url)}&apiKey=${this.microlinkApiKey}`
        : `https://api.microlink.io/?url=${encodeURIComponent(url)}`;

      const response = await axios.get(microlinkUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Gimie-API/2.0.0'
        }
      });

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded for Microlink API');
      }
      throw new Error(`Failed to extract metadata: ${error.message}`);
    }
  }

  /**
   * Extract price from text using improved regex
   */
  extractPrice(text) {
    if (!text) return null;
    
    // Multiple price patterns
    const patterns = [
      /R\$\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g, // R$ 1.234,56
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*reais?/gi, // 1234,56 reais
      /preço[:\s]*R?\$?\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi, // preço: R$ 1234,56
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Convert product price to target currency
   */
  async convertProductPrice(productId, targetCurrency) {
    try {
      const product = await this.db.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.valor_numerico || !product.moeda) {
        throw new Error('Product does not have valid price information');
      }

      const conversion = await this.currencyService.convertPrice(
        product.valor_numerico,
        product.moeda,
        targetCurrency
      );

      return {
        product: product,
        conversion: conversion,
        original: {
          amount: product.valor_numerico,
          currency: product.moeda,
          formatted: product.preco
        },
        converted: {
          amount: conversion.amount,
          currency: targetCurrency,
          formatted: conversion.formatted
        }
      };
    } catch (error) {
      throw new Error(`Failed to convert price: ${error.message}`);
    }
  }

  /**
   * Get products with prices converted to target currency
   */
  async getProductsWithCurrencyConversion(targetCurrency = 'BRL', { page = 1, limit = 10, search = '' } = {}) {
    try {
      const products = await this.getAllProducts({ page, limit, search });
      
      const convertedProducts = await Promise.all(
        products.map(async (product) => {
          if (product.valor_numerico && product.moeda && product.moeda !== targetCurrency) {
            try {
              const conversion = await this.currencyService.convertPrice(
                product.valor_numerico,
                product.moeda,
                targetCurrency
              );
              
              return {
                ...product,
                preco_convertido: conversion.formatted,
                moeda_convertida: targetCurrency,
                taxa_cambio: conversion.rate
              };
            } catch (error) {
              console.warn(`Failed to convert price for product ${product.id}:`, error.message);
              return product;
            }
          }
          return product;
        })
      );

      return convertedProducts;
    } catch (error) {
      throw new Error(`Failed to get products with currency conversion: ${error.message}`);
    }
  }

  /**
   * Get exchange rates
   */
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const rates = await this.currencyService.getExchangeRates(baseCurrency);
      return Object.fromEntries(rates);
    } catch (error) {
      throw new Error(`Failed to get exchange rates: ${error.message}`);
    }
  }
  extractDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch (error) {
      return 'unknown';
    }
  }
}

module.exports = ProductService;
