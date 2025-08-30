// Test database query using the same setup as the app
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./data/trivia.db",
});

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Get events for mark-user-id (same as the seeded user)
    const eventsResult = await client.execute({
      sql: "SELECT * FROM events WHERE host_id = ?",
      args: ["mark-user-id"]
    });
    
    console.log("Events found:", eventsResult.rows.length);
    console.log("Events data:", JSON.stringify(eventsResult.rows, null, 2));
    
    // Check current date vs event date
    const now = new Date();
    console.log("Current time:", now.toISOString());
    
    if (eventsResult.rows.length > 0) {
      const event = eventsResult.rows[0];
      console.log("Event date string:", event.event_date);
      if (event.event_date) {
        const eventDate = new Date(event.event_date);
        console.log("Parsed event date:", eventDate.toISOString());
        console.log("Is event in future?", eventDate >= now);
        console.log("Days until event:", Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
    }
    
  } catch (error) {
    console.error("Database error:", error);
  }
}

testDatabase();
