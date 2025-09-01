// Test login and fetch events exactly like the frontend does
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log("1. Attempting login...");
    
    // Step 1: Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'mark',
        password: 'mark123'
      }),
      redirect: 'manual' // Don't follow redirects
    });
    
    console.log("Login status:", loginResponse.status);
    console.log("Login headers:", Object.fromEntries(loginResponse.headers.entries()));
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log("Login error:", errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log("Login success:", loginData);
    
    // Extract session cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log("Set-Cookie header:", setCookieHeader);
    
    if (!setCookieHeader) {
      console.log("No session cookie received!");
      return;
    }
    
    // Step 2: Fetch events using the session cookie
    console.log("\n2. Fetching events...");
    const eventsResponse = await fetch('http://localhost:5000/api/events', {
      headers: {
        'Cookie': setCookieHeader
      }
    });
    
    console.log("Events status:", eventsResponse.status);
    
    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text();
      console.log("Events error:", errorText);
      return;
    }
    
    const eventsData = await eventsResponse.json();
    console.log("Events data:", JSON.stringify(eventsData, null, 2));
    
    // Step 3: Test the frontend filtering logic
    console.log("\n3. Testing frontend filtering logic...");
    const now = new Date();
    console.log("Current time:", now.toISOString());
    
    const upcomingEvents = eventsData?.filter(event => {
      if (!event.eventDate) return false;
      const eventDate = new Date(event.eventDate);
      console.log(`Event "${event.title}": eventDate="${event.eventDate}", parsed=${eventDate.toISOString()}, isUpcoming=${eventDate >= now}`);
      return eventDate >= now;
    }) || [];
    
    console.log("Filtered upcoming events:", upcomingEvents.length);
    upcomingEvents.forEach(event => {
      console.log(`- ${event.title} (${event.eventDate})`);
    });
    
  } catch (error) {
    console.error("Test error:", error);
  }
}

testLogin();
