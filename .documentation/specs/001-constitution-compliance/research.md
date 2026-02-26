# Research: Constitution Compliance Tooling

**Feature**: 001-constitution-compliance  
**Date**: 2026-02-25  
**Purpose**: Research best practices for configuring code quality, testing, and documentation tools

## Research Tasks

This research resolves the "NEEDS CONFIGURATION" items identified in the Technical Context section of plan.md:

1. ✅ Vitest configuration for React 19 + TypeScript (frontend testing)
2. ✅ MSTest project setup for ASP.NET Core 9 (backend testing)
3. ✅ ESLint + Prettier configuration for TypeScript + React
4. ✅ C# XML documentation standards and tooling
5. ✅ Console.log removal strategies and alternatives

---

## 1. Vitest Configuration for React 19 + TypeScript

### Decision
Use Vitest with React Testing Library and jsdom environment for frontend unit testing.

### Configuration Requirements
**File**: `vitest.config.ts` (create at repository root)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./client/src/test/setup.ts'],
    include: ['client/src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.documentation'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/*.config.*', '**/test/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
```

**Dependencies to add**:
```json
{
  "devDependencies": {
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jsdom": "^23.0.1"
  }
}
```

**Setup file**: `client/src/test/setup.ts`
```typescript
import '@testing-library/jest-dom';
```

**NPM scripts to add**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Rationale
- Vitest is Vite-native, providing fast test execution with same config as dev/build
- React Testing Library aligns with React best practices (testing user behavior, not implementation)
- jsdom environment provides browser-like DOM for component testing
- Global test utilities reduce boilerplate in test files

### Alternatives Considered
- **Jest**: More mature but slower, requires additional config for ESM, conflicts with Vite
- **Playwright Component Testing**: Heavier, better for E2E than unit tests
- **React Testing Library alone**: Needs test runner, Vitest provides this

### Sample Test Structure
```typescript
// client/src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

---

## 2. MSTest Project Setup for ASP.NET Core 9

### Decision
Create `TriviaSpark.Tests` MSTest project for backend testing with EF Core in-memory database support.

### Configuration Requirements

**Create project**:
```bash
dotnet new mstest -n TriviaSpark.Tests -f net9.0
dotnet sln add tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj
```

**Project file additions** (`TriviaSpark.Tests.csproj`):
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
    <PackageReference Include="MSTest.TestAdapter" Version="3.2.0" />
    <PackageReference Include="MSTest.TestFramework" Version="3.2.0" />
    <PackageReference Include="coverlet.collector" Version="6.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="9.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\TriviaSpark.Api\TriviaSpark.Api.csproj" />
  </ItemGroup>
</Project>
```

**Global usings** (`Usings.cs`):
```csharp
global using Microsoft.VisualStudio.TestTools.UnitTesting;
```

**Sample test**:
```csharp
namespace TriviaSpark.Tests;

[TestClass]
public class SampleTests
{
    [TestMethod]
    public void SampleTest_Passes()
    {
        // Arrange
        var expected = 2;
        
        // Act
        var actual = 1 + 1;
        
        // Assert
        Assert.AreEqual(expected, actual);
    }
}
```

### Rationale
- MSTest is Microsoft's recommended testing framework for .NET projects
- EF Core InMemory provider enables fast database testing without SQLite file
- Microsoft.AspNetCore.Mvc.Testing enables integration testing of API endpoints
- Project location in `tests/` directory follows constitution file organization

### Alternatives Considered
- **xUnit**: Popular in .NET community, but MSTest has better Visual Studio integration
- **NUnit**: Mature, but MSTest is more idiomatic for Microsoft stack
- **SQLite in-memory**: More realistic than EF InMemory, but slower and requires setup

---

## 3. ESLint + Prettier Configuration for TypeScript + React

### Decision
Use ESLint with TypeScript and React plugins, Prettier for formatting, with pre-configured recommended rules.

### Configuration Requirements

**Dependencies to add**:
```json
{
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "@typescript-eslint/parser": "^6.19.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "prettier": "^3.2.4",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3"
  }
}
```

**ESLint Config** (`.eslintrc.json`):
```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "react-refresh",
    "prettier"
  ],
  "rules": {
    "no-console": "error",
    "react/prop-types": "off",
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prettier/prettier": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "ignorePatterns": ["dist", "build", "node_modules", ".documentation", "docs"]
}
```

**Prettier Config** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Ignore files**:
- `.eslintignore`: Same as `.prettierignore`
- `.prettierignore`:
  ```
  node_modules
  dist
  build
  docs
  .documentation
  *.min.js
  *.min.css
  coverage
  ```

**NPM scripts**:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"client/src/**/*.{ts,tsx,css,md}\"",
    "format:check": "prettier --check \"client/src/**/*.{ts,tsx,css,md}\""
  }
}
```

