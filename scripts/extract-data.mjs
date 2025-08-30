#!/usr/bin/env node

/**
 * Data Extraction Script for Static Build
 * 
 * This script extracts data from the SQLite database and generates
 * a TypeScript file with the latest data for static builds.
 * 
 * Usage: node scripts/extract-data.mjs
 * Called automatically by: npm run build:static
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataDirPath = join(rootDir, 'client', 'src', 'data');
const fallbackDataModulePath = join(dataDirPath, 'fallback-data.ts');

// Helper: generate fallback content (inline on CI or when module missing)
const generateFallbackContent = () => {
  const preferInline = process.env.CI === 'true' || !existsSync(fallbackDataModulePath);
  if (preferInline) {
    const now = new Date().toISOString();
    return `// Fallback demo data for static build (inline)
// Last updated: ${now}
// Using inline minimal demo data (no database found in CI or fallback module missing)

export const demoEvent = null as const;
export const demoQuestions: any[] = [];
export const demoFunFacts: any[] = [];

export const allEvents: any[] = [];

export const buildInfo = {
  extractedAt: "${now}",
  databaseUrl: "fallback",
  eventsCount: 0,
  questionsCount: 0,
  funFactsCount: 0,
  primaryEventId: null,
  usingFallbackData: true,
};
`;
  }

  // Use richer local fallback module when available (non-CI dev machines)
  return `// Fallback demo data for static build
// Last updated: ${new Date().toISOString()}
// Using default demo data (no database found)

import { demoEvent as fallbackEvent, demoQuestions as fallbackQuestions, demoFunFacts as fallbackFunFacts } from './fallback-data';

export const demoEvent = fallbackEvent;
export const demoQuestions = fallbackQuestions;
export const demoFunFacts = fallbackFunFacts;

export const allEvents = fallbackEvent ? [fallbackEvent] : [];

export const buildInfo = {
  extractedAt: "${new Date().toISOString()}",
  databaseUrl: "fallback",
  eventsCount: fallbackEvent ? 1 : 0,
  questionsCount: fallbackQuestions?.length || 0,
  funFactsCount: fallbackFunFacts?.length || 0,
  primaryEventId: fallbackEvent?.id || null,
  usingFallbackData: true,
};
`;
};

// Import schema (using dynamic import since we're in .mjs)
const schemaPath = join(rootDir, 'shared', 'schema.ts');

console.log('🔍 Extracting data from SQLite database...');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'file:./data/trivia.db';
const dbPath = join(rootDir, 'data', 'trivia.db');

// Check if database exists
if (!existsSync(dbPath)) {
  console.log('⚠️  No SQLite database found. Using default demo data.');
  console.log('   To include real data in static build:');
  console.log('   1. Run "npm run dev" to create database');
  console.log('   2. Add your events and questions');
  console.log('   3. Run "npm run build:static" again');
  
  // Create fallback demo data file
  console.log('📝 Creating fallback demo data file...');
  // Ensure output directory exists
  const dataDir = dataDirPath;
  try { mkdirSync(dataDir, { recursive: true }); } catch {}
  const fallbackPath = join(dataDir, 'demoData.ts');
  const fallbackContent = generateFallbackContent();
  
  writeFileSync(fallbackPath, fallbackContent, 'utf8');
  console.log('✅ Fallback demo data file created!');
  process.exit(0);
}

try {
  // Create database connection
  const client = createClient({
    url: DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client);

  // Check if tables exist first
  console.log('🔍 Checking database structure...');
  const tablesResult = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  const tableNames = tablesResult.rows.map(row => row.name);
  
  console.log(`📋 Found tables: ${tableNames.join(', ')}`);

  if (!tableNames.includes('events')) {
    console.log('⚠️  Database tables not found. Please run "npm run dev" first to initialize schema.');
    console.log('📝 Creating fallback demo data file...');
  // Ensure output directory exists
  const dataDir = dataDirPath;
  try { mkdirSync(dataDir, { recursive: true }); } catch {}
  const fallbackPath = join(dataDir, 'demoData.ts');
  const fallbackContent = generateFallbackContent();
    
    writeFileSync(fallbackPath, fallbackContent, 'utf8');
    console.log('✅ Fallback demo data file created!');
    process.exit(0);
  }

  // Since we can't import TypeScript schema directly in .mjs,
  // we'll use raw SQL queries to extract the data
  
  console.log('📊 Querying events...');
  const eventsResult = await client.execute('SELECT * FROM events ORDER BY created_at DESC LIMIT 5');
  
  console.log('❓ Querying questions...');
  const questionsResult = await client.execute('SELECT * FROM questions ORDER BY order_index ASC');
  
  console.log('🎉 Querying fun facts...');
  const funFactsResult = await client.execute('SELECT * FROM fun_facts WHERE is_active = 1 ORDER BY order_index ASC');

  // Transform the data to match our TypeScript interfaces
  const events = eventsResult.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    hostId: row.host_id,
    eventType: row.event_type,
    status: row.status,
    qrCode: row.qr_code,
    maxParticipants: row.max_participants,
    difficulty: row.difficulty,
    logoUrl: row.logo_url,
    backgroundImageUrl: row.background_image_url,
    eventCopy: row.event_copy,
    welcomeMessage: row.welcome_message,
    thankYouMessage: row.thank_you_message,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    fontFamily: row.font_family,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    websiteUrl: row.website_url,
    socialLinks: row.social_links,
    prizeInformation: row.prize_information,
    eventRules: row.event_rules,
    specialInstructions: row.special_instructions,
    accessibilityInfo: row.accessibility_info,
    dietaryAccommodations: row.dietary_accommodations,
    dressCode: row.dress_code,
    ageRestrictions: row.age_restrictions,
    technicalRequirements: row.technical_requirements,
    registrationDeadline: row.registration_deadline ? new Date(row.registration_deadline) : null,
    cancellationPolicy: row.cancellation_policy,
    refundPolicy: row.refund_policy,
    sponsorInformation: row.sponsor_information,
    settings: row.settings ? JSON.parse(row.settings) : {},
    eventDate: row.event_date ? new Date(row.event_date) : null,
    eventTime: row.event_time,
    location: row.location,
    sponsoringOrganization: row.sponsoring_organization,
    createdAt: new Date(row.created_at),
    startedAt: row.started_at ? new Date(row.started_at) : null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  }));

  const questions = questionsResult.rows.map(row => ({
    id: row.id,
    eventId: row.event_id,
    type: row.type,
    question: row.question,
    options: row.options ? JSON.parse(row.options) : [],
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    category: row.category,
    backgroundImageUrl: row.background_image_url,
    points: row.points,
    timeLimit: row.time_limit,
    orderIndex: row.order_index,
    aiGenerated: Boolean(row.ai_generated),
    createdAt: new Date(row.created_at),
  }));

  const funFacts = funFactsResult.rows.map(row => ({
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    content: row.content,
    orderIndex: row.order_index,
    isActive: Boolean(row.is_active),
    createdAt: new Date(row.created_at),
  }));

  // Generate TypeScript file content
  const generateDataFile = (events, questions, funFacts) => {
    const primaryEvent = events[0] || null;
    const eventQuestions = primaryEvent ? questions.filter(q => q.eventId === primaryEvent.id) : [];
    const eventFunFacts = primaryEvent ? funFacts.filter(f => f.eventId === primaryEvent.id) : [];

    return `// Generated data from SQLite database
// Last updated: ${new Date().toISOString()}
// Database: ${DATABASE_URL}

export const demoEvent = ${primaryEvent ? JSON.stringify(primaryEvent, null, 2) : 'null'};

export const demoQuestions = ${JSON.stringify(eventQuestions, null, 2)};

export const demoFunFacts = ${JSON.stringify(eventFunFacts, null, 2)};

// Additional data for development
export const allEvents = ${JSON.stringify(events, null, 2)};

export const buildInfo = {
  extractedAt: "${new Date().toISOString()}",
  databaseUrl: "${DATABASE_URL}",
  eventsCount: ${events.length},
  questionsCount: ${questions.length},
  funFactsCount: ${funFacts.length},
  primaryEventId: ${primaryEvent ? `"${primaryEvent.id}"` : 'null'},
};
`;
  };

  // Write the generated data file
  // Ensure output directory exists
  const dataDir = dataDirPath;
  try { mkdirSync(dataDir, { recursive: true }); } catch {}
  const outputPath = join(dataDir, 'demoData.ts');
  const generatedContent = generateDataFile(events, questions, funFacts);
  
  writeFileSync(outputPath, generatedContent, 'utf8');

  console.log('✅ Data extraction complete!');
  console.log(`📁 Generated: ${outputPath}`);
  console.log(`📊 Events: ${events.length}, Questions: ${questions.length}, Fun Facts: ${funFacts.length}`);
  
  if (events.length > 0) {
    console.log(`🎯 Primary event: "${events[0].title}"`);
  }

  await client.close();

} catch (error) {
  console.error('❌ Error extracting data:', error);
  console.log('⚠️  Using existing demo data for static build.');
  
  // Create fallback demo data file
  console.log('📝 Creating fallback demo data file...');
  // Ensure output directory exists
  const dataDir = dataDirPath;
  try { mkdirSync(dataDir, { recursive: true }); } catch {}
  const fallbackPath = join(dataDir, 'demoData.ts');
  const fallbackContent = generateFallbackContent();
  
  writeFileSync(fallbackPath, fallbackContent, 'utf8');
  console.log('✅ Fallback demo data file created!');
  process.exit(0); // Don't fail the build, just use existing data
}
