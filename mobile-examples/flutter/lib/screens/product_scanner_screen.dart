// Flutter Widget Example
// lib/screens/product_scanner_screen.dart

import 'package:flutter/material.dart';
import '../services/gimie_api_service.dart';

class ProductScannerScreen extends StatefulWidget {
  @override
  _ProductScannerScreenState createState() => _ProductScannerScreenState();
}

class _ProductScannerScreenState extends State<ProductScannerScreen> {
  final TextEditingController _urlController = TextEditingController();
  final GimieApiService _apiService = GimieApiService();
  
  List<dynamic> _products = [];
  String _selectedCurrency = 'BRL';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _addProduct() async {
    if (_urlController.text.trim().isEmpty) {
      _showSnackBar('Please enter a valid URL');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _apiService.addProduct(_urlController.text.trim());
      _urlController.clear();
      _showSnackBar('Product added successfully!');
      _loadProducts();
    } catch (e) {
      _showSnackBar('Error: ${e.toString()}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadProducts() async {
    try {
      final result = await _apiService.getProductsInCurrency(_selectedCurrency);
      setState(() {
        _products = result['data'] ?? [];
      });
    } catch (e) {
      _showSnackBar('Error loading products: ${e.toString()}');
    }
  }

  Future<void> _convertPrice(int productId, String fromCurrency, String toCurrency) async {
    try {
      final result = await _apiService.convertProductPrice(productId, toCurrency);
      final originalPrice = result['data']['original']['formatted'];
      final convertedPrice = result['data']['converted']['formatted'];
      
      _showDialog(
        'Price Conversion',
        '$originalPrice = $convertedPrice',
      );
    } catch (e) {
      _showSnackBar('Error converting price: ${e.toString()}');
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _showDialog(String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Gimie Product Scanner'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // URL Input Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: _urlController,
                      decoration: InputDecoration(
                        labelText: 'Product URL',
                        hintText: 'https://amazon.com/product',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.url,
                    ),
                    SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _addProduct,
                      child: _isLoading
                          ? CircularProgressIndicator(color: Colors.white)
                          : Text('Add Product'),
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: 16),
            
            // Currency Selection
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'View prices in:',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Row(
                      children: ['BRL', 'USD', 'EUR'].map((currency) {
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                            child: ElevatedButton(
                              onPressed: () {
                                setState(() => _selectedCurrency = currency);
                                _loadProducts();
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _selectedCurrency == currency
                                    ? Colors.blue
                                    : Colors.grey[300],
                                foregroundColor: _selectedCurrency == currency
                                    ? Colors.white
                                    : Colors.black,
                              ),
                              child: Text(currency),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: 16),
            
            // Products List
            Expanded(
              child: _products.isEmpty
                  ? Center(
                      child: Text(
                        'No products found.\nAdd a product to get started!',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadProducts,
                      child: ListView.builder(
                        itemCount: _products.length,
                        itemBuilder: (context, index) {
                          final product = _products[index];
                          return Card(
                            margin: EdgeInsets.only(bottom: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (product['imagem'] != null && product['imagem'].isNotEmpty)
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        product['imagem'],
                                        height: 200,
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return Container(
                                            height: 200,
                                            color: Colors.grey[300],
                                            child: Icon(Icons.image, size: 50),
                                          );
                                        },
                                      ),
                                    ),
                                  SizedBox(height: 12),
                                  Text(
                                    product['nome'] ?? 'Unknown Product',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  Text(
                                    product['preco'] ?? 'Price not available',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Currency: ${product['moeda'] ?? 'Unknown'}',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                  Text(
                                    'Site: ${product['site'] ?? 'Unknown'}',
                                    style: TextStyle(color: Colors.grey[600]),
                                  ),
                                  SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () => _convertPrice(
                                            product['id'],
                                            product['moeda'],
                                            'USD',
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.green,
                                            foregroundColor: Colors.white,
                                          ),
                                          child: Text('Convert to USD'),
                                        ),
                                      ),
                                      SizedBox(width: 8),
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () => _convertPrice(
                                            product['id'],
                                            product['moeda'],
                                            'EUR',
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.green,
                                            foregroundColor: Colors.white,
                                          ),
                                          child: Text('Convert to EUR'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }
}

