#!/usr/bin/env node

/**
 * Setup script for TriviaSpark
 * Helps users understand the deployment options and configure the environment
 */

import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

console.log('🎯 TriviaSpark Setup');
console.log('====================\n');

// Check if .env exists
const envPath = join(__dirname, '.env');
const envExamplePath = join(__dirname, '.env.example');

if (!existsSync(envPath)) {
  if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    console.log('⚠️  No .env.example found');
  }
} else {
  console.log('✅ .env file already exists');
}

// Create data directory for SQLite
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data/ directory for SQLite database');
} else {
  console.log('✅ Data directory already exists');
}

console.log('\n📋 Deployment Options:');
console.log('=======================\n');

console.log('1️⃣  LOCAL DEVELOPMENT (Full Features)');
console.log('   • Command: npm run dev');
console.log('   • Database: SQLite file (./data/trivia.db)');
console.log('   • Features: ✅ Persistence ✅ WebSocket ✅ AI ✅ Auth');
console.log('   • Use case: Development, testing, production hosting\n');

console.log('2️⃣  GITHUB PAGES (Demo/Static)');
console.log('   • Command: npm run build:static');
console.log('   • Database: ❌ None (static content only)');
console.log('   • Features: ❌ No persistence ❌ No backend ✅ Fast CDN');
console.log('   • Use case: Demos, portfolios, showcasing\n');

console.log('🚀 Next Steps:');
console.log('==============');
console.log('• For development: npm run dev');
console.log('• For GitHub Pages: npm run build:static');
console.log('• Edit .env file with your configuration');
console.log('• See DEPLOYMENT.md for detailed instructions\n');

console.log('📚 Key Files:');
console.log('=============');
console.log('• .env - Environment configuration');
console.log('• ./data/trivia.db - SQLite database (auto-created)');
console.log('• ./docs/ - Static build output for GitHub Pages');
console.log('• DEPLOYMENT.md - Comprehensive deployment guide\n');
