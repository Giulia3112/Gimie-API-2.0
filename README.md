# Gimie API v2.0.0

## Overview

Gimie API is an advanced product link scraper that extracts product information from e-commerce URLs using the Microlink API. This version includes significant improvements over the original implementation.

## Features

- ✅ **Product URL Scraping**: Extract product metadata from e-commerce URLs
- ✅ **Multi-Currency Support**: Detect and convert prices in 8+ currencies
- ✅ **Persistent Storage**: SQLite database for data persistence
- ✅ **RESTful API**: Complete CRUD operations for products
- ✅ **Currency Conversion**: Real-time exchange rate conversion
- ✅ **Input Validation**: Comprehensive validation for URLs and product data
- ✅ **Error Handling**: Robust error handling with detailed error messages
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **Security**: Helmet.js for security headers
- ✅ **Performance**: Compression and caching
- ✅ **Health Checks**: Monitoring endpoints
- ✅ **Documentation**: Comprehensive API documentation

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Test the API**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Add a product from Brazilian site
   curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.amazon.com.br/product-url"}'
   
   # Add a product from US site
   curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.amazon.com/product-url"}'
   
   # Convert product price to BRL
   curl http://localhost:3000/api/products/1/convert/BRL
   
   # Get all products with prices in EUR
   curl http://localhost:3000/api/products/convert/EUR
   
   # Get current exchange rates
   curl http://localhost:3000/api/products/exchange-rates
   ```

## API Endpoints

### Products

- `GET /api/products` - List all products (with pagination and search)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product from URL
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Currency Conversion

- `GET /api/products/:id/convert/:currency` - Convert specific product price to target currency
- `GET /api/products/convert/:currency` - Get all products with prices converted to target currency
- `GET /api/products/exchange-rates` - Get current exchange rates

### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_PATH` | SQLite database path | ./data/products.db |
| `MICROLINK_API_KEY` | Microlink API key | (optional) |
| `ALLOWED_ORIGINS` | CORS allowed origins | * |

## Supported E-commerce Sites

- Amazon Brasil
- Mercado Livre
- Magazine Luiza
- Americanas/Submarino/Shoptime
- Nike/Adidas
- Zara/H&M
- Renner/C&A/Riachuelo

## Supported Currencies

- **BRL** - Brazilian Real (R$)
- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **JPY** - Japanese Yen (¥)
- **CAD** - Canadian Dollar (C$)
- **AUD** - Australian Dollar (A$)
- **MXN** - Mexican Peso (MX$)

## Currency Features

- **Automatic Detection**: Detects currency from URL domain and price text
- **Real-time Conversion**: Uses live exchange rates from exchangerate-api.com
- **Multiple Formats**: Supports various price formats (R$ 1.234,56, $1,234.56, €1.234,56)
- **Fallback Rates**: Uses cached rates when external API is unavailable
- **Domain Mapping**: Automatically detects currency based on e-commerce site region

## Improvements Made

### Architecture
- ✅ Modular structure with separation of concerns
- ✅ Service layer for business logic
- ✅ Database abstraction layer
- ✅ Middleware for cross-cutting concerns

### Security
- ✅ Input validation and sanitization
- ✅ Rate limiting
- ✅ Security headers (Helmet.js)
- ✅ CORS configuration

### Performance
- ✅ Database indexing
- ✅ Response compression
- ✅ Efficient pagination
- ✅ Connection pooling

### Reliability
- ✅ Comprehensive error handling
- ✅ Graceful shutdown
- ✅ Health monitoring
- ✅ Logging

### Developer Experience
- ✅ TypeScript-ready structure
- ✅ Comprehensive documentation
- ✅ Environment configuration
- ✅ Development scripts

## Migration from v1.0.0

The new version is backward compatible with some changes:

1. **Endpoints**: `/links` → `/api/products`
2. **Response Format**: Now includes `success` field and better error messages
3. **Database**: Now uses SQLite instead of memory storage
4. **Validation**: Enhanced input validation

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper database path
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

ISC License - see LICENSE file for details.
