const axios = require('axios');

class CurrencyService {
  constructor() {
    this.exchangeRates = new Map();
    this.lastUpdate = null;
    this.updateInterval = 60 * 60 * 1000; // 1 hour
  }

  /**
   * Currency patterns for different regions
   */
  getCurrencyPatterns() {
    return {
      // Brazilian Real
      BRL: [
        /R\$\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
        /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*reais?/gi,
        /preço[:\s]*R?\$?\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi
      ],
      
      // US Dollar
      USD: [
        /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*dollars?/gi,
        /price[:\s]*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
        /USD\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
      ],
      
      // Euro
      EUR: [
        /€\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
        /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*euros?/gi,
        /EUR\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g
      ],
      
      // British Pound
      GBP: [
        /£\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*pounds?/gi,
        /GBP\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
      ],
      
      // Japanese Yen
      JPY: [
        /¥\s?(\d{1,3}(?:,\d{3})*)/g,
        /(\d{1,3}(?:,\d{3})*)\s*yen/gi,
        /JPY\s?(\d{1,3}(?:,\d{3})*)/g
      ],
      
      // Canadian Dollar
      CAD: [
        /C\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /CAD\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
      ],
      
      // Australian Dollar
      AUD: [
        /A\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /AUD\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
      ],
      
      // Mexican Peso
      MXN: [
        /MX\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
        /MXN\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
      ]
    };
  }

  /**
   * Extract price with currency detection
   */
  extractPriceWithCurrency(text) {
    if (!text) return null;

    const patterns = this.getCurrencyPatterns();
    
    for (const [currency, currencyPatterns] of Object.entries(patterns)) {
      for (const pattern of currencyPatterns) {
        const match = text.match(pattern);
        if (match) {
          const priceText = match[0];
          const numericValue = this.extractNumericValue(priceText, currency);
          
          return {
            original: priceText,
            currency: currency,
            amount: numericValue,
            formatted: this.formatPrice(numericValue, currency)
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract numeric value from price text
   */
  extractNumericValue(priceText, currency) {
    // Remove currency symbols and text
    const cleanText = priceText
      .replace(/[R$€£¥C$A$MX$]/g, '')
      .replace(/reais?|dollars?|euros?|pounds?|yen|pesos?/gi, '')
      .replace(/USD|EUR|GBP|JPY|CAD|AUD|MXN|BRL/gi, '')
      .trim();

    // Handle different decimal separators
    if (currency === 'BRL' || currency === 'EUR') {
      // Brazilian/EU format: 1.234,56
      const parts = cleanText.split(',');
      if (parts.length === 2) {
        const integerPart = parts[0].replace(/\./g, '');
        const decimalPart = parts[1];
        return parseFloat(`${integerPart}.${decimalPart}`);
      } else {
        return parseFloat(cleanText.replace(/\./g, ''));
      }
    } else {
      // US format: 1,234.56
      return parseFloat(cleanText.replace(/,/g, ''));
    }
  }

  /**
   * Format price according to currency
   */
  formatPrice(amount, currency) {
    const formatters = {
      BRL: (amount) => `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      USD: (amount) => `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      EUR: (amount) => `€ ${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      GBP: (amount) => `£ ${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      JPY: (amount) => `¥ ${amount.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      CAD: (amount) => `C$ ${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      AUD: (amount) => `A$ ${amount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      MXN: (amount) => `MX$ ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };

    const formatter = formatters[currency];
    return formatter ? formatter(amount) : `${currency} ${amount}`;
  }

  /**
   * Get exchange rates from external API
   */
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const now = Date.now();
      
      // Use cached rates if less than 1 hour old
      if (this.lastUpdate && (now - this.lastUpdate) < this.updateInterval) {
        return this.exchangeRates;
      }

      // Fetch from exchangerate-api.com (free tier)
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, {
        timeout: 5000
      });

      this.exchangeRates = new Map(Object.entries(response.data.rates));
      this.lastUpdate = now;
      
      return this.exchangeRates;
    } catch (error) {
      console.warn('Failed to fetch exchange rates:', error.message);
      // Return default rates if API fails
      return this.getDefaultRates();
    }
  }

  /**
   * Get default exchange rates (fallback)
   */
  getDefaultRates() {
    return new Map([
      ['USD', 1],
      ['BRL', 5.2],
      ['EUR', 0.85],
      ['GBP', 0.73],
      ['JPY', 110],
      ['CAD', 1.25],
      ['AUD', 1.35],
      ['MXN', 20]
    ]);
  }

  /**
   * Convert price to target currency
   */
  async convertPrice(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates();
    
    // Convert to USD first, then to target currency
    const usdAmount = fromCurrency === 'USD' ? amount : amount / (rates.get(fromCurrency) || 1);
    const targetAmount = toCurrency === 'USD' ? usdAmount : usdAmount * (rates.get(toCurrency) || 1);
    
    return {
      amount: targetAmount,
      formatted: this.formatPrice(targetAmount, toCurrency),
      from: { amount, currency: fromCurrency },
      to: { amount: targetAmount, currency: toCurrency },
      rate: rates.get(toCurrency) || 1
    };
  }

  /**
   * Detect currency from URL domain
   */
  detectCurrencyFromDomain(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      const domainCurrencyMap = {
        'amazon.com.br': 'BRL',
        'mercadolivre.com.br': 'BRL',
        'magazineluiza.com.br': 'BRL',
        'americanas.com.br': 'BRL',
        'submarino.com.br': 'BRL',
        'shoptime.com.br': 'BRL',
        'amazon.com': 'USD',
        'amazon.ca': 'CAD',
        'amazon.co.uk': 'GBP',
        'amazon.de': 'EUR',
        'amazon.fr': 'EUR',
        'amazon.it': 'EUR',
        'amazon.es': 'EUR',
        'amazon.co.jp': 'JPY',
        'amazon.com.mx': 'MXN',
        'amazon.com.au': 'AUD',
        'ebay.com': 'USD',
        'ebay.co.uk': 'GBP',
        'ebay.de': 'EUR',
        'ebay.fr': 'EUR',
        'ebay.it': 'EUR',
        'ebay.es': 'EUR',
        'ebay.ca': 'CAD',
        'ebay.com.au': 'AUD'
      };

      for (const [domainPattern, currency] of Object.entries(domainCurrencyMap)) {
        if (domain.includes(domainPattern)) {
          return currency;
        }
      }

      return 'USD'; // Default fallback
    } catch (error) {
      return 'USD';
    }
  }
}

module.exports = CurrencyService;
