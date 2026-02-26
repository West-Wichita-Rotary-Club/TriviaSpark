# Feature Specification: Upgrade to .NET 10 LTS

**Feature Branch**: `002-dotnet10-lts-upgrade`  
**Created**: 2026-02-26  
**Status**: Draft  
**Input**: User description: "Upgrade to LTS .NET 10 version and make sure all NuGet and npm packages are up to date, make sure solution compiles with no warnings or errors"

**Constitution Compliance**: This feature must comply with TriviaSpark Constitution v1.0.0 (see `.documentation/memory/constitution.md`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solution Compiles on .NET 10 with Zero Warnings or Errors (Priority: P1)

As a developer, I want the entire TriviaSpark solution (TriviaSpark.Api, TriviaSpark.Tests, promote-admin tool) to target .NET 10 and compile cleanly so that the platform runs on the latest Long-Term Support runtime with full vendor support through 2029.

**Why this priority**: The core ask — without a clean compile on .NET 10 nothing else matters. .NET 9 exits support in May 2026, making this time-critical.

**Independent Test**: Run `dotnet build TriviaSpark.Api.sln` and verify exit code 0 with zero warnings and zero errors in the build output.

**Acceptance Scenarios**:

1. **Given** the solution targeting .NET 10, **When** a developer runs `dotnet build TriviaSpark.Api.sln`, **Then** the build succeeds with zero warnings and zero errors.
2. **Given** the solution targeting .NET 10, **When** a developer runs `dotnet test`, **Then** all existing unit tests pass.
3. **Given** the solution targeting .NET 10, **When** a developer runs `dotnet publish TriviaSpark.Api/TriviaSpark.Api.csproj -c Release`, **Then** the publish output is produced with no warnings or errors.

---

### User Story 2 - All NuGet Packages Updated to Latest Compatible Versions (Priority: P1)

As a developer, I want every NuGet package reference across all projects updated to the latest stable version compatible with .NET 10 so that we benefit from bug fixes, performance improvements, and security patches.

**Why this priority**: Outdated packages may not support .NET 10 or may carry known vulnerabilities, making this essential for a clean upgrade.

**Independent Test**: Run `dotnet list package --outdated` on each project and confirm no outdated packages are reported after the upgrade.

**Acceptance Scenarios**:

1. **Given** the upgraded solution, **When** a developer runs `dotnet list package --outdated` on TriviaSpark.Api, **Then** no outdated packages are listed.
2. **Given** the upgraded solution, **When** a developer runs `dotnet list package --outdated` on TriviaSpark.Tests, **Then** no outdated packages are listed.
3. **Given** the upgraded solution, **When** a developer runs `dotnet list package --outdated` on promote-admin, **Then** no outdated packages are listed.
4. **Given** .NET 10 versions of Microsoft.EntityFrameworkCore.* packages exist, **When** the upgrade is applied, **Then** all EF Core packages reference version 10.x.

---

### User Story 3 - All npm Packages Updated to Latest Compatible Versions (Priority: P1)

As a developer, I want all npm dependencies and devDependencies in package.json updated to their latest stable versions so the frontend toolchain stays current and free of known vulnerabilities.

**Why this priority**: The frontend build chain must remain compatible and secure alongside the backend upgrade.

**Independent Test**: Run `npm outdated` and confirm no packages are reported as outdated. Run `npm run build` and verify it succeeds.

**Acceptance Scenarios**:

1. **Given** the updated package.json, **When** a developer runs `npm outdated`, **Then** no outdated packages are listed.
2. **Given** the updated package.json, **When** a developer runs `npm run build`, **Then** the Vite build completes successfully with no errors.
3. **Given** the updated package.json, **When** a developer runs `npm run check`, **Then** TypeScript type-checking passes with no errors.

---

### User Story 4 - Application Runs Correctly After Upgrade (Priority: P2)

As a developer, I want the application to start and serve requests correctly on .NET 10 so that the upgrade does not introduce runtime regressions.

**Why this priority**: Compilation alone does not guarantee runtime correctness. Smoke-testing the running application confirms the upgrade is functional end-to-end.

**Independent Test**: Start the application with `dotnet run --project TriviaSpark.Api/TriviaSpark.Api.csproj`, then verify the health endpoint responds and the SPA loads in a browser.

**Acceptance Scenarios**:

1. **Given** the upgraded application is started, **When** a user navigates to the health endpoint, **Then** a 200 OK response is returned.
2. **Given** the upgraded application is started, **When** a user navigates to the root URL, **Then** the React SPA loads and renders without console errors.

---

### Edge Cases

- What happens if a NuGet package does not yet have a .NET 10-compatible release? The most recent stable version that compiles cleanly against .NET 10 should be used, and the package should be documented for future follow-up.
- What happens if an npm major version upgrade introduces breaking API changes? Pin to the previous major version that is compatible and document the exception.
- What happens if `NoWarn` suppressions in .csproj files mask real warnings? Review existing `NoWarn` entries and ensure only intentional suppressions remain (e.g., 1591 for XML docs).
- What happens if EF Core 10.x introduces migration schema changes? No database migration changes are in scope — only package version bumps and compile fixes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All .csproj files MUST target `net10.0` (TriviaSpark.Api, TriviaSpark.Tests, promote-admin).
- **FR-002**: All NuGet package references MUST be updated to the latest stable versions compatible with .NET 10.
- **FR-003**: All npm dependencies and devDependencies MUST be updated to the latest stable versions.
- **FR-004**: The solution MUST compile with `dotnet build TriviaSpark.Api.sln` producing zero warnings and zero errors.
- **FR-005**: The solution MUST publish with `dotnet publish -c Release` producing zero warnings and zero errors.
- **FR-006**: All existing unit tests MUST pass after the upgrade.
- **FR-007**: The frontend MUST build successfully via `npm run build` with no errors.
- **FR-008**: TypeScript type-checking via `npm run check` MUST pass with no errors.
- **FR-009**: Any package that cannot be updated to the latest version MUST be documented with the reason and the version used.
- **FR-010**: The `global.json` file (if present) or SDK version constraints MUST be updated to require .NET 10 SDK.

### Key Entities

- **Project File (.csproj)**: Defines target framework and NuGet package references for each .NET project.
- **Package Manifest (package.json)**: Defines npm dependencies and devDependencies for the frontend build.
- **Solution File (.sln)**: Aggregates all .NET projects for unified build and test commands.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `dotnet build TriviaSpark.Api.sln` exits with code 0 and produces 0 warnings and 0 errors.
- **SC-002**: `dotnet test` exits with code 0 and all tests pass.
- **SC-003**: `dotnet list package --outdated` returns no outdated packages for any project in the solution.
- **SC-004**: `npm outdated` returns no outdated packages.
- **SC-005**: `npm run build` completes successfully with exit code 0.
- **SC-006**: `npm run check` completes successfully with exit code 0.
- **SC-007**: Application starts and the health endpoint returns HTTP 200 within 10 seconds of launch.

## Assumptions

- .NET 10 SDK is available and installable on the developer's machine (released November 2025 as LTS).
- All critical NuGet packages (EF Core, Serilog, Swashbuckle, OpenAI, BCrypt, SignalR) have .NET 10-compatible releases.
- No database schema migrations are required as part of the framework upgrade.
- The existing CI/CD pipeline (if any) will be updated separately to use the .NET 10 SDK image.
- React 19 and the existing frontend dependencies remain compatible with the latest npm package versions.

## Out of Scope

- Database schema migrations or EF Core model changes.
- New feature development or architectural refactoring.
- CI/CD pipeline updates (separate task).
- .NET 10 new feature adoption (e.g., new APIs, minimal API changes) — this is strictly a version upgrade.
- Performance benchmarking before/after upgrade.
