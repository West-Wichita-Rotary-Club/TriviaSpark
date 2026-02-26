# Data Model: Constitution Compliance Configuration

**Feature**: 001-constitution-compliance  
**Date**: 2026-02-25  
**Purpose**: Document configuration entities and file structures introduced by this feature

---

## Overview

This feature does not introduce new database entities or modify the existing data schema. Instead, it introduces **configuration entities** (files and projects) that establish code quality, testing, and documentation infrastructure.

---

## Configuration Entities

### 1. ESLint Configuration

**Entity Type**: JSON configuration file  
**Location**: `.eslintrc.json` (repository root)  
**Purpose**: Define linting rules for TypeScript and React code

**Schema**:
```json
{
  "root": boolean,
  "env": {
    "browser": boolean,
    "es2022": boolean,
    "node": boolean
  },
  "extends": string[],
  "parser": string,
  "parserOptions": {
    "ecmaVersion": string,
    "sourceType": string,
    "project": string
  },
  "plugins": string[],
  "rules": {
    "no-console": "error" | "warn" | "off",
    "react/prop-types": "error" | "warn" | "off",
    // ... additional rules
  },
  "settings": {
    "react": {
      "version": string
    }
  },
  "ignorePatterns": string[]
}
```

**Key Constraints**:
- `"no-console": "error"` is REQUIRED per constitution
- Must extend recommended TypeScript and React plugins
- Must ignore build outputs (dist, docs, node_modules)

**Relationships**: 
- Used by ESLint CLI during `npm run lint`
- Referenced by Prettier config via `eslint-config-prettier`

---

### 2. Prettier Configuration

**Entity Type**: JSON configuration file  
**Location**: `.prettierrc` (repository root)  
**Purpose**: Define code formatting standards

**Schema**:
```json
{
  "semi": boolean,
  "trailingComma": "none" | "es5" | "all",
  "singleQuote": boolean,
  "printWidth": number,
  "tabWidth": number,
  "useTabs": boolean,
  "arrowParens": "avoid" | "always",
  "endOfLine": "lf" | "crlf" | "auto"
}
```

**Key Constraints**:
- `printWidth`: 100 (recommended for readability)
- `endOfLine`: "lf" (consistency across OS)
- Must not conflict with ESLint rules

**Relationships**:
- Used by Prettier CLI during `npm run format`
- Integrated with ESLint via `eslint-plugin-prettier`

---

### 3. Vitest Configuration

**Entity Type**: TypeScript configuration file  
**Location**: `vitest.config.ts` (repository root)  
**Purpose**: Define frontend test execution environment

**Schema** (TypeScript):
```typescript
import { defineConfig } from 'vitest/config';

interface VitestConfig {
  plugins: Plugin[];
  test: {
    environment: 'node' | 'jsdom' | 'happy-dom';
    globals: boolean;
    setupFiles: string[];
    include: string[];
    exclude: string[];
    coverage: {
      provider: 'v8' | 'istanbul';
      reporter: string[];
      exclude: string[];
    };
  };
  resolve: {
    alias: Record<string, string>;
  };
}
```

**Key Constraints**:
- `environment`: Must be "jsdom" for React component testing
- `globals`: true (enables describe, it, expect without imports)
- Must include `client/src/**/*.{test,spec}.{ts,tsx}` pattern
- Must exclude build outputs and node_modules

**Relationships**:
- Used by Vitest test runner during `npm test`
- Imports React plugin from Vite
- References TypeScript paths from `tsconfig.json`

---

### 4. MSTest Project

**Entity Type**: .NET project file  
**Location**: `tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj`  
**Purpose**: Define backend test project structure and dependencies

**Schema** (XML):
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
    <PackageReference Include="MSTest.TestAdapter" />
    <PackageReference Include="MSTest.TestFramework" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\TriviaSpark.Api\TriviaSpark.Api.csproj" />
  </ItemGroup>
