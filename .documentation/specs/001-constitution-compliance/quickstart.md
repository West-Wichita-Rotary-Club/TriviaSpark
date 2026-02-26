# Quickstart Guide: Development Workflow with Code Quality Tools

**Feature**: 001-constitution-compliance  
**Date**: 2026-02-25  
**Audience**: New developers joining TriviaSpark project  
**Purpose**: Guide for using linting, formatting, testing, and documentation tools

---

## Overview

This guide helps you get started with the TriviaSpark development workflow after the constitution compliance infrastructure has been established. You'll learn how to:

- ✅ Lint your code for errors and best practices
- ✅ Format your code consistently
- ✅ Run frontend and backend tests
- ✅ Write proper documentation
- ✅ Fix common issues

---

## Prerequisites

**Required**:
- Node.js 18+ and npm 9+
- .NET 9 SDK
- Git
- VS Code (recommended) or Visual Studio

**Recommended VS Code Extensions**:
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- C# Dev Kit (ms-dotnettools.csdevkit)

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/West-Wichita-Rotary-Club/TriviaSpark.git
cd TriviaSpark

# Install frontend dependencies
npm install

# Restore backend dependencies
dotnet restore
```

### 2. Configure VS Code (Optional but Recommended)

Create or update `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[csharp]": {
    "editor.formatOnSave": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

This enables automatic formatting on save and ESLint fixes.

---

## Daily Development Workflow

### Frontend Development

#### 1. Before Committing Code

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format all files
npm run format

# Verify formatting without changes
npm run format:check
```

#### 2. Running Frontend Tests

```bash
# Run tests in watch mode (recommended during development)
npm test

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Backend Development

#### 1. Before Committing Code

```bash
# Build solution (catches compilation errors)
dotnet build

# Run backend tests
dotnet test

# Check for test coverage (if configured)
dotnet test --collect:"XPlat Code Coverage"
```

#### 2. Verify Database Connection

```bash
# Run API and check logs for database path
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
# Look for: "Database path: C:\websites\TriviaSpark\trivia.db"
```

---

## Writing Code

### Frontend: TypeScript + React

#### ✅ DO: Use Proper Logging

```typescript
// ✅ GOOD: Use toast for user feedback
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Action completed successfully',
    });
  };
}
```

```typescript
// ❌ BAD: console.log (will fail ESLint)
function MyComponent() {
  const handleSuccess = () => {
    console.log('User clicked button'); // ERROR: no-console
  };
}
```

#### ✅ DO: Use TypeScript Types

```typescript
// ✅ GOOD: Proper types
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, disabled = false, children }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>;
}
```

```typescript
// ❌ BAD: Missing types
export function Button({ onClick, disabled, children }) { // ERROR: Implicit any
  return <button onClick={onClick} disabled={disabled}>{children}</button>;
}
```

### Backend: C# + ASP.NET Core

#### ✅ DO: Add XML Documentation

```csharp
/// <summary>
/// Retrieves a trivia event by its unique identifier.
/// </summary>
/// <param name="id">The unique identifier of the event.</param>
/// <returns>The event if found, otherwise null.</returns>
/// <exception cref="ArgumentException">Thrown when id is null or empty.</exception>
public async Task<Event?> GetEventByIdAsync(string id)
{
    if (string.IsNullOrEmpty(id))
        throw new ArgumentException("Event ID cannot be null or empty", nameof(id));
        
    return await _context.Events.FindAsync(id);
}
```

```csharp
// ❌ BAD: No documentation (build warning)
public async Task<Event?> GetEventByIdAsync(string id)
{
    return await _context.Events.FindAsync(id);
}
```

#### ✅ DO: Use Proper Error Handling

```csharp
// ✅ GOOD: Handle errors and log
public async Task<IActionResult> GetEvent(string id)
{
    try
    {
        var eventItem = await _eventService.GetEventByIdAsync(id);
        if (eventItem == null)
            return NotFound(new { error = "Event not found" });
            
        return Ok(eventItem);
    }
    catch (Exception ex)
    {
        _loggingService.LogError("Failed to retrieve event", ex, new { eventId = id });
        return StatusCode(500, new { error = "Internal server error" });
    }
}
```

---

## Writing Tests

### Frontend Tests (Vitest + React Testing Library)

**Location**: `client/src/**/*.test.tsx`

```typescript
// client/src/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

**Run tests**:
```bash
npm test                  # Watch mode
npm run test:ui           # Visual UI
npm run test:coverage     # Coverage report
```

### Backend Tests (MSTest)

**Location**: `tests/TriviaSpark.Tests/**/*.cs`

```csharp
// tests/TriviaSpark.Tests/Services/EventServiceTests.cs
namespace TriviaSpark.Tests.Services;

[TestClass]
public class EventServiceTests
{
    private TriviaSparkDbContext _context;
    private EventService _service;

    [TestInitialize]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<TriviaSparkDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb")
            .Options;
            
