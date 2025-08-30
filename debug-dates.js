// Debug script to test date comparisons
const eventDateString = "2025-09-13";
const now = new Date();
const eventDate = new Date(eventDateString);

console.log("=== Date Debugging ===");
console.log("Current time:", now.toISOString());
console.log("Current time (local):", now.toString());
console.log("Event date string:", eventDateString);
console.log("Event date parsed:", eventDate.toISOString());
console.log("Event date (local):", eventDate.toString());
console.log("Is event in future?", eventDate >= now);
console.log("Days difference:", Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

// Test different date formats
const testDates = [
  "2025-09-13",
  "2025-09-13T00:00:00",
  "2025-09-13T18:30:00",
  "September 13, 2025",
  "2025/09/13"
];

console.log("\n=== Date Parsing Tests ===");
testDates.forEach(dateStr => {
  const parsed = new Date(dateStr);
  console.log(`"${dateStr}" -> ${parsed.toISOString()} (future: ${parsed >= now})`);
});
