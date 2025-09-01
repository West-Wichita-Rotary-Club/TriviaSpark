#!/usr/bin/env node

/**
 * Test script to validate dashboard API calls
 */

// Test the authentication and dashboard API endpoints
async function testDashboardAPI() {
  const baseURL = 'http://localhost:14166/api';
  
  console.log('🧪 Testing Dashboard API Endpoints');
  console.log('===================================\n');

  try {
    // Test 1: Check /api/auth/me endpoint (should return 401 without session)
    console.log('1. Testing /api/auth/me (unauthenticated)...');
    try {
      const response = await fetch(`${baseURL}/auth/me`, {
        credentials: 'include'
      });
      console.log(`   Status: ${response.status}`);
      const data = await response.text();
      console.log(`   Response: ${data}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 2: Login with default credentials
    console.log('2. Testing login...');
    try {
      const loginResponse = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'mark',
          password: 'password123'
        })
      });
      
      console.log(`   Status: ${loginResponse.status}`);
      const loginData = await loginResponse.json();
      console.log(`   Response: ${JSON.stringify(loginData, null, 2)}\n`);

      if (loginResponse.ok) {
        // Test 3: Check /api/auth/me endpoint after login
        console.log('3. Testing /api/auth/me (authenticated)...');
        const authResponse = await fetch(`${baseURL}/auth/me`, {
          credentials: 'include'
        });
        console.log(`   Status: ${authResponse.status}`);
        const authData = await authResponse.json();
        console.log(`   Response: ${JSON.stringify(authData, null, 2)}\n`);

        // Test 4: Check /api/dashboard/stats endpoint
        console.log('4. Testing /api/dashboard/stats...');
        const statsResponse = await fetch(`${baseURL}/dashboard/stats`, {
          credentials: 'include'
        });
        console.log(`   Status: ${statsResponse.status}`);
        const statsData = await statsResponse.json();
        console.log(`   Response: ${JSON.stringify(statsData, null, 2)}\n`);

        // Test 5: Check /api/events endpoint
        console.log('5. Testing /api/events...');
        const eventsResponse = await fetch(`${baseURL}/events`, {
          credentials: 'include'
        });
        console.log(`   Status: ${eventsResponse.status}`);
        const eventsData = await eventsResponse.json();
        console.log(`   Response: ${JSON.stringify(eventsData, null, 2)}`);
        
        // Check if events have proper IDs
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          console.log('\n   📋 Event ID Analysis:');
          eventsData.forEach((event, index) => {
            console.log(`   Event ${index}: ID="${event.id}" (type: ${typeof event.id}), Title="${event.title}"`);
          });
        }
        console.log();

        // Test 6: Check /api/events/active endpoint
        console.log('6. Testing /api/events/active...');
        const activeEventsResponse = await fetch(`${baseURL}/events/active`, {
          credentials: 'include'
        });
        console.log(`   Status: ${activeEventsResponse.status}`);
        const activeEventsData = await activeEventsResponse.json();
        console.log(`   Response: ${JSON.stringify(activeEventsData, null, 2)}\n`);

        console.log('✅ Dashboard API validation complete!');
      } else {
        console.log('❌ Login failed, cannot test authenticated endpoints');
      }
    } catch (error) {
      console.log(`   Login error: ${error.message}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDashboardAPI().catch(console.error);
