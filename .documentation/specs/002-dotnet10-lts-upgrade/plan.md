# Implementation Plan: Upgrade to .NET 10 LTS

**Branch**: `002-dotnet10-lts-upgrade` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-dotnet10-lts-upgrade/spec.md`

## Summary

Upgrade the TriviaSpark solution from .NET 9.0 to .NET 10.0 LTS, update all NuGet packages across 3 projects (TriviaSpark.Api, TriviaSpark.Tests, promote-admin) to their latest .NET 10-compatible versions, and update all npm dependencies to their latest stable versions. The solution must compile with zero warnings and zero errors; all existing tests must pass; and the frontend must build successfully.

## Technical Context

**Language/Version**: C# / .NET 10.0 LTS (upgrading from .NET 9.0), TypeScript 5.9  
**Primary Dependencies**: ASP.NET Core 10.0, EF Core 10.0, Serilog 10.0, Swashbuckle 10.x, OpenAI 2.8, React 19.x, Vite 7.x  
**Storage**: SQLite via EF Core (production path: `C:\websites\TriviaSpark\trivia.db`) — no schema changes  
**Testing**: MSTest 4.1 (backend), Vitest (frontend)  
**Target Platform**: Windows Server / IIS (primary), Linux Docker (secondary)  
**Project Type**: Web application (ASP.NET Core API + React SPA)  
**Performance Goals**: N/A — version upgrade only, no performance changes expected  
**Constraints**: Zero compilation warnings, zero errors, all existing tests pass  
**Scale/Scope**: 3 .csproj files, 1 package.json (~60 npm packages), ~14 NuGet packages

### Current State (Baseline)

| Artifact | Current | Target |
|----------|---------|--------|
| TargetFramework | net9.0 | net10.0 |
| .NET SDK installed | 10.0.102 + 10.0.200-preview | 10.0.102 (stable) |
| global.json | not present | create to pin SDK 10.0.x |
| Build status | 0 warnings, 0 errors | 0 warnings, 0 errors |

### NuGet Package Upgrade Matrix

| Package | Current | Latest | Project(s) |
|---------|---------|--------|-----------|
| BCrypt.Net-Next | 4.0.3 | 4.1.0 | Api |
| Microsoft.AspNetCore.OpenApi | 9.0.9 | 10.0.3 | Api |
| Microsoft.AspNetCore.SpaServices.Extensions | 9.0.9 | 10.0.3 | Api |
| Microsoft.Data.Sqlite.Core | 9.0.9 | 10.0.3 | Api |
| Microsoft.EntityFrameworkCore.Design | 9.0.9 | 10.0.3 | Api |
| Microsoft.EntityFrameworkCore.Sqlite | 9.0.9 | 10.0.3 | Api, promote-admin |
| OpenAI | 2.4.0 | 2.8.0 | Api |
| Serilog.AspNetCore | 9.0.0 | 10.0.0 | Api |
| Serilog.Enrichers.Environment | 3.0.1 | 3.0.1 (current) | Api |
| Serilog.Enrichers.Thread | 4.0.0 | 4.0.0 (current) | Api |
| Serilog.Sinks.Console | 6.0.0 | 6.1.1 | Api |
| Serilog.Sinks.File | 7.0.0 | 7.0.0 (current) | Api |
| SQLitePCLRaw.bundle_e_sqlite3 | 3.0.2 | 3.0.2 (current) | Api |
| Swashbuckle.AspNetCore | 9.0.4 | 10.1.4 | Api |
| Microsoft.AspNetCore.Mvc.Testing | 9.* | 10.* | Tests |
| Microsoft.EntityFrameworkCore.InMemory | 9.* | 10.* | Tests |
| MSTest | 4.0.2 | 4.1.0 | Tests |

### Key npm Upgrades (notable changes)

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| react / react-dom | 19.1.1 | 19.2.4 | Minor version bump |
| @tanstack/react-query | 5.87.4 | 5.90.21 | Minor version bump |
| tailwindcss | 4.1.13 | 4.2.1 | Minor version bump |
| vite | 7.1.5 | 7.3.1 | Minor version bump |
| lucide-react | 0.544.0 | 0.575.0 | Minor version bump |
| zod | 4.1.8 | 4.3.6 | Minor version bump |
| react-resizable-panels | 3.0.5 | 4.6.5 | **MAJOR** — needs breaking change review |
| @libsql/client | 0.15.15 | 0.17.0 | Minor version bump |
| drizzle-orm | 0.44.5 | 0.45.1 | Minor version bump |
| @types/node | 24.3.3 | 25.3.1 | **MAJOR** — type definitions only |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**TriviaSpark Constitution v1.0.0 Compliance:**

- [x] **I. Frontend Stack**: No frontend code changes — React 19 + TypeScript strict + shadcn/ui + Tailwind + Zod all remain. Package versions updated.
- [x] **II. Backend Stack**: Upgrading ASP.NET Core 9 → 10 + EF Core 9 → 10. SQLite remains. Production DB path unchanged.
- [x] **III. Validation**: No validation logic changes — Zod schemas and data annotations unaffected.
- [x] **IV. Testing**: Existing MSTest tests must pass post-upgrade. MSTest 4.0.2 → 4.1.0.
- [x] **V. Error Handling**: No error handling changes — ILoggingService, Serilog all retained.
- [x] **VI. File Organization**: All changes are to existing files in correct locations. No new source files.
- [x] **VII. API Architecture**: No API endpoint changes — version upgrade only.
- [x] **VIII. Code Quality**: C# XML docs unaffected. ESLint/Prettier configs retained.
- [x] **Security**: No secrets changes. CORS unchanged. Dependencies updated to latest security patches.
- [x] **Performance**: No performance changes. Updated packages may include perf improvements.

*See `.documentation/memory/constitution.md` for full requirements.*

**Constitution Note**: Constitution §II references "ASP.NET Core 9" — this will need a constitution amendment after this upgrade to reflect "ASP.NET Core 10". Filed as a follow-up.

## Project Structure

### Documentation (this feature)

```text
specs/002-dotnet10-lts-upgrade/
├── plan.md              # This file
├── research.md          # Phase 0: Package compatibility research
├── data-model.md        # Phase 1: No data model changes (upgrade only)
├── quickstart.md        # Phase 1: Step-by-step upgrade instructions
├── contracts/           # Phase 1: No API contract changes (upgrade only)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (files to modify)

```text
# Files requiring changes:
TriviaSpark.Api/TriviaSpark.Api.csproj          # TargetFramework + NuGet versions
tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj # TargetFramework + NuGet versions
tools/promote-admin/promote-admin.csproj         # TargetFramework + NuGet versions
package.json                                     # npm dependency versions
package-lock.json                                # Regenerated via npm install
global.json                                      # NEW: Pin .NET SDK version

# Files that MAY need changes if breaking API changes exist:
TriviaSpark.Api/Program.cs                       # If ASP.NET Core 10 APIs changed
TriviaSpark.Api/**/*.cs                          # If EF Core 10 APIs changed
client/src/**/*.ts{x}                            # If npm major versions break APIs
```

**Structure Decision**: This is a version-upgrade feature. No new source files are created (except `global.json`). All changes are to existing project/config files.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution §II says "ASP.NET Core 9" | Upgrading to .NET 10 LTS per user request | Staying on .NET 9 rejected — support ends May 2026 |
| react-resizable-panels major bump (3→4) | Latest stable requested | Pinning to v3 acceptable if v4 has breaking changes — evaluate in research |
