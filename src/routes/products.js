const express = require('express');
const router = express.Router();
const ProductService = require('../services/ProductService');
const { validateUrl, validateProduct } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Initialize ProductService lazily to avoid database connection issues during module load
let productService;
const getProductService = () => {
  if (!productService) {
    productService = new ProductService();
  }
  return productService;
};

/**
 * @route GET /api/products
 * @desc Get all products
 * @access Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  const products = await getProductService().getAllProducts({
    page: parseInt(page),
    limit: parseInt(limit),
    search
  });
  
  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: products.length
    }
  });
}));

/**
 * @route GET /api/products/:id
 * @desc Get product by ID
 * @access Public
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await getProductService().getProductById(id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
}));

/**
 * @route POST /api/products
 * @desc Create new product from URL
 * @access Public
 */
router.post('/', validateUrl, asyncHandler(async (req, res) => {
  const { url } = req.body;
  
  const product = await getProductService().createProductFromUrl(url);
  
  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully'
  });
}));

/**
 * @route PUT /api/products/:id
 * @desc Update product
 * @access Public
 */
router.put('/:id', validateProduct, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const product = await getProductService().updateProduct(id, updateData);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully'
  });
}));

/**
 * @route DELETE /api/products/:id
 * @desc Delete product
 * @access Public
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const deleted = await getProductService().deleteProduct(id);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

/**
 * @route GET /api/products/:id/convert/:currency
 * @desc Convert product price to target currency
 * @access Public
 */
router.get('/:id/convert/:currency', asyncHandler(async (req, res) => {
  const { id, currency } = req.params;
  
  const result = await getProductService().convertProductPrice(id, currency.toUpperCase());
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * @route GET /api/products/convert/:currency
 * @desc Get all products with prices converted to target currency
 * @access Public
 */
router.get('/convert/:currency', asyncHandler(async (req, res) => {
  const { currency } = req.params;
  const { page = 1, limit = 10, search } = req.query;
  
  const products = await getProductService().getProductsWithCurrencyConversion(
    currency.toUpperCase(),
    { page: parseInt(page), limit: parseInt(limit), search }
  );
  
  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: products.length
    }
  });
}));

/**
 * @route GET /api/products/exchange-rates
 * @desc Get current exchange rates
 * @access Public
 */
router.get('/exchange-rates', asyncHandler(async (req, res) => {
  const { base = 'USD' } = req.query;
  
  const rates = await getProductService().getExchangeRates(base.toUpperCase());
  
  res.json({
    success: true,
    data: {
      base: base.toUpperCase(),
      rates: rates,
      timestamp: new Date().toISOString()
    }
  });
}));

module.exports = router;
