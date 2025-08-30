# Database Refresh Scripts

This document describes the automated database refresh scripts for TriviaSpark.

## Overview

Two scripts are provided to automate the complete database refresh process:

- `refresh-db.ps1` - PowerShell script (recommended)
- `refresh-db.bat` - Windows batch file (alternative)

## What the Scripts Do

Both scripts perform the following operations in sequence:

1. **Delete existing database** - Removes `./data/trivia.db` if it exists
2. **Create database schema** - Runs `npx drizzle-kit push` to create tables
3. **Seed database** - Runs `npm run seed` to populate with demo data
4. **Extract data** - Runs `npm run extract-data` to sync `demoData.ts`
5. **Build project** - Runs `npm run build` to compile everything

## Usage

### PowerShell Script (Recommended)

```powershell
# Full refresh with build
.\refresh-db.ps1

# Skip the build step (faster for development)
.\refresh-db.ps1 -SkipBuild
```

### Batch Script

```cmd
# Full refresh with build
.\refresh-db.bat
```

## Features

### PowerShell Script Features

- ✅ Colored output with emojis for better readability
- ✅ Proper error handling and exit codes
- ✅ Optional `-SkipBuild` parameter for faster development cycles
- ✅ Detailed progress reporting
- ✅ Comprehensive help documentation (`Get-Help .\refresh-db.ps1`)

### Batch Script Features

- ✅ Windows-compatible without PowerShell requirements
- ✅ Error handling with pause on failure
- ✅ Clear step-by-step output
- ✅ Works on older Windows systems

## Error Handling

Both scripts include comprehensive error handling:

- **File checks** - Verifies `package.json` exists (correct directory)
- **Exit codes** - Stops execution if any step fails
- **Clear messages** - Shows exactly what went wrong
- **Recovery guidance** - Provides next steps on errors

## When to Use

### Development Workflow

Use these scripts when you:

- Add new questions to the seeding script
- Modify database schema
- Need to reset the database to a clean state
- Want to test the complete data flow
- Prepare for deployment

### Quick Development Cycle

For faster development iterations:

```powershell
.\refresh-db.ps1 -SkipBuild
```

This skips the build step, saving time when you only need to refresh the database.

## Output Example

```text
🔄 Starting TriviaSpark Database Refresh Process

🔄 Step 1: Removing existing database
✅ Deleted existing database file

🔄 Step 2: Creating database schema
✅ Database schema created successfully

🔄 Step 3: Seeding database with demo data
✅ Database seeded successfully

🔄 Step 4: Extracting data to demo file
✅ Data extracted to demoData.ts successfully

🔄 Step 5: Building project
✅ Project built successfully

🔄 Database Refresh Complete! 🎉
✅ Database deleted and recreated
✅ Schema applied with Drizzle
✅ Demo data seeded (10 questions, 5 fun facts)
✅ Data extracted to demoData.ts
✅ Project built successfully

🚀 Ready to test:
   • Run 'npm run dev' to start development server
   • Login with: mark / mark123
   • View questions in presenter mode
```

## Troubleshooting

### Common Issues

1. **"package.json not found"**
   - Solution: Run the script from the TriviaSpark root directory

2. **"npx command not found"**
   - Solution: Ensure Node.js and npm are installed and in PATH

3. **"Database schema creation failed"**
   - Solution: Check database permissions and Drizzle configuration

4. **"Seed failed"**
   - Solution: Verify `scripts/seed-database.mjs` has correct data

### Manual Recovery

If the script fails partway through:

```bash
# Check what step failed and run manually:
npx drizzle-kit push
npm run seed
npm run extract-data
npm run build
```

## Integration

These scripts integrate with the existing npm scripts:

- Uses `npm run seed` (calls `scripts/seed-database.mjs`)
- Uses `npm run extract-data` (calls `scripts/extract-data.mjs`)
- Uses `npm run build` (standard Vite build process)
- Compatible with `npx drizzle-kit push` (schema management)

## Security

- Scripts only affect local development database
- No external network calls (except npm dependencies)
- Safe to run multiple times (idempotent operations)
- No sensitive data exposure in output
