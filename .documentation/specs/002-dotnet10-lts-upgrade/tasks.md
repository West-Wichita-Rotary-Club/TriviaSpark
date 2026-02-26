# Tasks: Upgrade to .NET 10 LTS

**Input**: Design documents from `/specs/002-dotnet10-lts-upgrade/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested. Existing tests must pass after upgrade but no new test tasks are generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US1 and US2 are tightly coupled (framework upgrade requires package upgrades) so they share a phase.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (SDK Pinning & Baseline)

**Purpose**: Pin the .NET SDK version and document the pre-upgrade baseline state

- [x] T001 Run `dotnet build TriviaSpark.Api.sln` and `dotnet test` on the current net9.0 codebase to confirm baseline passes (0 warnings, 0 errors, all tests green) before any changes
- [x] T002 Create global.json in repository root to pin .NET SDK to 10.0.x with rollForward latestFeature

**Checkpoint**: Baseline validated, SDK pinned — ready to begin framework upgrade

---

## Phase 2: Foundational — .NET 10 Target Framework (Blocking)

**Purpose**: Change TargetFramework from net9.0 to net10.0 in all projects — MUST complete before NuGet updates resolve correctly

**⚠️ CRITICAL**: NuGet packages targeting 10.x require net10.0 TargetFramework to restore properly

- [x] T003 [P] [US1] Update TargetFramework from net9.0 to net10.0 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T004 [P] [US1] Update TargetFramework from net9.0 to net10.0 in tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj
- [x] T005 [P] [US1] Update TargetFramework from net9.0 to net10.0 in tools/promote-admin/promote-admin.csproj
- [x] T006 [US1] Run `dotnet restore TriviaSpark.Api.sln` and `dotnet restore tools/promote-admin/promote-admin.csproj` to verify framework resolution succeeds for all projects (promote-admin is not in the .sln)

**Checkpoint**: All projects target net10.0 — NuGet version updates can proceed

---

## Phase 3: User Story 1 + User Story 2 — NuGet Package Upgrades (Priority: P1) 🎯 MVP

**Goal**: Update all NuGet packages to latest .NET 10-compatible versions and compile with zero warnings and zero errors

**Independent Test**: `dotnet build TriviaSpark.Api.sln` exits 0 with 0 warnings, 0 errors; `dotnet list package --outdated` shows no outdated packages

### TriviaSpark.Api NuGet Updates

- [x] T007 [P] [US2] Update Microsoft.AspNetCore.OpenApi from 9.0.9 to 10.0.3 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T008 [P] [US2] Update Microsoft.AspNetCore.SpaServices.Extensions from 9.0.9 to 10.0.3 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T009 [P] [US2] Update Microsoft.Data.Sqlite.Core from 9.0.9 to 10.0.3 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T010 [P] [US2] Update Microsoft.EntityFrameworkCore.Design from 9.0.9 to 10.0.3 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T011 [P] [US2] Update Microsoft.EntityFrameworkCore.Sqlite from 9.0.9 to 10.0.3 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T012 [P] [US2] Update BCrypt.Net-Next from 4.0.3 to 4.1.0 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T013 [P] [US2] Update OpenAI from 2.4.0 to 2.8.0 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T014 [P] [US2] Update Serilog.AspNetCore from 9.0.0 to 10.0.0 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T015 [P] [US2] Update Serilog.Sinks.Console from 6.0.0 to 6.1.1 in TriviaSpark.Api/TriviaSpark.Api.csproj
- [x] T016 [P] [US2] Update Swashbuckle.AspNetCore from 9.0.4 to 10.1.4 in TriviaSpark.Api/TriviaSpark.Api.csproj

### TriviaSpark.Tests NuGet Updates

- [x] T017 [P] [US2] Update MSTest from 4.0.2 to 4.1.0 in tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj
- [x] T018 [P] [US2] Update Microsoft.EntityFrameworkCore.InMemory from 9.* to 10.* in tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj
- [x] T019 [P] [US2] Update Microsoft.AspNetCore.Mvc.Testing from 9.* to 10.* in tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj

### promote-admin NuGet Updates

- [x] T020 [P] [US2] Update Microsoft.EntityFrameworkCore.Sqlite from 9.0.9 to 10.0.3 in tools/promote-admin/promote-admin.csproj

### Build & Test Verification

- [x] T021 [US1] Run `dotnet restore TriviaSpark.Api.sln` to restore updated packages
- [x] T022 [US1] Run `dotnet build TriviaSpark.Api.sln` and verify 0 warnings, 0 errors
- [x] T023 [US1] Fix any compilation errors or warnings introduced by package upgrades in TriviaSpark.Api/**/*.cs
- [x] T024 [US1] Run `dotnet build tools/promote-admin/promote-admin.csproj` and verify 0 warnings, 0 errors
- [x] T025 [US1] Fix any compilation errors in tools/promote-admin/**/*.cs if needed
- [x] T026 [US1] Run `dotnet test TriviaSpark.Api.sln` and verify all existing tests pass
- [x] T027 [US1] Run `dotnet publish TriviaSpark.Api/TriviaSpark.Api.csproj -c Release` and verify 0 warnings, 0 errors
- [x] T028 [US2] Run `dotnet list TriviaSpark.Api.sln package --outdated` and verify no outdated packages
- [x] T029 [US2] Run `dotnet list tools/promote-admin/promote-admin.csproj package --outdated` and verify no outdated packages

**Checkpoint**: .NET 10 backend compiles cleanly, all tests pass, all NuGet packages at latest — US1 and US2 complete

---

## Phase 4: User Story 3 — npm Package Upgrades (Priority: P1)

**Goal**: Update all npm dependencies and devDependencies to their latest stable versions; frontend builds and type-checks successfully

**Independent Test**: `npm outdated` shows no outdated packages; `npm run build` and `npm run check` both succeed

### npm Updates

- [x] T030 [US3] Run `npm update` to update all semver-compatible packages in package.json
- [x] T031 [US3] Run `npm install react-resizable-panels@latest` to update major version (3→4) in package.json
- [x] T032 [US3] Run `npm install @types/node@latest` to update major version (24→25) in package.json
- [x] T033 [US3] Run `npm install @libsql/client@latest lucide-react@latest drizzle-orm@latest` for packages outside semver range in package.json

### Breaking Change Review

- [x] T034 [US3] Search for react-resizable-panels usage in client/src/**/*.tsx and review against v4 migration guide — adapt imports/props or pin to v3 if breaking
- [x] T035 [US3] If react-resizable-panels v4 breaks, run `npm install react-resizable-panels@3` to pin to latest v3.x in package.json

### Frontend Build Verification

- [x] T036 [US3] Run `npm run build` and verify Vite build completes with no errors
- [x] T037 [US3] Fix any TypeScript or build errors in client/src/**/*.ts{x} introduced by package upgrades
- [x] T038 [US3] Run `npm run check` and verify TypeScript type-checking passes with no errors
- [x] T039 [US3] Fix any type errors in client/src/**/*.ts{x} introduced by updated @types packages
- [x] T040 [US3] Run `npm outdated` and verify no outdated packages remain

**Checkpoint**: Frontend builds cleanly, type-checks pass, all npm packages at latest — US3 complete

---

## Phase 5: User Story 4 — Smoke Test & Runtime Verification (Priority: P2)

**Goal**: Confirm the application starts and serves requests correctly on .NET 10

**Independent Test**: Application starts, health endpoint returns 200, SPA loads in browser

- [x] T041 [US4] Run `npm run build` to ensure latest frontend is deployed to TriviaSpark.Api/wwwroot
- [x] T042 [US4] Run `dotnet run --project TriviaSpark.Api/TriviaSpark.Api.csproj` and verify application starts without runtime errors
- [x] T043 [US4] Verify health endpoint returns HTTP 200 OK (confirm application is responsive after startup)
- [x] T044 [US4] Verify React SPA loads and renders at root URL without console errors
- [x] T045 [US4] Stop the application after smoke test passes

**Checkpoint**: Application runs correctly on .NET 10 — US4 complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and constitution compliance

- [ ] T046 [P] Review NoWarn suppressions in TriviaSpark.Api/TriviaSpark.Api.csproj — ensure only intentional suppressions remain (1591 for XML docs)
- [ ] T047 [P] Update .documentation/memory/constitution.md §II to explicitly reference ".NET 10 LTS" and "ASP.NET Core 10" instead of ".NET 9" / "ASP.NET Core 9" — MUST complete before merging to main
- [ ] T048 [P] Document any packages that could not be updated to latest with reason in .documentation/specs/002-dotnet10-lts-upgrade/research.md
- [ ] T049 Run full verification suite: `dotnet build`, `dotnet test`, `dotnet list package --outdated`, `npm run build`, `npm run check`, `npm outdated`

**Checkpoint**: All verification commands pass — feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all NuGet updates
- **Phase 3 (US1+US2 NuGet)**: Depends on Phase 2 — can be done as one batch edit
- **Phase 4 (US3 npm)**: Independent of Phase 3 — can run in parallel with NuGet updates
- **Phase 5 (US4 Smoke Test)**: Depends on Phase 3 AND Phase 4 completion
- **Phase 6 (Polish)**: Depends on Phase 5

### User Story Dependencies

- **US1 (P1)**: Compile on .NET 10 — depends on Phase 2 (TargetFramework) + Phase 3 (NuGet packages)
- **US2 (P1)**: NuGet packages updated — tightly coupled with US1, same phase
- **US3 (P1)**: npm packages updated — independent of US1/US2, can run in parallel (Phase 4)
- **US4 (P2)**: Application runs — depends on US1 + US2 + US3 all being complete

### Parallel Execution Opportunities

**Within Phase 2**: T003, T004, T005 can all run in parallel (different .csproj files)

**Within Phase 3**: T007–T020 can all run in parallel (different PackageReference lines, can be done as one batch edit per .csproj file)

**Phase 3 + Phase 4 in parallel**: Backend NuGet updates and frontend npm updates are fully independent

**Within Phase 6**: T046, T047, T048 can all run in parallel (different files)

### Implementation Strategy

1. **MVP**: Complete Phases 1–3 (US1+US2) — solution compiles on .NET 10 with all NuGet packages updated
2. **Increment 2**: Complete Phase 4 (US3) — frontend packages updated and building
3. **Increment 3**: Complete Phases 5–6 (US4 + Polish) — runtime verified, documentation updated
