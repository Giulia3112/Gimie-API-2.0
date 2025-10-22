// Flutter API Service
// lib/services/gimie_api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class GimieApiService {
  static const String baseUrl = 'http://localhost:3000'; // Change to your server IP

  // Add a product from URL
  Future<Map<String, dynamic>> addProduct(String url) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/products'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'url': url}),
      );

      if (response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to add product: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error adding product: $e');
    }
  }

  // Get all products
  Future<Map<String, dynamic>> getProducts({
    int page = 1,
    int limit = 10,
    String search = '',
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/products?page=$page&limit=$limit&search=${Uri.encodeComponent(search)}'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to fetch products: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching products: $e');
    }
  }

  // Get products with currency conversion
  Future<Map<String, dynamic>> getProductsInCurrency(String currency) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/products/convert/$currency'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to fetch products: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching products: $e');
    }
  }

  // Convert specific product price
  Future<Map<String, dynamic>> convertProductPrice(int productId, String targetCurrency) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/products/$productId/convert/$targetCurrency'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to convert price: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error converting price: $e');
    }
  }

  // Get exchange rates
  Future<Map<String, dynamic>> getExchangeRates({String baseCurrency = 'USD'}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/products/exchange-rates?base=$baseCurrency'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to fetch exchange rates: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error fetching exchange rates: $e');
    }
  }

  // Health check
  Future<Map<String, dynamic>> healthCheck() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/health'));
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Health check failed: ${response.body}');
      }
    } catch (e) {
      throw Exception('Health check error: $e');
    }
  }
}

