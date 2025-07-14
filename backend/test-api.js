// Simple test script to verify API endpoints
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testing Sales Manager API endpoints...\n');

  // Test 1: Dashboard metrics
  try {
    console.log('📊 Testing dashboard metrics...');
    const response = await fetch(`${BASE_URL}/sales-manager/dashboard/metrics/1`, {
      headers: {
        'x-user-role': 'salesmanager'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard metrics:', data);
    } else {
      console.log('❌ Dashboard metrics failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Dashboard metrics error:', error.message);
  }

  console.log('\n');

  // Test 2: Recent leads
  try {
    console.log('👥 Testing recent leads...');
    const response = await fetch(`${BASE_URL}/sales-manager/dashboard/recent-leads/1`, {
      headers: {
        'x-user-role': 'salesmanager'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Recent leads:', data);
    } else {
      console.log('❌ Recent leads failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Recent leads error:', error.message);
  }

  console.log('\n');

  // Test 3: All leads
  try {
    console.log('📋 Testing all leads...');
    const response = await fetch(`${BASE_URL}/sales-manager/leads/1`, {
      headers: {
        'x-user-role': 'salesmanager'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ All leads:', data);
    } else {
      console.log('❌ All leads failed:', response.status);
    }
  } catch (error) {
    console.log('❌ All leads error:', error.message);
  }
}

// Check if we can import fetch, if not provide instructions
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or you need to install node-fetch');
  console.log('To install node-fetch: npm install node-fetch');
  console.log('Or upgrade to Node.js 18+\n');
} else {
  testAPI();
} 