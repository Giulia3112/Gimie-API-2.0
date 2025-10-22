// React Native Component Example
// components/ProductScanner.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import GimieApi from '../api/gimieApi';

const ProductScanner = () => {
  const [url, setUrl] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('BRL');

  const handleAddProduct = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const result = await GimieApi.addProduct(url);
      Alert.alert('Success', 'Product added successfully!');
      setUrl('');
      loadProducts(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const result = await GimieApi.getProductsInCurrency(selectedCurrency);
      setProducts(result.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    }
  };

  const convertPrice = async (productId, fromCurrency, toCurrency) => {
    try {
      const result = await GimieApi.convertProductPrice(productId, toCurrency);
      Alert.alert(
        'Price Conversion',
        `${result.data.original.formatted} = ${result.data.converted.formatted}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to convert price');
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.imagem }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nome}</Text>
        <Text style={styles.productPrice}>{item.preco}</Text>
        <Text style={styles.productCurrency}>Currency: {item.moeda}</Text>
        <Text style={styles.productSite}>Site: {item.site}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.convertButton}
            onPress={() => convertPrice(item.id, item.moeda, 'USD')}
          >
            <Text style={styles.buttonText}>Convert to USD</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.convertButton}
            onPress={() => convertPrice(item.id, item.moeda, 'EUR')}
          >
            <Text style={styles.buttonText}>Convert to EUR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gimie Product Scanner</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter product URL (e.g., https://amazon.com/product)"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Add Product</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.currencyContainer}>
        <Text style={styles.currencyLabel}>View prices in:</Text>
        <TouchableOpacity
          style={[
            styles.currencyButton,
            selectedCurrency === 'BRL' && styles.currencyButtonActive
          ]}
          onPress={() => {
            setSelectedCurrency('BRL');
            loadProducts();
          }}
        >
          <Text style={styles.currencyText}>BRL</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.currencyButton,
            selectedCurrency === 'USD' && styles.currencyButtonActive
          ]}
          onPress={() => {
            setSelectedCurrency('USD');
            loadProducts();
          }}
        >
          <Text style={styles.currencyText}>USD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.currencyButton,
            selectedCurrency === 'EUR' && styles.currencyButtonActive
          ]}
          onPress={() => {
            setSelectedCurrency('EUR');
            loadProducts();
          }}
        >
          <Text style={styles.currencyText}>EUR</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        style={styles.productsList}
        onRefresh={loadProducts}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  currencyLabel: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  currencyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  currencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  currencyButtonActive: {
    backgroundColor: '#007AFF',
  },
  productsList: {
    flex: 1,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  productCurrency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productSite: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  convertButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
});

export default ProductScanner;

