# File Organization Plan

## Current State

The root directory has many scattered files that should be organized for better maintainability.

## Organization Structure

### 1. Development Tools & Scripts

**Target Directory:** `tools/`

- `debug-dates.js` - Development debugging script
- `setup.mjs` - Project setup script
- `test-*.mjs` - Test scripts (test-api-endpoints.mjs, test-api.js, etc.)
- `test-*.js` - Additional test files
- `refresh-db.bat` - Database refresh script (Windows)
- `refresh-db.ps1` - Database refresh script (PowerShell)

### 2. HTTP Test Files

**Target Directory:** `tests/http/`

- `api-tests.http` - API test requests
- `ef-core-v2-api-tests.http` - EF Core specific tests
- `efcore-test.http` - Additional EF Core tests

### 3. Configuration Files

**Keep in Root:** (These are expected by tools in root)

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `drizzle.config.ts`
- `.env*` files
- `.gitignore`
- `.npmrc`

### 4. Documentation

**Keep in Root:** (Standard locations)

- `README.md`
- `README-DEMO.md`
- `LICENSE`
- `DEPLOYMENT.md`
- `EF-CORE-SUCCESS.md`

### 5. Temporary/Generated Files

**Target Directory:** `temp/` or remove if safe

- `cookies.txt` - Temporary cookie file
- `replit.md` - Replit-specific documentation

### 6. Solution Files

**Keep in Root:** (Expected by .NET tooling)

- `TriviaSpark.Api.sln`

## Implementation Plan

1. Create `tools/` directory
2. Create `tests/http/` directory
3. Create `temp/` directory for temporary files
4. Move files to appropriate locations
5. Update any references in scripts/documentation
