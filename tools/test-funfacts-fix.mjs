#!/usr/bin/env node

/**
 * Test script to verify the fun facts endpoint fix
 */

const baseUrl = 'http://localhost:14166';
const seedEventId = 'seed-event-coast-to-cascades';

async function testFunFactsEndpoint() {
  try {
    console.log('🧪 Testing Fun Facts Endpoint Fix...\n');
    
    // Test 1: Login first to get session cookie
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mark',
        password: 'mark123'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    // Extract session cookie from response headers
    const setCookieHeaders = loginResponse.headers.raw()['set-cookie'];
    const sessionCookie = setCookieHeaders?.find(cookie => cookie.startsWith('sessionId='))?.split(';')[0];
    console.log('✅ Login successful');
    
    // Test 2: Test fun facts endpoint
    console.log('\n2. Testing fun facts endpoint...');
    const funFactsResponse = await fetch(`${baseUrl}/api/events/${seedEventId}/fun-facts`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie || '',
      },
    });
    
    if (!funFactsResponse.ok) {
      const errorText = await funFactsResponse.text();
      throw new Error(`Fun facts request failed: ${funFactsResponse.status} ${funFactsResponse.statusText}\n${errorText}`);
    }
    
    const funFacts = await funFactsResponse.json();
    console.log('✅ Fun facts endpoint working!');
    console.log(`📊 Retrieved ${funFacts.length} fun facts`);
    
    if (funFacts.length > 0) {
      console.log('\n📋 Sample fun fact:');
      const sample = funFacts[0];
      console.log(`   ID: ${sample.id}`);
      console.log(`   Title: ${sample.title}`);
      console.log(`   Content: ${sample.content.substring(0, 100)}...`);
      console.log(`   Order Index: ${sample.orderIndex} (${typeof sample.orderIndex})`);
      console.log(`   Is Active: ${sample.isActive} (${typeof sample.isActive})`);
      console.log(`   Created At: ${sample.createdAt} (${typeof sample.createdAt})`);
    }
    
    console.log('\n🎉 Test completed successfully! The fun facts endpoint is now working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testFunFactsEndpoint();
