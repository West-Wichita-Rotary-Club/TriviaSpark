import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
let sessionCookie = '';

// Helper function to make API calls with session cookie
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': sessionCookie,
    ...options.headers
  };
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  // Update session cookie if present
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && setCookie.includes('sessionId=')) {
    sessionCookie = setCookie;
  }
  
  return response;
}

async function testEndpoint(name, endpoint, options = {}) {
  try {
    console.log(`\n🧪 Testing ${name}: ${options.method || 'GET'} ${endpoint}`);
    const response = await apiCall(endpoint, options);
    const data = await response.text();
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ ${name}: Status ${response.status}`);
        if (jsonData.length !== undefined) {
          console.log(`   📊 Returned ${jsonData.length} items`);
        } else if (jsonData.id) {
          console.log(`   🆔 ID: ${jsonData.id}`);
        }
      } catch {
        console.log(`✅ ${name}: Status ${response.status} (non-JSON response)`);
      }
    } else {
      console.log(`❌ ${name}: Status ${response.status}`);
      console.log(`   Error: ${data}`);
    }
  } catch (error) {
    console.log(`💥 ${name}: Network error - ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests');
  console.log('===============================');

  // 1. Authentication Tests
  console.log('\n📝 === AUTHENTICATION ENDPOINTS ===');
  
  await testEndpoint('Login', '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'mark',
      password: 'mark123'
    })
  });

  await testEndpoint('Get Current User', '/api/auth/me');
  await testEndpoint('Debug Cookies', '/api/debug/cookies');

  // 2. Dashboard Tests
  console.log('\n📊 === DASHBOARD ENDPOINTS ===');
  
  await testEndpoint('Dashboard Stats', '/api/dashboard/stats');
  await testEndpoint('Dashboard Insights', '/api/dashboard/insights');

  // 3. Event Management Tests
  console.log('\n🎉 === EVENT MANAGEMENT ENDPOINTS ===');
  
  await testEndpoint('Get All Events', '/api/events');
  await testEndpoint('Get Active Events', '/api/events/active');

  // Get the seeded event ID for detailed tests
  const eventsResponse = await apiCall('/api/events');
  const events = await eventsResponse.json();
  const eventId = events.length > 0 ? events[0].id : 'seed-event-coast-to-cascades';
  const qrCode = events.length > 0 ? events[0].qrCode : 'rotary-cascades-2025';

  await testEndpoint('Get Event Details', `/api/events/${eventId}`);
  await testEndpoint('Get Event Questions', `/api/events/${eventId}/questions`);
  await testEndpoint('Get Event Fun Facts', `/api/events/${eventId}/fun-facts`);
  await testEndpoint('Get Event Teams', `/api/events/${eventId}/teams`);
  await testEndpoint('Get Event Participants', `/api/events/${eventId}/participants`);

  // 4. Public Event Access Tests
  console.log('\n🔓 === PUBLIC EVENT ACCESS ENDPOINTS ===');
  
  await testEndpoint('Check Event by QR Code', `/api/events/join/${qrCode}/check`);
  await testEndpoint('Get Teams (Public)', `/api/events/${qrCode}/teams-public`);

  // 5. Event Creation Test
  console.log('\n➕ === EVENT CREATION ENDPOINTS ===');
  
  await testEndpoint('Create New Event', '/api/events', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Event API',
      description: 'Testing event creation via API',
      eventType: 'general',
      maxParticipants: 20
    })
  });

  // 6. Team Management Tests
  console.log('\n👥 === TEAM MANAGEMENT ENDPOINTS ===');
  
  await testEndpoint('Create Team', `/api/events/${eventId}/teams`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'API Test Team',
      tableNumber: 99,
      maxMembers: 6
    })
  });

  // 7. AI Generation Tests
  console.log('\n🤖 === AI GENERATION ENDPOINTS ===');
  
  await testEndpoint('Generate Event Copy', `/api/events/${eventId}/generate-copy`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: 'Generate copy for a wine trivia event'
    })
  });

  // Note: Skipping OpenAI-dependent endpoints to avoid API costs
  console.log('\n⏭️  Skipping OpenAI-dependent endpoints:');
  console.log('   - POST /api/events/generate (requires OpenAI)');
  console.log('   - POST /api/questions/generate (requires OpenAI)');

  // 8. Participant Management Tests
  console.log('\n🙋 === PARTICIPANT ENDPOINTS ===');
  
  await testEndpoint('Join Event', `/api/events/join/${qrCode}`, {
    method: 'POST',
    body: JSON.stringify({
      participantName: 'API Test User',
      teamSelection: 'existing',
      teamIdentifier: 'SaraTeam'
    })
  });

  // 9. Response Tests
  console.log('\n💬 === RESPONSE ENDPOINTS ===');
  
  const questionsResponse = await apiCall(`/api/events/${eventId}/questions`);
  const questions = await questionsResponse.json();
  const questionId = questions.length > 0 ? questions[0].id : 'q1-wine-regions';

  // This would require a valid participant token, so we'll just test the structure
  await testEndpoint('Submit Response (will fail - no valid token)', '/api/responses', {
    method: 'POST',
    body: JSON.stringify({
      participantToken: 'test-token',
      questionId: questionId,
      answer: 'Test Answer'
    })
  });

  // 10. Profile Management
  console.log('\n👤 === PROFILE MANAGEMENT ENDPOINTS ===');
  
  await testEndpoint('Update Profile', '/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({
      fullName: 'Mark Test User',
      email: 'mark@test.com'
    })
  });

  // 11. Event Status Management
  console.log('\n🎬 === EVENT STATUS MANAGEMENT ===');
  
  await testEndpoint('Update Event Status', `/api/events/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'draft'
    })
  });

  // 12. Question Management
  console.log('\n❓ === QUESTION MANAGEMENT ===');
  
  await testEndpoint('Update Question', `/api/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      question: 'Updated question text',
      correctAnswer: 'Updated answer'
    })
  });

  // 13. Cleanup - Logout
  console.log('\n🚪 === CLEANUP ===');
  
  await testEndpoint('Logout', '/api/auth/logout', {
    method: 'POST'
  });

  console.log('\n🎉 API Endpoint Testing Complete!');
  console.log('=====================================');
}

runTests().catch(console.error);
