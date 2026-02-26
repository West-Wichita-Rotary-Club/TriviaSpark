# Database Schema Fix - GitHub Actions Deploy Issue

## Issue Summary

The GitHub Actions deployment was failing during the database seeding step with this error:

```
❌ Error seeding database: LibsqlError: SQLITE_ERROR: table events has no column named allow_participants
```

## Root Cause

The seeding script (`scripts/seed-database.mjs`) was trying to insert an `allow_participants` column that didn't exist in the database schema defined in `shared/schema.ts`.

## Solution Applied

### 1. Added Missing Column to Schema

Updated `shared/schema.ts` to include the missing `allow_participants` column in the events table:

```typescript
// Event configuration
allowParticipants: integer("allow_participants", { mode: "boolean" }).default(true),
```

This column:

- Is a boolean field stored as integer (SQLite convention)
- Defaults to `true` (allows participants by default)
- Controls whether participants can join the event

### 2. Verified GitHub Actions Workflow

The existing workflow in `.github/workflows/deploy.yml` is correctly structured:

1. Creates the `data/` directory first with `mkdir -p data`
2. Sets the `DATABASE_URL` environment variable
3. Runs `npm run db:push` to create/update the database schema
4. Runs `npm run seed:data-only` to populate with sample data

## Technical Details

### Database Operation Flow

1. **Schema Push**: `drizzle-kit push` reads `shared/schema.ts` and applies changes to SQLite database
2. **Data Seeding**: `scripts/seed-database.mjs` inserts sample data using the expected schema
3. **Static Export**: Data is extracted for the static build process

### Column Details

The `allow_participants` column in the events table:

- **Type**: `integer` with boolean mode (Drizzle/SQLite pattern)  
- **Default**: `true` (1 in SQLite)
- **Purpose**: Controls whether the event accepts participant registrations
- **Usage**: The seeding script sets this to `1` (true) for the demo event

## Files Modified

- `shared/schema.ts` - Added `allowParticipants` field to events table schema

## Testing

The deployment should now succeed because:

1. The database schema matches what the seeding script expects
2. The `drizzle-kit push` command will create the table with the correct structure
3. The seeding script can successfully insert data with the `allow_participants` column

## Impact

This fix resolves the GitHub Pages deployment failure and ensures the demo site builds successfully with proper sample data.
