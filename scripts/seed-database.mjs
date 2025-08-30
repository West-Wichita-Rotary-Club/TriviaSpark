#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * This script migrates the mock data from storage.ts into the SQLite database.
 * It creates users, events, questions, teams, participants, and fun facts.
 * 
 * Usage: node scripts/seed-database.mjs
 * Called by: npm run seed
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🌱 Seeding database with mock data from storage.ts...');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'file:./data/trivia.db';
const dbPath = join(rootDir, 'data', 'trivia.db');

// Check if database exists
if (!existsSync(dbPath)) {
  console.log('❌ SQLite database not found. Please run "npm run dev" first to create the database.');
  process.exit(1);
}

try {
  // Create database connection
  const client = createClient({
    url: DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🔍 Checking existing data...');
  const existingUsers = await client.execute('SELECT COUNT(*) as count FROM users');
  const existingEvents = await client.execute('SELECT COUNT(*) as count FROM events');
  
  if (existingUsers.rows[0].count > 0 || existingEvents.rows[0].count > 0) {
    console.log('⚠️  Database already contains data. Skipping seed to avoid duplicates.');
    console.log('   To reseed, delete the database file and run "npm run dev" first.');
    await client.close();
    process.exit(0);
  }

  console.log('👥 Seeding users...');
  
  // Insert demo users
  await client.execute({
    sql: `INSERT INTO users (id, username, email, password, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      "demo-user-id",
      "markhazleton", 
      "mark@webspark.dev",
      "hashed-password",
      "Mark Hazleton",
      new Date().toISOString()
    ]
  });

  await client.execute({
    sql: `INSERT INTO users (id, username, email, password, full_name, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      "mark-user-id",
      "mark",
      "mark@triviaspark.com", 
      "mark123",
      "Mark Hazleton",
      new Date().toISOString()
    ]
  });

  console.log('🎉 Seeding events...');
  
  // Insert seeded event
  const eventId = "seed-event-coast-to-cascades";
  await client.execute({
    sql: `INSERT INTO events (
      id, title, description, host_id, event_type, status, qr_code, max_participants, difficulty,
      logo_url, background_image_url, event_copy, welcome_message, thank_you_message,
      primary_color, secondary_color, font_family, contact_email, contact_phone, website_url, social_links,
      prize_information, event_rules, special_instructions, accessibility_info, dietary_accommodations,
      dress_code, age_restrictions, technical_requirements, registration_deadline, cancellation_policy,
      refund_policy, sponsor_information, settings, event_date, event_time, location, sponsoring_organization,
      created_at, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      eventId,
      "Coast to Cascades Wine & Trivia Evening",
      "An elegant evening combining Pacific Northwest wines with engaging trivia, supporting West Wichita Rotary Club's community initiatives.",
      "mark-user-id",
      "wine_dinner",
      "draft",
      "rotary-cascades-2025",
      50,
      "mixed",
      "https://example.com/rotary-logo.png",
      "https://example.com/wine-background.jpg",
      "Experience an unforgettable evening where fine wine meets friendly competition! Join us for Coast to Cascades Wine & Trivia Night, where every sip and every answer helps support our local community. With carefully curated Pacific Northwest wines and engaging trivia questions, this elegant fundraiser promises both sophistication and fun.",
      "Welcome to Coast to Cascades Wine & Trivia Night! We're thrilled to have you join us for this special evening of wine, wisdom, and wonderful causes. Get ready for an exciting trivia experience while supporting our community!",
      "Thank you for participating in Coast to Cascades Wine & Trivia Night! Your involvement helps us continue supporting local charities and making a difference in our community. We hope you enjoyed the evening!",
      "#7C2D12",
      "#FEF3C7", 
      "Inter",
      "events@westwichitarotary.org",
      "(316) 555-0123",
      "https://westwichitarotary.org",
      JSON.stringify({
        facebook: "https://www.facebook.com/rotaryofwestwichita",
        linkedin: "https://www.linkedin.com/company/rotaryofwestwichita/"
      }),
      "1st Place: $500 Wine Country Gift Package\\n2nd Place: $300 Local Restaurant Gift Cards\\n3rd Place: $200 Wine Selection\\nAll participants receive a commemorative wine glass and local business discount cards!",
      "• Teams of 2-6 participants\\n• No smartphones or electronic devices during questions\\n• Wine tasting between rounds is encouraged\\n• Be respectful to all participants and volunteers\\n• Have fun and support a great cause!",
      "Please arrive 30 minutes early for check-in and wine selection. Designated driver arrangements are encouraged. Business casual or cocktail attire suggested.",
      "The venue is wheelchair accessible with elevator access to all floors. Large print question sheets available upon request. Please contact us for any specific accommodation needs.",
      "Light appetizers will be served. Vegetarian and gluten-free options available. Please contact us 48 hours in advance for specific dietary requirements.",
      "Business casual or cocktail attire",
      "21+ for wine tasting, 18+ for trivia participation",
      "No technical requirements - all materials provided",
      new Date("2025-09-10T23:59:59-05:00").getTime(), // Registration deadline 3 days before event (CST)
      "Full refund available until 72 hours before the event. After that, 50% refund is available until 24 hours before. No refunds within 24 hours of the event.",
      "Refunds processed within 5-7 business days to the original payment method. Processing fees may apply.",
      JSON.stringify({
        name: "Pacific Northwest Wine Distributors",
        logoUrl: "https://example.com/sponsor-logo.png",
        website: "https://pnwwine.com",
        description: "Leading distributor of premium Pacific Northwest wines, proudly supporting community fundraising events throughout the region."
      }),
      "{}",
      new Date("2025-09-13T18:30:00-05:00").getTime(), // Event date and time in CST
      "6:30 PM",
      "Riverside Conference Center",
      "West Wichita Rotary Club",
      new Date().getTime(), // Use current timestamp for created_at
      null,
      null
    ]
  });

  console.log('❓ Seeding questions...');
  
  // Insert base questions
  const baseQuestions = [
    {
      id: "q1-wine-regions",
      question: "Which Pacific Northwest wine region is known as Oregon's premier Pinot Noir producing area?",
      options: ["Willamette Valley", "Columbia Valley", "Walla Walla Valley", "Yakima Valley"],
      correctAnswer: "Willamette Valley",
      explanation: "The Willamette Valley is Oregon's most famous wine region, producing some of the world's finest Pinot Noir thanks to its unique climate and volcanic soils.",
      category: "wine",
      backgroundImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 1
    },
    {
      id: "q2-rotary-service", 
      question: "What is Rotary International's primary focus in community service?",
      options: ["Environmental conservation", "Education and literacy", "Service Above Self", "Economic development"],
      correctAnswer: "Service Above Self",
      explanation: "Rotary's motto 'Service Above Self' encapsulates the organization's core philosophy of putting service to others before personal interests.",
      category: "rotary",
      backgroundImageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 2
    },
    {
      id: "q3-pacific-northwest",
      question: "Mount Rainier, the iconic peak visible from Seattle, reaches what elevation?",
      options: ["12,330 feet", "14,411 feet", "16,050 feet", "11,249 feet"],
      correctAnswer: "14,411 feet",
      explanation: "Mount Rainier stands at 14,411 feet, making it the highest peak in the Cascade Range and a prominent feature of the Pacific Northwest landscape.",
      category: "geography",
      backgroundImageUrl: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 3
    },
    {
      id: "q4-oregon-wine-variety",
      question: "Which grape variety is Oregon's signature and most widely planted wine grape, spanning from the Coast Range to the Cascade Mountains?",
      options: ["Chardonnay", "Pinot Noir", "Riesling", "Cabernet Sauvignon"],
      correctAnswer: "Pinot Noir",
      explanation: "Pinot Noir is Oregon's flagship grape variety, thriving in the cool climate and representing about 58% of all wine grape plantings in the state.",
      category: "wine",
      backgroundImageUrl: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 4
    },
    {
      id: "q5-oregon-geographic-feature",
      question: "What major geographic feature creates the natural boundary between Oregon's wine regions and influences their climate patterns from coast to mountains?",
      options: ["Columbia River", "Coast Range", "Cascade Mountains", "Blue Mountains"],
      correctAnswer: "Cascade Mountains",
      explanation: "The Cascade Mountains create a rain shadow effect, giving Oregon's wine regions their Mediterranean-like climate with wet winters and dry summers.",
      category: "geography", 
      backgroundImageUrl: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 5
    },
    {
      id: "q6-oregon-coast-lighthouse",
      question: "Which iconic Oregon Coast lighthouse, featured in countless photographs, stands on a basalt headland near Florence?",
      options: ["Yaquina Head Lighthouse", "Heceta Head Lighthouse", "Cape Blanco Lighthouse", "Tillamook Rock Lighthouse"],
      correctAnswer: "Heceta Head Lighthouse",
      explanation: "Heceta Head Lighthouse, built in 1894, is one of the most photographed lighthouses in the world and sits dramatically on a 205-foot cliff overlooking the Pacific Ocean.",
      category: "geography",
      backgroundImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 6
    },
    {
      id: "q7-cascade-volcanic-peak",
      question: "Which Cascade Mountain peak famously erupted in 1980, reducing its height by 1,314 feet?",
      options: ["Mount Hood", "Mount Bachelor", "Mount St. Helens", "Mount Jefferson"],
      correctAnswer: "Mount St. Helens",
      explanation: "Mount St. Helens erupted catastrophically on May 18, 1980, in the most significant volcanic event in the contiguous United States in modern times, reducing its elevation from 9,677 to 8,363 feet.",
      category: "geography",
      backgroundImageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 7
    },
    {
      id: "q8-oregon-coast-haystack",
      question: "The famous Haystack Rock, a 235-foot sea stack that's home to diverse tidepools, is located at which Oregon Coast beach town?",
      options: ["Astoria", "Cannon Beach", "Bandon", "Newport"],
      correctAnswer: "Cannon Beach",
      explanation: "Haystack Rock at Cannon Beach is one of Oregon's most recognizable landmarks and a designated Oregon Islands National Wildlife Refuge, providing habitat for seabirds and marine life.",
      category: "geography",
      backgroundImageUrl: "https://images.unsplash.com/photo-1541555725491-80bff3948838?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 8
    },
    {
      id: "q9-cascade-lakes-highway",
      question: "The scenic Cascade Lakes Highway loops around which major Cascade peak, offering access to numerous alpine lakes and ski areas?",
      options: ["Mount Hood", "Mount Bachelor", "Three Sisters", "Broken Top"],
      correctAnswer: "Mount Bachelor",
      explanation: "The Cascade Lakes Highway (Century Drive) forms a scenic loop around Mount Bachelor near Bend, providing access to dozens of pristine alpine lakes and the popular Mount Bachelor Ski Area.",
      category: "geography",
      backgroundImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 9
    },
    {
      id: "q10-oregon-coast-dunes",
      question: "The Oregon Dunes National Recreation Area, featuring massive coastal sand dunes that reach heights up to 500 feet, stretches along the coast near which city?",
      options: ["Lincoln City", "Florence", "Brookings", "Seaside"],
      correctAnswer: "Florence",
      explanation: "The Oregon Dunes National Recreation Area spans 40 square miles along the coast near Florence, creating the largest expanse of coastal sand dunes in North America and a unique desert-like landscape.",
      category: "geography",
      backgroundImageUrl: "https://images.unsplash.com/photo-1507043235143-c2b53cd9ba37?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      orderIndex: 10
    }
  ];

  for (const question of baseQuestions) {
    await client.execute({
      sql: `INSERT INTO questions (
        id, event_id, type, question, options, correct_answer, explanation, difficulty, category,
        background_image_url, points, time_limit, order_index, ai_generated, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        question.id,
        eventId,
        "multiple_choice",
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.explanation,
        "medium",
        question.category,
        question.backgroundImageUrl,
        100,
        30,
        question.orderIndex,
        0,
        new Date().toISOString()
      ]
    });
  }

  console.log('🎯 Seeding fun facts...');
  
  // Insert fun facts
  const funFacts = [
    {
      id: "ff1-musical-tradition",
      title: "Musical Holiday Tradition", 
      content: "The club hosts an annual Holiday Lunch featuring performances by the Friends University Concert Choir, a tradition started by founding member Dr. David Weber that continues nearly 40 years later! 🎵",
      orderIndex: 1
    },
    {
      id: "ff2-oregon-wine-facts",
      title: "Oregon Wine Pioneer",
      content: "David Lett, known as 'Papa Pinot,' planted Oregon's first Pinot Noir vines in 1965 in the Dundee Hills. His 1975 Pinot Noir shocked the wine world by placing second in a blind tasting against top French Burgundies! 🍷",
      orderIndex: 2
    },
    {
      id: "ff3-rotary-foundation",
      title: "Rotary's Global Impact",
      content: "The Rotary Foundation has helped immunize more than 2.5 billion children against polio since 1985, bringing the world closer to eradicating this disease completely! 💉",
      orderIndex: 3
    },
    {
      id: "ff4-pacific-northwest-climate",
      title: "Perfect Wine Climate",
      content: "Oregon's Willamette Valley shares the same latitude (45°N) as Burgundy, France, which explains why Pinot Noir thrives so well in both regions! 🌍",
      orderIndex: 4
    },
    {
      id: "ff5-community-service",
      title: "Service Above Self",
      content: "Rotary clubs worldwide contribute over 47 million volunteer hours annually, with members donating their time to projects ranging from literacy programs to clean water initiatives! 🤝",
      orderIndex: 5
    }
  ];

  for (const funFact of funFacts) {
    await client.execute({
      sql: `INSERT INTO fun_facts (id, event_id, title, content, order_index, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        funFact.id,
        eventId,
        funFact.title,
        funFact.content,
        funFact.orderIndex,
        1,
        new Date().toISOString()
      ]
    });
  }

  console.log('👥 Seeding teams...');
  
  // Insert teams
  const teams = [
    { id: "team-sara-team", name: "SaraTeam", tableNumber: 1 },
    { id: "team-john-team", name: "JohnTeam", tableNumber: 2 }
  ];

  for (const team of teams) {
    await client.execute({
      sql: `INSERT INTO teams (id, event_id, name, table_number, max_members, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        team.id,
        eventId,
        team.name,
        team.tableNumber,
        6,
        new Date().toISOString()
      ]
    });
  }

  console.log('🙋 Seeding participants...');
  
  // Insert participants
  const participants = [
    { id: "participant-sara", name: "Sara", teamId: "team-sara-team", token: "sara-token-12345" },
    { id: "participant-john", name: "John", teamId: "team-john-team", token: "john-token-67890" }
  ];

  for (const participant of participants) {
    await client.execute({
      sql: `INSERT INTO participants (id, event_id, name, team_id, participant_token, joined_at, last_active_at, is_active, can_switch_team) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        participant.id,
        eventId,
        participant.name,
        participant.teamId,
        participant.token,
        new Date().toISOString(),
        new Date().toISOString(),
        1,
        1
      ]
    });
  }

  await client.close();

  console.log('✅ Database seeding complete!');
  console.log('');
  console.log('📊 Seeded data:');
  console.log('   👥 Users: 2 (demo-user, mark)');
  console.log('   🎉 Events: 1 (Coast to Cascades Wine & Trivia Evening)');
  console.log('   ❓ Questions: 10 (wine, rotary, geography, oregon coast, cascade mountains)');
  console.log('   🎯 Fun Facts: 5 (rotary & wine trivia)');
  console.log('   👥 Teams: 2 (SaraTeam, JohnTeam)');
  console.log('   🙋 Participants: 2 (Sara, John)');
  console.log('');
  console.log('🚀 Ready to test:');
  console.log('   • Run "npm run dev" to start server');
  console.log('   • Login with: mark / mark123');
  console.log('   • Run "npm run extract-data" to pull data for static build');
  console.log('   • Run "npm run build:static" to create GitHub Pages deployment');

} catch (error) {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
}