### Rationale
- `no-console: "error"` enforces zero console.log in production code (constitution requirement)
- TypeScript ESLint catches type safety issues before compilation
- React plugins enforce React best practices (hooks rules, component patterns)
- Prettier integration prevents formatting conflicts between developers
- `eslint-config-prettier` disables ESLint formatting rules that conflict with Prettier

### Alternatives Considered
- **Biome**: Newer all-in-one tool, but less mature ecosystem
- **Standard JS**: Zero-config but opinionated, doesn't allow customization
- **TSLint**: Deprecated, replaced by ESLint + TypeScript plugin

---

## 4. C# XML Documentation Standards

### Decision
Use standard XML documentation comments (`/// <summary>`) on all public classes, interfaces, and methods in Services/ and Controllers/.

### Standards

**Class documentation**:
```csharp
/// <summary>
/// Provides AI-powered content generation using OpenAI GPT-4 for trivia questions,
/// event copy, and analytics insights.
/// </summary>
public class OpenAIService : IOpenAIService
```

**Method documentation**:
```csharp
/// <summary>
/// Generates trivia questions for a specific event based on theme and context.
/// </summary>
/// <param name="eventId">The unique identifier of the event.</param>
/// <param name="questionCount">Number of questions to generate (1-50).</param>
/// <param name="difficulty">Difficulty level: easy, medium, or hard.</param>
/// <returns>A collection of generated trivia questions with answers.</returns>
/// <exception cref="ArgumentException">Thrown when questionCount is outside valid range.</exception>
public async Task<IEnumerable<Question>> GenerateQuestionsAsync(
    string eventId, 
    int questionCount, 
    string difficulty)
```

**Property documentation**:
```csharp
/// <summary>
/// Gets or sets the OpenAI API key for authentication.
/// </summary>
public string ApiKey { get; set; }
```

**Enable XML generation** (`TriviaSpark.Api.csproj`):
```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn> <!-- Suppress missing XML comment warnings initially -->
</PropertyGroup>
```

### Rationale
- XML comments enable IntelliSense in Visual Studio and VS Code
- Generated XML file can be used for API documentation tools (Swagger, DocFX)
- Standard format ensures consistency across codebase
- Suppressing 1591 warnings initially prevents build noise during transition

### Alternatives Considered
- **Markdown comments**: Not standard in C#, no tooling support
- **External documentation**: Separate from code, gets out of sync
- **No documentation**: Violates constitution, harms maintainability

---

## 5. Console.log Removal Strategies

### Decision
Use multi-file search/replace to remove all console.log, introduce proper logging service on frontend where needed.

### Removal Strategy

**Step 1: Audit current usage**
```bash
# Count console.log instances
grep -r "console\.log" client/src --include="*.ts" --include="*.tsx" | wc -l
# Expected: 38 instances
```

**Step 2: Categorize usages**
- **Debug statements**: Remove entirely (most common)
- **User feedback**: Replace with toast notifications
- **Error logging**: Replace with ILoggingService calls (backend pattern)
- **Development logging**: Keep in development with conditional check (rare)

**Step 3: Safe replacements**

For debugging:
```typescript
// BEFORE
console.log('User clicked button', data);

// AFTER
// Remove entirely - use React DevTools instead
```

For user feedback:
```typescript
// BEFORE
console.log('Event created successfully');

// AFTER
import { useToast } from '@/hooks/use-toast';
const { toast } = useToast();
toast({ title: 'Success', description: 'Event created successfully' });
```

For development-only logging:
```typescript
// BEFORE
console.log('API response:', response);

// AFTER
if (import.meta.env.DEV) {
  console.debug('API response:', response); // eslint-disable-line no-console
}
```

**Step 4: ESLint enforcement**
With `"no-console": "error"` in `.eslintrc.json`, any new console.log will cause build failure.

### Rationale
- Console statements leak information in production (security concern)
- Toast notifications provide better user experience than console messages
- ESLint enforcement prevents regression
- React DevTools and browser debugging are more powerful than console.log

