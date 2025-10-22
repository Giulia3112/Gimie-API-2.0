const { body, param, validationResult } = require('express-validator');

/**
 * Validation middleware for URL input
 */
const validateUrl = [
  body('url')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('URL must be a valid HTTP or HTTPS URL')
    .isLength({ min: 10, max: 2048 })
    .withMessage('URL must be between 10 and 2048 characters')
    .custom((value) => {
      // Check for common e-commerce domains
      const allowedDomains = [
        'amazon.com.br', 'mercadolivre.com.br', 'magazineluiza.com.br',
        'americanas.com.br', 'submarino.com.br', 'shoptime.com.br',
        'nike.com.br', 'adidas.com.br', 'zara.com', 'hm.com',
        'renner.com.br', 'c&a.com.br', 'riachuelo.com.br'
      ];
      
      try {
        const url = new URL(value);
        const domain = url.hostname.toLowerCase().replace('www.', '');
        
        if (!allowedDomains.some(allowedDomain => domain.includes(allowedDomain))) {
          throw new Error('URL must be from a supported e-commerce site');
        }
        
        return true;
      } catch (error) {
        throw new Error('Invalid URL format');
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation middleware for product data
 */
const validateProduct = [
  body('nome')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters')
    .trim(),
  body('preco')
    .optional()
    .matches(/^R\$\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?$/)
    .withMessage('Price must be in format R$ 1.234,56'),
  body('imagem')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('descricao')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validation middleware for ID parameter
 */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateUrl,
  validateProduct,
  validateId
};
