// Test script to check upcoming events API response structure
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const baseUrl = 'http://localhost:14166';

async function testUpcomingEvents() {
  try {
    console.log('=== Testing Upcoming Events API ===');
    
    // First login to get session
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'mark',
        password: 'mark123'
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginResult = await loginResponse.json();
    console.log('Login successful:', loginResult);
    
    // Get session cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Session cookies:', cookies);
    
    // Get upcoming events
    console.log('\n2. Fetching upcoming events...');
    const eventsResponse = await fetch(`${baseUrl}/api/events/upcoming`, {
      headers: {
        'Cookie': cookies || ''
      },
      credentials: 'include'
    });
    
    if (!eventsResponse.ok) {
      throw new Error(`Events fetch failed: ${eventsResponse.status}`);
    }
    
    const events = await eventsResponse.json();
    console.log('\n=== UPCOMING EVENTS RESPONSE ===');
    console.log('Events count:', events.length);
    console.log('Full response:', JSON.stringify(events, null, 2));
    
    if (events.length > 0) {
      console.log('\n=== FIRST EVENT ANALYSIS ===');
      const firstEvent = events[0];
      console.log('Event keys:', Object.keys(firstEvent));
      console.log('Event.Id:', firstEvent.Id);
      console.log('Event.id:', firstEvent.id);
      console.log('Event.Title:', firstEvent.Title);
      console.log('Event.title:', firstEvent.title);
      console.log('Event.EventType:', firstEvent.EventType);
      console.log('Event.eventType:', firstEvent.eventType);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUpcomingEvents();
