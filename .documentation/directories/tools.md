# Tools Directory

⚠️ **PRODUCTION DATABASE WARNING** ⚠️

This project now uses a production database with real user data. Dangerous database reset scripts have been DISABLED to prevent accidental data loss:

- `refresh-db.ps1.DISABLED` - Would wipe entire database
- `refresh-db.bat.DISABLED` - Would wipe entire database  
- `reset-and-seed.mjs.DISABLED` - Would reset and seed database
- `reset-database.ps1.DISABLED` - Would reset database
- `reset-database.bat.DISABLED` - Would reset database

**DO NOT RE-ENABLE THESE SCRIPTS** unless you want to lose all production data!

## Safe Development Tools

This directory contains development tools and scripts for the TriviaSpark project.

## Database Management

### `refresh-db.ps1` (PowerShell)

Comprehensive database refresh script with error handling and colored output.

```powershell
# Full refresh with build
.\tools\refresh-db.ps1

# Skip build step for faster development
.\tools\refresh-db.ps1 -SkipBuild
```

### `refresh-db.bat` (Windows Batch)

Alternative database refresh script for systems without PowerShell.

```cmd
.\tools\refresh-db.bat
```

## Project Setup

### `setup.mjs`

Initial project setup script that creates necessary directories and copies configuration files.

```bash
npm run setup
```

## Testing Scripts

### `test-api-endpoints.mjs`

Tests all API endpoints for functionality and response validation.

### `test-api.js`

General API testing utilities and functions.

### `test-dashboard-api.mjs`

Comprehensive dashboard API validation script.

### `test-db.mjs`

Database connection and operations testing.

### `test-funfacts-fix.mjs`

Tests for fun facts functionality and data integrity.

### `test-login.mjs`

Authentication and login system testing.

### `test-upcoming-events.mjs`

Tests for upcoming events functionality.

## Development Utilities

### `debug-dates.js`

Debug script for testing date comparisons and parsing. Useful for troubleshooting date-related issues in events and scheduling.

## Usage Notes

- All scripts should be run from the project root directory
- PowerShell scripts require execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Test scripts help validate functionality during development
- Use `npm run` commands where available for better integration

## Integration with npm scripts

Some tools are integrated with npm scripts in `package.json`:

- `npm run setup` → `tools/setup.mjs`
- Database scripts are called directly: `.\tools\refresh-db.ps1`