### Alternatives Considered
- **Keep console.log in development**: Risk of accidental production deploy
- **Custom logger wrapper**: Adds unnecessary abstraction for frontend
- **Only warn on console.log**: Too easy to ignore, doesn't enforce compliance

---

## Implementation Checklist

Based on research, the following tasks must be completed:

### Configuration Files (Priority: CRITICAL)
- [ ] Create `.eslintrc.json` with TypeScript + React rules
- [ ] Create `.prettierrc` with project formatting standards  
- [ ] Create `.eslintignore` and `.prettierignore`
- [ ] Create `vitest.config.ts` for frontend testing
- [ ] Create `client/src/test/setup.ts` for test environment
- [ ] Update `package.json` with lint, format, test scripts
- [ ] Install ESLint, Prettier, Vitest dev dependencies

### Testing Infrastructure (Priority: HIGH)
- [ ] Create `tests/TriviaSpark.Tests/` directory
- [ ] Create `TriviaSpark.Tests.csproj` MSTest project
- [ ] Create `Usings.cs` with global usings
- [ ] Create `SampleTests.cs` to validate test framework
- [ ] Add TriviaSpark.Tests to solution file
- [ ] Verify `dotnet test` executes successfully
- [ ] Verify `npm test` executes successfully

### Code Cleanup (Priority: HIGH)
- [ ] Audit all 38 console.log locations
- [ ] Remove debug console.log statements
- [ ] Replace user-facing console.log with toast notifications
- [ ] Conditionally preserve development-only logging (if any)
- [ ] Run `npm run lint` and verify zero errors
- [ ] Run `npm run format` and verify all files formatted

### Database Path Fixes (Priority: HIGH)
- [ ] Update `Program.cs` default connection string
- [ ] Update `ApiEndpoints.EfCore.cs` database references
- [ ] Search codebase for all database path references
- [ ] Verify all paths use `C:\websites\TriviaSpark\trivia.db` or environment variable
- [ ] Test application startup and verify database connection logs

### Documentation (Priority: MEDIUM)
- [ ] Add XML comments to all public classes in `Services/`
- [ ] Add XML comments to all public interfaces in `Services/`
- [ ] Add XML comments to all public methods in `Services/`
- [ ] Add XML comments to all controller actions in `Controllers/`
- [ ] Enable XML documentation generation in `TriviaSpark.Api.csproj`
- [ ] Verify build generates XML file without errors

### File Organization (Priority: MEDIUM)
- [ ] Move `TriviaSpark.Api/TriviaSpark.Api.http` to `tests/http/triviaspark-api.http`
- [ ] Update any references to moved .http file
- [ ] Verify no other .http files exist outside `tests/http/`
- [ ] Document decision on `server/` directory (archive or delete)

### Verification (Priority: CRITICAL)
- [ ] Run full frontend build: `npm run build`
- [ ] Run full backend build: `dotnet build`
- [ ] Run linting: `npm run lint` (must show 0 errors)
- [ ] Run formatting check: `npm run format:check` (must show 0 violations)
- [ ] Run frontend tests: `npm test` (must pass)
- [ ] Run backend tests: `dotnet test` (must pass)
- [ ] Start application and verify functionality unchanged
- [ ] Check console for zero console.log output during normal use

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Removing console.log breaks debugging flows | Medium | Use React DevTools, browser debugging, proper error boundaries |
| ESLint rules too strict, blocks development | Medium | Start with recommended rules, adjust based on team feedback |
| Test infrastructure creates build overhead | Low | Tests run only with `npm test` / `dotnet test`, not in dev builds |
| XML documentation incomplete | Low | Suppress warnings initially (NoWarn 1591), complete incrementally |
| Database path changes break existing deployments | High | Use environment variable with production path fallback |
| Large file refactoring out of scope | Low | Document refactoring plan, defer to future feature |

---

## Success Metrics

- ✅ **Zero console.log statements** in `client/src/**/*.{ts,tsx}`
- ✅ **Zero ESLint errors** when running `npm run lint`
- ✅ **100% Prettier compliance** when running `npm run format:check`
- ✅ **Test infrastructure functional**: `npm test` and `dotnet test` both execute successfully
- ✅ **All database paths correct**: No references to `./data/trivia.db` or relative paths
- ✅ **XML documentation complete** for all public members in Services/ and Controllers/
- ✅ **File organization compliant**: All .http files in `tests/http/`
- ✅ **Application functionality preserved**: All features work identically after changes

---

**Research completed**: 2026-02-25  
**Ready for Phase 1**: Design artifacts (data-model.md, quickstart.md)
