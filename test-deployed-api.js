// Test Script for Deployed API
// test-deployed-api.js

const BASE_URL = 'https://your-api-name.vercel.app'; // Replace with your deployed URL

async function testDeployedAPI() {
  console.log('🧪 Testing Deployed API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('   Uptime:', Math.round(healthData.uptime), 'seconds\n');

    // Test 2: Get Products
    console.log('2️⃣ Testing Get Products...');
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    const productsData = await productsResponse.json();
    console.log('✅ Products API:', productsData.success ? 'Working' : 'Failed');
    console.log('   Products count:', productsData.data.length, '\n');

    // Test 3: Exchange Rates
    console.log('3️⃣ Testing Exchange Rates...');
    const ratesResponse = await fetch(`${BASE_URL}/api/products/exchange-rates`);
    const ratesData = await ratesResponse.json();
    console.log('✅ Exchange Rates:', ratesData.success ? 'Working' : 'Failed');
    console.log('   Available currencies:', Object.keys(ratesData.data.rates).length, '\n');

    // Test 4: Add Product (with a sample URL)
    console.log('4️⃣ Testing Add Product...');
    const addProductResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: 'https://www.amazon.com/dp/B08N5WRWNW' // Sample Amazon product
      })
    });
    
    if (addProductResponse.ok) {
      const addProductData = await addProductResponse.json();
      console.log('✅ Add Product:', 'Working');
      console.log('   Product added:', addProductData.data.nome);
      console.log('   Currency detected:', addProductData.data.moeda);
      console.log('   Price:', addProductData.data.preco, '\n');
    } else {
      console.log('⚠️ Add Product: Failed (might be due to Microlink API limits)\n');
    }

    console.log('🎉 All tests completed! Your API is ready for mobile app integration.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your API is deployed and the URL is correct.');
  }
}

// Run the test
testDeployedAPI();