</Project>
```

**Key Constraints**:
- `TargetFramework`: Must match TriviaSpark.Api (net9.0)
- `Nullable`: Must be enabled for consistency
- `IsTestProject`: true (prevents deployment with application)
- Must reference TriviaSpark.Api project

**Relationships**:
- Added to `TriviaSpark.Api.sln` solution file
- Used by `dotnet test` command
- References main API project for testing

---

### 5. Package.json Scripts

**Entity Type**: JSON configuration (existing file, modified)  
**Location**: `package.json` (repository root)  
**Purpose**: Define NPM scripts for linting, formatting, and testing

**New Scripts**:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"client/src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"client/src/**/*.{ts,tsx,css,md}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Key Constraints**:
- `lint` must exit with code 1 if any errors found (`--max-warnings 0`)
- `format:check` must be non-destructive (check only)
- `test` must use Vitest (not Jest or other runners)

**Relationships**:
- Scripts invoke ESLint, Prettier, Vitest CLIs
- Used in CI/CD pipelines (future)
- Referenced in quickstart.md developer guide

---

### 6. XML Documentation Configuration

**Entity Type**: MSBuild property (existing file, modified)  
**Location**: `TriviaSpark.Api/TriviaSpark.Api.csproj`  
**Purpose**: Enable XML documentation generation for C# code

**Configuration**:
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>
```

**Key Constraints**:
- `GenerateDocumentationFile`: Must be true
- `NoWarn 1591`: Suppresses missing XML comment warnings (temporary during transition)
- Output file: `TriviaSpark.Api.xml` in build directory

**Relationships**:
- Generates documentation from `/// <summary>` comments in source code
- Can be used by Swagger/OpenAPI generators
- Referenced by API documentation tools

---

## File Organization Changes

### Moved Files

| Original Location | New Location | Reason |
|-------------------|--------------|--------|
| `TriviaSpark.Api/TriviaSpark.Api.http` | `tests/http/triviaspark-api.http` | Constitution Principle VI: ALL .http files must be in tests/http/ |

### New Directories

| Directory | Purpose |
|-----------|---------|
| `tests/TriviaSpark.Tests/` | MSTest project for backend unit and integration tests |
| `client/src/test/` | Vitest setup files and test utilities |

---

## Configuration Validation

### Pre-Implementation State
- ❌ No ESLint configuration
- ❌ No Prettier configuration  
- ❌ No Vitest configuration
- ❌ No MSTest project
- ❌ 38 console.log statements violate linting rules
- ❌ 1 .http file in wrong location

### Post-Implementation State
- ✅ .eslintrc.json exists with `no-console: error`
- ✅ .prettierrc exists with project standards
- ✅ vitest.config.ts exists with jsdom environment
- ✅ TriviaSpark.Tests.csproj exists in tests/ directory
- ✅ 0 console.log statements (removed or justified)
- ✅ All .http files in tests/http/ directory
- ✅ XML documentation enabled for TriviaSpark.Api

---

## Dependencies Graph

```
.eslintrc.json
  ↓ (extends)
eslint-config-prettier ──→ .prettierrc
  ↓
package.json (scripts)
  ↓ (runs)
ESLint CLI

.prettierrc
  ↓
package.json (scripts)
  ↓ (runs)
Prettier CLI

vitest.config.ts
  ↓ (imports)
@vitejs/plugin-react
  ↓
package.json (scripts)
  ↓ (runs)
Vitest CLI

TriviaSpark.Tests.csproj
  ↓ (references)
TriviaSpark.Api.csproj
  ↓
TriviaSpark.Api.sln
  ↓ (builds)
dotnet test
```

---

## State Transitions

### ESLint Configuration Lifecycle

```
[No Config] → [Create .eslintrc.json] → [Install Dependencies] → [Run lint] → [Fix Violations] → [Clean Build]
```

### Console.log Removal Lifecycle

```
[38 console.log] → [Audit Usage] → [Categorize] → [Remove or Replace] → [ESLint Enforcement] → [0 console.log]
```

### Test Infrastructure Lifecycle

```
[No Tests] → [Create Configs] → [Install Dependencies] → [Create Sample Tests] → [Run Tests] → [Infrastructure Valid]
```

---

## Acceptance Criteria

For each configuration entity:

1. **ESLint**: Running `npm run lint` executes without errors on clean code
2. **Prettier**: Running `npm run format` formats all files consistently  
3. **Vitest**: Running `npm test` executes test runner without errors
4. **MSTest**: Running `dotnet test` discovers and executes tests successfully
5. **XML Docs**: Building TriviaSpark.Api generates XML documentation file
6. **File Org**: All .http files exist only in tests/http/ directory

---

**Data Model Complete**: 2026-02-25  
**Next**: Generate quickstart.md for developer onboarding