        _context = new TriviaSparkDbContext(options);
        _service = new EventService(_context, Mock.Of<ILoggingService>());
    }

    [TestCleanup]
    public void Cleanup()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [TestMethod]
    public async Task GetEventByIdAsync_ExistingEvent_ReturnsEvent()
    {
        // Arrange
        var eventItem = new Event { Id = "test-123", Name = "Test Event" };
        _context.Events.Add(eventItem);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetEventByIdAsync("test-123");

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("Test Event", result.Name);
    }

    [TestMethod]
    public async Task GetEventByIdAsync_NonExistingEvent_ReturnsNull()
    {
        // Act
        var result = await _service.GetEventByIdAsync("nonexistent");

        // Assert
        Assert.IsNull(result);
    }
}
```

**Run tests**:
```bash
dotnet test                              # Run all tests
dotnet test --filter "FullyQualifiedName~EventService"  # Run specific test class
dotnet test --collect:"XPlat Code Coverage"             # With coverage
```

---

## Troubleshooting

### ESLint Errors

**Error**: `'console' is not defined. (no-console)`

**Solution**: Remove console.log, use toast notifications or React DevTools instead

```typescript
// Replace this:
console.log('User data:', user);

// With this (for debugging):
// Use React DevTools browser extension

// Or this (for user feedback):
toast({ title: 'Info', description: `User: ${user.name}` });
```

---

**Error**: `React is not defined in JSX scope`

**Solution**: Ensure you're using React 19's automatic JSX runtime (no need to import React)

```typescript
// ✅ Correct (React 19)
export function MyComponent() {
  return <div>Hello</div>;
}

// ❌ Incorrect (React 17 and earlier)
import React from 'react'; // Not needed in React 19
export function MyComponent() {
  return <div>Hello</div>;
}
```

---

### Prettier Conflicts

**Error**: Prettier and ESLint show different formatting

**Solution**: Ensure `eslint-config-prettier` is installed and last in extends array

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"  // Must be last
  ]
}
```

---

### Test Failures

**Error**: `ReferenceError: describe is not defined`

**Solution**: Ensure `vitest.config.ts` has `globals: true`

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,  // Enables describe, it, expect globally
    environment: 'jsdom',
  },
});
```

---

**Error**: `Cannot find module '@/components/ui/button'`

**Solution**: Ensure Vitest config has path alias resolution

```typescript
// vitest.config.ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
```

---

### Database Path Issues

**Error**: Application creates database at `./data/trivia.db` instead of production path

**Solution**: Verify `Program.cs` uses correct connection string

```csharp
// ✅ Correct
var databasePath = Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? "Data Source=C:\\websites\\TriviaSpark\\trivia.db";

// ❌ Incorrect
var databasePath = "Data Source=./data/trivia.db";
```

---

## CI/CD Integration (Future)

When CI/CD is configured, these checks will run automatically:

```yaml
# Example GitHub Actions workflow
name: CI

on: [pull_request]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '9.0.x'
          
      - name: Install dependencies
        run: npm install
        
      - name: Lint frontend
        run: npm run lint
        
      - name: Test frontend
        run: npm test
        
      - name: Build frontend
        run: npm run build
        
      - name: Test backend
        run: dotnet test
```

---

## Best Practices Summary

### Frontend ✨
- ✅ Always run `npm run lint` before committing
- ✅ Use `npm run format` to auto-format code
- ✅ Write tests for new components (`*.test.tsx`)
- ✅ Use TypeScript strict types (no `any`)
- ✅ Replace console.log with toast notifications
- ✅ Use React DevTools for debugging, not console.log

### Backend 🔧
- ✅ Add XML documentation to all public methods
- ✅ Use `ILoggingService` for logging, not `Console.WriteLine`
- ✅ Write unit tests for business logic
- ✅ Use async/await for database operations
- ✅ Validate inputs with data annotations
- ✅ Return proper HTTP status codes

### Database 💾
- ✅ Always use production path: `C:\websites\TriviaSpark\trivia.db`
- ✅ Never create local database files in repository
- ✅ Use environment variable `DATABASE_URL` for overrides

---

## Quick Reference

### Commands Cheat Sheet

```bash
# Frontend
npm run lint              # Check for linting errors
npm run lint:fix          # Fix auto-fixable linting errors
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without changes
npm test                  # Run frontend tests (watch mode)
npm run test:ui           # Run tests with visual UI
npm run test:coverage     # Run tests with coverage report
npm run build             # Build production frontend

# Backend
dotnet build              # Build solution
dotnet test               # Run all backend tests
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj  # Run API server

# Combined (full verification)
npm run lint && npm test && npm run build && dotnet test
```

---

## Getting Help

- **Constitution**: `.documentation/memory/constitution.md`
- **Feature Spec**: `.documentation/specs/001-constitution-compliance/spec.md`
- **Research**: `.documentation/specs/001-constitution-compliance/research.md`
- **ESLint Rules**: https://eslint.org/docs/rules/
- **Vitest Docs**: https://vitest.dev/
- **MSTest Docs**: https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest

---

**Quickstart Guide Complete**: 2026-02-25  
**Next Steps**: Run through this guide and verify all commands work as expected
