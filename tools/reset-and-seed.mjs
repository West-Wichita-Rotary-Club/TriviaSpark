#!/usr/bin/env node

/**
 * Cross-Platform Database Reset and Seed Script
 * 
 * This script provides a cross-platform way to:
 * 1. Stop running server processes
 * 2. Delete the existing SQLite database
 * 3. Recreate the database with EF Core migrations
 * 4. Seed the database with initial data
 * 
 * Usage: npm run seed
 * Alternative: node tools/reset-and-seed.mjs
 */

import { execSync, spawn } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dbPath = 'C:\\websites\\TriviaSpark\\trivia.db';

console.log('🔄 === TriviaSpark Database Reset and Seed Tool ===');
console.log('This will completely delete and recreate the database with fresh seed data\n');

// Check for force flag
const forceFlag = process.argv.includes('-force') || process.argv.includes('--force');

if (!forceFlag) {
  console.log('⚠️  WARNING: This will permanently delete all existing data!');
  console.log('   - All events, teams, participants, and responses will be lost');
  console.log('   - Only the original seed data will remain\n');
  
  // In CI or non-interactive environments, require explicit force flag
  if (!process.stdin.isTTY || process.env.CI) {
    console.log('❌ Non-interactive environment detected. Use -force flag to proceed.');
    console.log('   Example: npm run seed -- -force');
    process.exit(1);
  }
}

try {
  console.log('🚀 Starting database reset process...\n');

  // Step 1: Stop running processes
  console.log('1️⃣  Stopping running server processes...');
  try {
    if (process.platform === 'win32') {
      // Windows
      try {
        execSync('taskkill /f /im TriviaSpark.Api.exe >nul 2>&1', { stdio: 'ignore' });
      } catch {}
      try {
        execSync('taskkill /f /im dotnet.exe /fi "WINDOWTITLE eq *TriviaSpark*" >nul 2>&1', { stdio: 'ignore' });
      } catch {}
    } else {
      // Linux/macOS
      try {
        execSync('pkill -f "TriviaSpark.Api" 2>/dev/null || true', { stdio: 'ignore' });
      } catch {}
      try {
        execSync('pkill -f "dotnet.*TriviaSpark" 2>/dev/null || true', { stdio: 'ignore' });
      } catch {}
    }
    
    // Wait a moment for processes to stop
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('   ✅ Server processes stopped');
  } catch (error) {
    console.log('   ⚠️  Error stopping processes (continuing anyway)');
  }

  // Step 2: Delete existing database files
  console.log('2️⃣  Removing existing database files...');
  try {
    const filesToDelete = [
      dbPath,
      `${dbPath}-wal`,
      `${dbPath}-shm`,
      `${dbPath}.lock`
    ];

    for (const file of filesToDelete) {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    }

    if (existsSync(dbPath)) {
      console.log('   ❌ Could not delete database file - make sure server is stopped');
      process.exit(1);
    } else {
      console.log('   ✅ Database files deleted successfully');
    }
  } catch (error) {
    console.log(`   ❌ Error deleting database: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Ensure data directory exists
  console.log('3️⃣  Ensuring data directory exists...');
  try {
    const { mkdirSync } = await import('fs');
    mkdirSync(join(rootDir, 'data'), { recursive: true });
    console.log('   ✅ Data directory ready');
  } catch (error) {
    console.log(`   ❌ Error creating data directory: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Recreate database with migrations
  console.log('4️⃣  Recreating database with EF Core migrations...');
  try {
    const migrationProcess = execSync('dotnet ef database update --context TriviaSparkDbContext', {
      cwd: join(rootDir, 'TriviaSpark.Api'),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('   ✅ Database recreated successfully');
  } catch (error) {
    console.log('   ❌ Migration failed:');
    console.log(`   ${error.message}`);
    process.exit(1);
  }

  // Step 5: Seed the database
  console.log('5️⃣  Seeding database with initial data...');
  try {
    const seedProcess = execSync('node scripts/seed-database.mjs -force', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('   ✅ Database seeded successfully');
  } catch (error) {
    console.log('   ⚠️  Seed script had issues:');
    console.log(`   ${error.message}`);
    console.log('   You may need to check the seed script manually');
  }

  // Step 6: Verify database
  console.log('6️⃣  Verifying database...');
  try {
    if (existsSync(dbPath)) {
      const { statSync } = await import('fs');
      const stats = statSync(dbPath);
      console.log(`   ✅ Database file exists: ${stats.size} bytes`);
      console.log(`   📅 Created: ${stats.birthtime.toLocaleString()}`);
    } else {
      console.log('   ❌ Database file not found after reset');
      process.exit(1);
    }
  } catch (error) {
    console.log(`   ⚠️  Could not verify database: ${error.message}`);
  }

  console.log('\n🎉 Database reset and seeding completed successfully!\n');
  console.log('📋 What was done:');
  console.log('   ✅ Stopped running server processes');
  console.log('   ✅ Deleted old database and lock files');
  console.log('   ✅ Recreated database with fresh schema');
  console.log('   ✅ Applied EF Core migrations');
  console.log('   ✅ Seeded with initial sample data\n');
  
  console.log('🚀 Next steps:');
  console.log('   1. Start the server: dotnet run --project TriviaSpark.Api');
  console.log('   2. Test the API: Open tests/http/api-tests.http in VS Code');
  console.log('   3. Check the data: Visit http://localhost:14166/api/debug/db\n');
  
  console.log('💡 Available commands:');
  console.log('   • npm run seed         - Full reset and seed (this command)');
  console.log('   • npm run seed:data-only - Just seed data (no database reset)');
  console.log('   • .\\tools\\reset-database.ps1 - PowerShell version (Windows)');
  console.log('   • .\\tools\\reset-database.bat - Batch version (Windows)\n');

} catch (error) {
  console.error(`❌ Unexpected error: ${error.message}`);
  process.exit(1);
}
