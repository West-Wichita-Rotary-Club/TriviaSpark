# Quickstart: Upgrade to .NET 10 LTS

**Feature**: `002-dotnet10-lts-upgrade`  
**Date**: 2026-02-26

## Prerequisites

- .NET 10 SDK 10.0.102 or later installed (`dotnet --version` should show 10.0.x)
- Node.js 20+ with npm
- Git

## Step-by-Step Upgrade

### Step 1: Create global.json (pin SDK)

Create `global.json` in repo root:

```json
{
  "sdk": {
    "version": "10.0.102",
    "rollForward": "latestFeature"
  }
}
```

### Step 2: Update TargetFramework in all .csproj files

Change `<TargetFramework>net9.0</TargetFramework>` to `<TargetFramework>net10.0</TargetFramework>` in:

1. `TriviaSpark.Api/TriviaSpark.Api.csproj`
2. `tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj`
3. `tools/promote-admin/promote-admin.csproj`

### Step 3: Update NuGet packages

For **TriviaSpark.Api.csproj**, update all PackageReference versions:

| Package | From | To |
|---------|------|-----|
| BCrypt.Net-Next | 4.0.3 | 4.1.0 |
| Microsoft.AspNetCore.OpenApi | 9.0.9 | 10.0.3 |
| Microsoft.AspNetCore.SpaServices.Extensions | 9.0.9 | 10.0.3 |
| Microsoft.Data.Sqlite.Core | 9.0.9 | 10.0.3 |
| Microsoft.EntityFrameworkCore.Design | 9.0.9 | 10.0.3 |
| Microsoft.EntityFrameworkCore.Sqlite | 9.0.9 | 10.0.3 |
| OpenAI | 2.4.0 | 2.8.0 |
| Serilog.AspNetCore | 9.0.0 | 10.0.0 |
| Serilog.Sinks.Console | 6.0.0 | 6.1.1 |
| Swashbuckle.AspNetCore | 9.0.4 | 10.1.4 |

For **TriviaSpark.Tests.csproj**:

| Package | From | To |
|---------|------|-----|
| MSTest | 4.0.2 | 4.1.0 |
| Microsoft.EntityFrameworkCore.InMemory | 9.* | 10.* |
| Microsoft.AspNetCore.Mvc.Testing | 9.* | 10.* |

For **promote-admin.csproj**:

| Package | From | To |
|---------|------|-----|
| Microsoft.EntityFrameworkCore.Sqlite | 9.0.9 | 10.0.3 |

### Step 4: Restore and build .NET solution

```bash
dotnet restore TriviaSpark.Api.sln
dotnet build TriviaSpark.Api.sln
```

Verify: 0 warnings, 0 errors.

### Step 5: Run .NET tests

```bash
dotnet test TriviaSpark.Api.sln
```

Verify: All tests pass.

### Step 6: Update npm packages

```bash
npm update
npm install react-resizable-panels@latest @types/node@latest @libsql/client@latest drizzle-orm@latest lucide-react@latest
```

Note: `react-resizable-panels` is a major version bump (3→4). If it introduces breaking changes, review usage and adapt or pin to v3.

### Step 7: Build frontend

```bash
npm run build
npm run check
```

Verify: Both commands succeed with no errors.

### Step 8: Smoke test

```bash
dotnet run --project TriviaSpark.Api/TriviaSpark.Api.csproj
```

Verify: Application starts, health endpoint returns 200, SPA loads in browser.

## Verification Commands

```bash
# Full verification suite
dotnet build TriviaSpark.Api.sln           # Must: 0 warnings, 0 errors
dotnet test TriviaSpark.Api.sln            # Must: All tests pass
dotnet list TriviaSpark.Api.sln package --outdated  # Must: No outdated packages
npm run build                              # Must: Successful build
npm run check                              # Must: No type errors
npm outdated                               # Must: No outdated packages
```
