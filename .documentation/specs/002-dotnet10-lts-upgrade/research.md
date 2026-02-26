# Research: Upgrade to .NET 10 LTS

**Feature**: `002-dotnet10-lts-upgrade`  
**Date**: 2026-02-26  
**Status**: Complete

## Research Task 1: .NET 10 SDK Availability

**Question**: Is .NET 10 LTS SDK available and installed on the development machine?

**Finding**:
- .NET 10.0.102 (stable LTS) is installed at `C:\Program Files\dotnet\sdk\`
- .NET 10.0.200-preview is also installed (preview of next minor SDK)
- No `global.json` currently exists — SDK auto-resolves to latest installed

**Decision**: Use .NET 10.0.102 (stable). Create `global.json` to pin to 10.0.x SDK band.
**Rationale**: Pinning prevents accidental preview SDK usage and ensures consistent builds across machines.
**Alternatives considered**: Not creating global.json — rejected because preview SDK is also installed and could be auto-selected.

## Research Task 2: NuGet Package .NET 10 Compatibility

**Question**: Do all NuGet packages have .NET 10-compatible releases?

**Finding** (from `dotnet list package --outdated`):

| Package | .NET 10 Version | Status |
|---------|----------------|--------|
| Microsoft.AspNetCore.OpenApi | 10.0.3 | ✅ Available |
| Microsoft.AspNetCore.SpaServices.Extensions | 10.0.3 | ✅ Available |
| Microsoft.Data.Sqlite.Core | 10.0.3 | ✅ Available |
| Microsoft.EntityFrameworkCore.Design | 10.0.3 | ✅ Available |
| Microsoft.EntityFrameworkCore.Sqlite | 10.0.3 | ✅ Available |
| Microsoft.EntityFrameworkCore.InMemory | 10.0.3 | ✅ Available |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.3 | ✅ Available |
| Serilog.AspNetCore | 10.0.0 | ✅ Available |
| Serilog.Sinks.Console | 6.1.1 | ✅ Available (framework-agnostic) |
| Swashbuckle.AspNetCore | 10.1.4 | ✅ Available |
| BCrypt.Net-Next | 4.1.0 | ✅ Available (framework-agnostic) |
| OpenAI | 2.8.0 | ✅ Available (framework-agnostic) |
| MSTest | 4.1.0 | ✅ Available (framework-agnostic) |
| Serilog.Enrichers.Environment | 3.0.1 | ✅ Already latest |
| Serilog.Enrichers.Thread | 4.0.0 | ✅ Already latest |
| Serilog.Sinks.File | 7.0.0 | ✅ Already latest |
| SQLitePCLRaw.bundle_e_sqlite3 | 3.0.2 | ✅ Already latest |

**Decision**: All packages have .NET 10-compatible versions available. No packages blocked.
**Rationale**: Full compatibility matrix confirmed via `dotnet list package --outdated`.
**Alternatives considered**: None needed — all dependencies are available.

## Research Task 3: ASP.NET Core 10 Breaking Changes

**Question**: Are there breaking changes in ASP.NET Core 10 that affect TriviaSpark?

**Finding**:
- ASP.NET Core 10 is an incremental update focused on performance and minimal API improvements
- `SpaServices.Extensions` continues to be available (10.0.3)
- SignalR API surface is backwards compatible
- OpenAPI/Swagger integration via Swashbuckle continues to work
- EF Core 10 maintains backwards compatibility for existing DbContext patterns
- No breaking changes to middleware pipeline configuration

**Decision**: Direct upgrade with no source code modifications expected.
**Rationale**: .NET 10 LTS maintains backward compatibility with .NET 9 APIs.
**Alternatives considered**: Adopting new .NET 10 APIs (e.g., new minimal API features) — rejected, out of scope for this upgrade.

## Research Task 4: npm Package Breaking Changes

**Question**: Are there any breaking changes in the npm package updates?

**Finding**:

| Package | Change Type | Risk |
|---------|-------------|------|
| react-resizable-panels 3.0.5 → 4.6.5 | **MAJOR** | High — API may have changed |
| @types/node 24.x → 25.x | **MAJOR** | Low — type definitions only |
| @libsql/client 0.15 → 0.17 | Minor | Low — not directly used in production code |
| drizzle-orm 0.44 → 0.45 | Minor | Low — used for schema definition |
| lucide-react 0.544 → 0.575 | Minor | Low — icon library, additive changes |
| All other packages | Patch/Minor | Low — semver-compatible |

**Decision**: 
- Update all packages to latest versions using `npm update` for semver-compatible updates
- For `react-resizable-panels` v4: evaluate breaking changes — if import paths or component API changed, assess if usage is minimal and adaptable, or pin to v3.x
- For `@types/node` v25: update, minor type definition changes typically don't break builds

**Rationale**: Most updates are minor/patch. The one major version bump (`react-resizable-panels`) needs inspection during implementation.
**Alternatives considered**: Pinning all packages to current versions — rejected, defeats the purpose of the upgrade.

## Research Task 5: Swashbuckle → ASP.NET Core OpenAPI Migration

**Question**: Should we migrate from Swashbuckle to the built-in ASP.NET Core OpenAPI?

**Finding**:
- `Microsoft.AspNetCore.OpenApi` is already a dependency (being updated to 10.0.3)
- `Swashbuckle.AspNetCore` 10.1.4 continues to work on .NET 10
- The built-in OpenAPI support has matured in .NET 10 but migration is not required

**Decision**: Keep both Swashbuckle and Microsoft.AspNetCore.OpenApi. Migration is out of scope.
**Rationale**: Swashbuckle provides the Swagger UI which is actively used for development. Migration would be a separate feature.
**Alternatives considered**: Dropping Swashbuckle — rejected, out of scope for version upgrade.

## Research Task 6: Build Baseline Validation

**Question**: What is the current build state before upgrade?

**Finding**:
- `dotnet build TriviaSpark.Api.sln` → **0 warnings, 0 errors** (success)
- Solution contains: TriviaSpark.Api (net9.0), TriviaSpark.Tests (net9.0)
- promote-admin (net9.0) is not in the solution file but must also be upgraded
- Current build uses .NET 10 SDK (resolves to latest installed) to build net9.0 targets

**Decision**: Baseline is clean. Upgrade should maintain this zero-warning state.
**Rationale**: Having a clean baseline means any warnings post-upgrade are directly attributable to the version change.
**Alternatives considered**: N/A.

## Summary of Decisions

All NEEDS CLARIFICATION items are resolved:

1. ✅ .NET 10 SDK is available (10.0.102 stable)
2. ✅ All NuGet packages have .NET 10-compatible versions
3. ✅ No breaking ASP.NET Core 10 changes affect this project
4. ✅ npm upgrades are mostly minor; `react-resizable-panels` v4 needs breaking change review
5. ✅ Swashbuckle migration is out of scope
6. ✅ Baseline build is clean (0 warnings, 0 errors)
