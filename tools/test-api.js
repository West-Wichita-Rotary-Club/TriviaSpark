// Test API endpoint directly
import fetch from 'node-fetch';

async function testAPI() {
  try {
    // First login
    console.log("Logging in...");
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'mark',
        password: 'mark123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log("Login response:", loginData);
    
    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log("Cookies:", cookies);
    
    if (!cookies) {
      console.log("No cookies returned from login");
      return;
    }
    
    // Extract session ID
    const sessionMatch = cookies.match(/sessionId=([^;]+)/);
    if (!sessionMatch) {
      console.log("No sessionId found in cookies");
      return;
    }
    
    const sessionId = sessionMatch[1];
    console.log("Session ID:", sessionId);
    
    // Now get events
    console.log("\nFetching events...");
    const eventsResponse = await fetch('http://localhost:5000/api/events', {
      headers: {
        'Cookie': `sessionId=${sessionId}`
      }
    });
    
    const eventsData = await eventsResponse.json();
    console.log("Events response:", JSON.stringify(eventsData, null, 2));
    
    // Check if events data contains the expected event
    if (Array.isArray(eventsData) && eventsData.length > 0) {
      const event = eventsData[0];
      console.log("\nEvent analysis:");
      console.log("Event title:", event.title);
      console.log("Event date:", event.eventDate);
      console.log("Event date type:", typeof event.eventDate);
      
      if (event.eventDate) {
        const eventDate = new Date(event.eventDate);
        const now = new Date();
        console.log("Parsed event date:", eventDate.toISOString());
        console.log("Current time:", now.toISOString());
        console.log("Is event in future?", eventDate >= now);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testAPI();
