# Tasks: Constitution Compliance & Audit Remediation

**Input**: Design documents from `.documentation/specs/001-constitution-compliance/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are NOT requested for this feature - focus is on infrastructure setup

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 0: Constitution Compliance (Pre-Development)

**Purpose**: Verify feature design complies with TriviaSpark constitution before implementation begins

- [X] T000 [P] Verify frontend stack compliance (React 19, TypeScript strict, shadcn/ui, Tailwind, Zod)
- [X] T001 [P] Verify backend stack compliance (ASP.NET Core 9, EF Core, Serilog, interface-based DI)
- [X] T002 [P] Verify file organization (correct directories: tools/, tests/http/, copilot/, temp/)
- [X] T003 [P] Verify testing plan (Vitest for frontend, MSTest for backend infrastructure)
- [X] T004 [P] Verify error handling approach (ILoggingService, error boundaries, no console.log)
- [X] T005 [P] Verify code quality requirements (ESLint, Prettier, XML documentation standards)

*See `.documentation/memory/constitution.md` for full requirements.*

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install tools and dependencies needed for all user stories

- [X] T010 Install frontend dev dependencies (eslint, prettier, vitest, @testing-library/react, jsdom) via npm install
- [X] T011 [P] Create .gitignore entries for test coverage output and eslint cache in .gitignore
- [X] T012 [P] Update .vscode/settings.json with eslint and prettier format-on-save configuration
- [X] T013 [P] Document npm scripts (lint, format, test) in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story implementation can begin

**Note**: This feature has minimal foundational blockers since it's configuration work. User stories can mostly proceed independently.

- [X] T020 Verify production database exists at C:\websites\TriviaSpark\trivia.db
- [X] T021 Backup current database file to C:\websites\TriviaSpark\trivia.backup.{date}.db (format: YYYYMMDD) before configuration changes

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Clean Production Code (Priority: P1) 🎯 MVP

**Goal**: Remove all console.log statements (38 instances) and configure ESLint + Prettier for production-quality code

**Independent Test**: Run `npm run lint` and verify zero console.log statements. Run `npm run format` and verify all files formatted. Build application and verify no console output during normal operation.

### Configuration for User Story 1

- [X] T030 [P] [US1] Create .eslintrc.json at repository root with TypeScript + React recommended rules and no-console: error
- [X] T031 [P] [US1] Create .prettierrc at repository root with project formatting standards (printWidth: 100, semi: true, singleQuote: true)
- [X] T032 [P] [US1] Create .eslintignore at repository root excluding node_modules, dist, docs, TriviaSpark.Api
- [X] T033 [P] [US1] Create .prettierignore at repository root excluding node_modules, dist, docs, TriviaSpark.Api

### NPM Script Configuration for User Story 1

- [X] T034 [US1] Add lint script to package.json: "eslint . --ext .ts,.tsx --max-warnings 0"
- [X] T035 [US1] Add lint:fix script to package.json: "eslint . --ext .ts,.tsx --fix"
- [X] T036 [US1] Add format script to package.json: "prettier --write \"client/src/**/*.{ts,tsx,css,md}\""
- [X] T037 [US1] Add format:check script to package.json: "prettier --check \"client/src/**/*.{ts,tsx,css,md}\""

### Console.log Removal for User Story 1

- [X] T040 [P] [US1] Remove console.log statements from client/src/components/ai/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)
- [X] T041 [P] [US1] Remove console.log statements from client/src/components/event/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)
- [X] T042 [P] [US1] Remove console.log statements from client/src/components/layout/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)
- [X] T043 [P] [US1] Remove console.log statements from client/src/pages/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)
- [X] T044 [P] [US1] Remove console.log statements from client/src/hooks/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)
- [X] T045 [P] [US1] Remove console.log statements from client/src/contexts/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)
- [X] T046 [P] [US1] Remove console.log statements from client/src/lib/*.{ts,tsx} files (remove debug logs entirely; replace user-feedback logs with toast notifications)

### Validation for User Story 1

- [X] T050 [US1] Run `npm run lint` and verify zero errors on clean codebase (if errors found: fix violations and re-run until passing)
- [X] T051 [US1] Run `npm run format` and verify all files formatted successfully (if errors found: review and fix format issues, then re-run)
- [X] T052 [US1] Build application with `npm run build` and verify no console.log warnings (if warnings found: locate and remove remaining console.log statements)
- [X] T053 [US1] Start application and verify no console output during normal user operations (if console output appears: identify source and remove)

**Checkpoint**: User Story 1 complete - ESLint and Prettier configured, all console.log removed, linting passes

---

## Phase 4: User Story 2 - Correct Database Configuration (Priority: P2)

**Goal**: Fix all database path references to use production path C:\websites\TriviaSpark\trivia.db

**Independent Test**: Search codebase for database path references and verify all use production path. Start application and confirm logs show connection to C:\websites\TriviaSpark\trivia.db.

### Database Path Fixes for User Story 2

- [X] T060 [P] [US2] Update Program.cs default connection string to "Data Source=C:\\websites\\TriviaSpark\\trivia.db" in TriviaSpark.Api/Program.cs
- [X] T061 [P] [US2] Remove fallback path "./data/trivia.db" from Program.cs in TriviaSpark.Api/Program.cs
- [X] T062 [P] [US2] Update ApiEndpoints.EfCore.cs database path references to use production path in TriviaSpark.Api/ApiEndpoints.EfCore.cs
- [X] T063 [P] [US2] Search for remaining relative database paths ("./data/", "./trivia.db") across all .cs files and update

### Environment Variable Configuration for User Story 2

- [X] T064 [US2] Update Program.cs to read DATABASE_URL environment variable with production path fallback in TriviaSpark.Api/Program.cs
- [X] T065 [US2] Add startup logging to confirm actual database path being used in TriviaSpark.Api/Program.cs

### Validation for User Story 2

- [X] T070 [US2] Run `dotnet build` and verify zero compilation errors
- [X] T071 [US2] Start application with `dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj` and verify logs show "Database path: C:\websites\TriviaSpark\trivia.db"
- [X] T072 [US2] Search codebase for database path references and confirm all use production path or environment variable
- [X] T073 [US2] Test application functionality to verify database connection works correctly

**Checkpoint**: User Story 2 complete - All database paths use production location, application connects successfully

---

## Phase 5: User Story 3 - Test Infrastructure Foundation (Priority: P3)

**Goal**: Configure Vitest for frontend testing and create MSTest project for backend testing

**Independent Test**: Run `npm test` to execute Vitest tests. Run `dotnet test` to execute MSTest tests. Both should execute successfully with sample tests passing.

### Vitest Configuration for User Story 3

- [X] T080 [P] [US3] Create vitest.config.ts at repository root with React + jsdom configuration
- [X] T081 [P] [US3] Create client/src/test/setup.ts with @testing-library/jest-dom import
- [X] T082 [P] [US3] Add test script to package.json: "vitest"
- [X] T083 [P] [US3] Add test:ui script to package.json: "vitest --ui"
- [X] T084 [P] [US3] Add test:coverage script to package.json: "vitest --coverage"

### MSTest Project Creation for User Story 3

- [X] T085 [US3] Create MSTest project with `dotnet new mstest -n TriviaSpark.Tests -f net9.0 -o tests/TriviaSpark.Tests`
- [X] T086 [US3] Add TriviaSpark.Tests project to solution with `dotnet sln add tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj`
- [X] T087 [US3] Add project reference to TriviaSpark.Api in tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj
- [X] T088 [US3] Add EF Core InMemory package to tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj
- [X] T089 [US3] Add Microsoft.AspNetCore.Mvc.Testing package to tests/TriviaSpark.Tests/TriviaSpark.Tests.csproj

### Sample Test Creation for User Story 3

- [X] T090 [P] [US3] Create sample Vitest test in client/src/components/ui/button.test.tsx (must render component and assert on behavior, not trivial arithmetic)
- [X] T091 [P] [US3] Create sample MSTest in tests/TriviaSpark.Tests/EventServiceTests.cs (must test realistic scenario, not trivial arithmetic)
- [X] T092 [P] [US3] Create global usings file in tests/TriviaSpark.Tests/Usings.cs

### Validation for User Story 3

- [X] T095 [US3] Run `npm test` and verify Vitest executes sample test successfully
- [X] T096 [US3] Run `dotnet test` and verify MSTest executes sample test successfully
- [X] T097 [US3] Verify test frameworks are documented in package.json and README.md
- [X] T098 [US3] Run `npm run test:coverage` and verify coverage report generates

**Checkpoint**: User Story 3 complete - Vitest and MSTest configured, sample tests passing, infrastructure validated

---

## Phase 6: User Story 4 - C# Code Documentation (Priority: P4)

**Goal**: Add XML summary comments to all public classes, interfaces, and methods in Services/ and Controllers/

**Independent Test**: Run documentation coverage analysis and verify all public members have XML comments. Build project and verify XML documentation file generates without warnings.

### Services Documentation for User Story 4

- [X] T100 [P] [US4] Add XML summary comments to all public members in TriviaSpark.Api/Services/OpenAIService.cs
- [X] T101 [P] [US4] Add XML summary comments to all public members in TriviaSpark.Api/Services/EfCore/EventService.cs
- [X] T102 [P] [US4] Add XML summary comments to all public members in TriviaSpark.Api/Services/EfCore/TeamService.cs
- [X] T103 [P] [US4] Add XML summary comments to all public members in TriviaSpark.Api/Services/EfCore/QuestionService.cs
- [X] T104 [P] [US4] Add XML summary comments to all public members in TriviaSpark.Api/Services/EfCore/ParticipantService.cs
- [X] T105 [P] [US4] Add XML summary comments to all public members in TriviaSpark.Api/Services/LoggingService.cs

### Controllers Documentation for User Story 4

- [X] T110 [P] [US4] Add XML summary comments to all controller actions in TriviaSpark.Api/Controllers/EventsController.cs
- [X] T111 [P] [US4] Add XML summary comments to all controller actions in TriviaSpark.Api/Controllers/TeamsController.cs
- [X] T112 [P] [US4] Add XML summary comments to all controller actions in TriviaSpark.Api/Controllers/QuestionsController.cs
- [X] T113 [P] [US4] Add XML summary comments to all controller actions in TriviaSpark.Api/Controllers/ParticipantsController.cs

### XML Documentation Generation for User Story 4

- [X] T115 [US4] Enable GenerateDocumentationFile in TriviaSpark.Api/TriviaSpark.Api.csproj PropertyGroup
- [X] T116 [US4] Add NoWarn 1591 to suppress missing doc warnings during transition in TriviaSpark.Api/TriviaSpark.Api.csproj (TEMPORARY: will be removed at T122 after all docs complete)
- [X] T117 [US4] Configure XML documentation file output path in TriviaSpark.Api/TriviaSpark.Api.csproj

### Validation for User Story 4

- [X] T120 [US4] Run `dotnet build` and verify XML documentation file generates at bin/Debug/net9.0/TriviaSpark.Api.xml
- [X] T121 [US4] Review generated XML file and verify completeness of documentation
- [X] T122 [US4] Remove NoWarn 1591 and verify zero documentation warnings in TriviaSpark.Api/TriviaSpark.Api.csproj
- [X] T123 [US4] Run documentation coverage tool (if available) and verify 100% coverage of public APIs

**Checkpoint**: User Story 4 complete - All public C# APIs documented with XML comments, documentation file generates

---

## Phase 7: User Story 5 - File Organization Compliance (Priority: P5)

**Goal**: Move misplaced .http file to tests/http/ directory and evaluate server/ directory

**Independent Test**: Verify TriviaSpark.Api/TriviaSpark.Api.http is moved to tests/http/. Verify no .http files exist outside tests/http/ directory.

### File Relocation for User Story 5

- [X] T130 [P] [US5] Move TriviaSpark.Api/TriviaSpark.Api.http to tests/http/triviaspark-api.http (if file exists; skip if already moved or doesn't exist)
- [X] T131 [P] [US5] Update any documentation references to old .http file path in README.md or other docs (if applicable)
- [X] T132 [P] [US5] Search for any other .http files outside tests/http/ and move them

### Server Directory Evaluation for User Story 5

- [X] T135 [US5] Audit server/ directory contents and document purpose in copilot/server-directory-audit.md
- [X] T136 [US5] Determine if server/ code is archived or active based on git history and references (check last commit date, search for imports/references)
- [X] T137 [US5] Document decision on server/ directory in copilot/server-directory-decision.md (tech lead decides: if no commits in 6+ months and no active references, recommend deletion)

### Validation for User Story 5

- [X] T140 [US5] Run file organization audit and verify 100% compliance with constitution directory structure
- [X] T141 [US5] Verify all .http files are in tests/http/ directory
- [X] T142 [US5] Verify server/ directory decision is documented and communicated

**Checkpoint**: User Story 5 complete - All files in correct directories, organization 100% compliant

---

## Phase 8: User Story 6 - Large File Refactoring (Priority: P6)

**Goal**: Document refactoring plan for oversized files without implementing refactoring

**Independent Test**: Verify refactoring plan exists for all files exceeding 500 lines. Plan documents how to split while maintaining functionality.

### Large File Identification for User Story 6

- [X] T150 [P] [US6] Identify all files in client/src exceeding 500 lines
- [X] T151 [P] [US6] Analyze event-manage.tsx (1778 lines) and identify logical component boundaries
- [X] T152 [P] [US6] Analyze other large files and identify refactoring opportunities

### Refactoring Plan Creation for User Story 6

- [X] T155 [US6] Create refactoring plan for event-manage.tsx in copilot/large-file-refactoring-plan.md
- [X] T156 [US6] Document component extraction strategy (custom hooks, sub-components, utilities)
- [X] T157 [US6] Estimate refactoring effort and prioritize files by impact in copilot/large-file-refactoring-plan.md
- [X] T158 [US6] Document testing strategy to ensure refactoring maintains functionality

### Validation for User Story 6

- [X] T160 [US6] Review refactoring plan with team for feasibility and completeness
- [X] T161 [US6] Verify plan includes clear before/after file structure
- [X] T162 [US6] Verify plan addresses all files exceeding 500 lines

**Checkpoint**: User Story 6 complete - Refactoring plan documented (implementation deferred to future feature)

---

## Phase 9: Integration & Final Validation

**Purpose**: Final improvements, integration verification, and compliance validation

- [X] T170 [P] Update .documentation/specs/001-constitution-compliance/README.md with implementation summary
- [X] T171 [P] Update main README.md with new developer workflow (linting, formatting, testing)
- [X] T172 [P] Update CONTRIBUTING.md with code quality standards and pre-commit checklist
- [X] T173 [P] Create pre-commit hook template for running lint + format checks in .githooks/pre-commit (note: hook installation/activation is post-feature work, document in quickstart.md)
- [X] T174 Run quickstart.md validation to verify all developer workflow steps work
- [X] T175 Run constitution compliance audit and verify score improves from 42% to 80%+
- [X] T176 Generate final compliance report in copilot/constitution-compliance-final-report.md
- [X] T177 Clean up any temporary files or unused configuration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (Constitution Compliance)**: No dependencies - verification only, can start immediately
- **Phase 1 (Setup)**: Depends on Phase 0 passing - installs dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 - minimal blocking work (database backup)
- **User Stories (Phase 3-8)**: All depend on Phase 2 completion
  - User stories CAN proceed in parallel (different files, independent concerns)
  - OR sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Phase 9 (Polish)**: Depends on completion of desired user stories

### User Story Dependencies

- **User Story 1 (P1 - Clean Production Code)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2 - Database Configuration)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 3 (P3 - Test Infrastructure)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 4 (P4 - C# Documentation)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 5 (P5 - File Organization)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 6 (P6 - Large File Refactoring)**: Can start after Phase 2 - No dependencies on other stories

**ALL USER STORIES ARE INDEPENDENT** - They can be worked on in parallel by different team members.

### Within Each User Story

#### User Story 1 (Clean Production Code)
- Configuration files (T030-T033) can all run in parallel
- NPM scripts (T034-T037) run sequentially (same file)
- Console.log removal (T040-T046) can all run in parallel (different files)
- Validation (T050-T053) runs sequentially at the end

#### User Story 2 (Database Configuration)
- Database path fixes (T060-T063) can all run in parallel (different concerns)
- Environment variable config (T064-T065) runs sequentially (same file)
- Validation (T070-T073) runs sequentially at the end

#### User Story 3 (Test Infrastructure)
- Vitest configuration (T080-T084) can all run in parallel
- MSTest project creation (T085-T089) runs sequentially (project setup)
- Sample tests (T090-T092) can all run in parallel (different files)
- Validation (T095-T098) runs sequentially at the end

#### User Story 4 (C# Documentation)
- Services documentation (T100-T105) can all run in parallel (different files)
- Controllers documentation (T110-T113) can all run in parallel (different files)
- XML generation config (T115-T117) runs sequentially (same file)
- Validation (T120-T123) runs sequentially at the end

#### User Story 5 (File Organization)
- File relocation (T130-T132) can all run in parallel
- Server directory evaluation (T135-T137) runs sequentially (research)
- Validation (T140-T142) runs sequentially at the end

#### User Story 6 (Large File Refactoring)
- File identification (T150-T152) can all run in parallel
- Refactoring plan creation (T155-T158) runs sequentially (single doc)
- Validation (T160-T162) runs sequentially at the end

### Parallel Opportunities

**Maximum Parallelism** (if full team available):
- After Phase 2 completes: 6 developers can work on 6 user stories simultaneously
- Within User Story 1: 7 parallel tasks (T030-T033 + T040-T046)
- Within User Story 3: 7 parallel tasks (T080-T084 + T090-T092)
- Within User Story 4: 9 parallel tasks (T100-T105 + T110-T113)

**Recommended Parallel Groups**:

**Setup Phase (Phase 1)**:
```bash
Parallel Group 1:
- T010: Install npm dependencies
- T011: Update .gitignore
- T012: Update VSCode settings
- T013: Document npm scripts
```

**User Story 1 Configuration**:
```bash
Parallel Group 1:
- T030: Create .eslintrc.json
- T031: Create .prettierrc
- T032: Create .eslintignore
- T033: Create .prettierignore
```

**User Story 1 Console.log Removal**:
```bash
Parallel Group 2:
- T040: Remove console.log from client/src/components/ai/
- T041: Remove console.log from client/src/components/event/
- T042: Remove console.log from client/src/components/layout/
- T043: Remove console.log from client/src/pages/
- T044: Remove console.log from client/src/hooks/
- T045: Remove console.log from client/src/contexts/
- T046: Remove console.log from client/src/lib/
```

**User Story 2 Database Fixes**:
```bash
Parallel Group 1:
- T060: Update Program.cs connection string
- T061: Remove fallback path from Program.cs
- T062: Update ApiEndpoints.EfCore.cs
- T063: Search and fix remaining paths
```

---

## Parallel Example: User Story 1 (Clean Production Code)

```bash
# Launch all configuration files together:
Task T030: "Create .eslintrc.json at repository root"
Task T031: "Create .prettierrc at repository root"
Task T032: "Create .eslintignore at repository root"
Task T033: "Create .prettierignore at repository root"

# Then launch all console.log removal tasks together:
Task T040: "Remove console.log from client/src/components/ai/"
Task T041: "Remove console.log from client/src/components/event/"
Task T042: "Remove console.log from client/src/components/layout/"
Task T043: "Remove console.log from client/src/pages/"
Task T044: "Remove console.log from client/src/hooks/"
Task T045: "Remove console.log from client/src/contexts/"
Task T046: "Remove console.log from client/src/lib/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 0: Constitution verification
2. Complete Phase 1: Setup and dependencies
3. Complete Phase 2: Foundational (database backup)
4. **Complete Phase 3: User Story 1 (Clean Production Code)**
5. **STOP and VALIDATE**: Run lint, format, build - verify zero console.log
6. Deploy/demo if ready - code quality baseline established

**Rationale**: User Story 1 (P1) is the highest priority and establishes code quality foundations (ESLint, Prettier) that benefit all other user stories. Getting this working first prevents console.log from creeping back in during other work.

### Incremental Delivery

1. ✅ **Phase 0-2**: Foundation (prerequisites, setup, database backup)
2. ✅ **Phase 3 (US1)**: Code quality tools + console.log removal → **Deploy/Demo** (MVP - code quality baseline!)
3. ✅ **Phase 4 (US2)**: Database path fixes → **Deploy/Demo** (stable database configuration)
4. ✅ **Phase 5 (US3)**: Test infrastructure → **Deploy/Demo** (testing capability established)
5. ✅ **Phase 6 (US4)**: C# documentation → **Deploy/Demo** (backend APIs documented)
6. ✅ **Phase 7 (US5)**: File organization → **Deploy/Demo** (100% constitution compliance)
7. ✅ **Phase 8 (US6)**: Refactoring plan → **Deploy/Demo** (plan documented for future work)
8. ✅ **Phase 9**: Polish → Final validation and deployment

Each phase adds value without breaking previous functionality. All user stories are independently testable.

### Parallel Team Strategy

With multiple developers (6 available):

1. **Together**: Complete Phase 0-2 (foundation)
2. **Once Phase 2 is done**:
   - Developer A: User Story 1 (P1 - Clean Production Code)
   - Developer B: User Story 2 (P2 - Database Configuration)
   - Developer C: User Story 3 (P3 - Test Infrastructure)
   - Developer D: User Story 4 (P4 - C# Documentation)
   - Developer E: User Story 5 (P5 - File Organization)
   - Developer F: User Story 6 (P6 - Large File Refactoring)
3. All user stories complete and validate independently
4. **Together**: Complete Phase 9 (polish and final validation)

**Advantage**: All 6 user stories can be completed simultaneously in ~1-2 days instead of 6-12 days sequentially.

### Single Developer Strategy

With one developer (sequential approach):

1. Complete Phase 0-2 (foundation) - 0.5 day
2. User Story 1 (P1 - HIGHEST PRIORITY) - 1 day
3. User Story 2 (P2 - HIGH PRIORITY) - 0.5 day
4. User Story 3 (P3 - MEDIUM PRIORITY) - 1 day
5. User Story 4 (P4 - MEDIUM PRIORITY) - 1 day
6. User Story 5 (P5 - LOW PRIORITY) - 0.5 day
7. User Story 6 (P6 - LOW PRIORITY) - 0.5 day
8. Phase 9 (polish) - 0.5 day

**Total Estimated Time**: 5.5 days

**Recommended**: Stop after User Story 1-4 if time constrained (US5-US6 are lower priority).

---

## Success Metrics

Upon completion of all tasks, verify:

- ✅ **SC-001**: Constitution compliance audit score: 42% → 80%+ (target: 100%)
- ✅ **SC-002**: Code quality score: 35% → 75%+ (target: 100%)
- ✅ **SC-003**: File organization compliance: 95% → 100%
- ✅ **SC-004**: Database path violations: 10 → 0
- ✅ **SC-005**: Console.log statements: 38 → 0
- ✅ **SC-006**: Critical issues: 6 → 0
- ✅ **SC-007**: High priority issues: 12 → ≤2 (large file refactoring deferred)
- ✅ **SC-008**: Test infrastructure: Vitest + MSTest configured and runnable
- ✅ **SC-009**: `npm run lint` completes in <10s with zero errors
- ✅ **SC-010**: `npm run format` formats all files without errors
- ✅ **SC-011**: All C# public APIs have XML documentation
- ✅ **SC-012**: XML documentation file generates without warnings
- ✅ **SC-013**: Application connects to C:\websites\TriviaSpark\trivia.db on startup
- ✅ **SC-014**: Re-running site audit shows CRITICAL and HIGH violations resolved

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** = maps task to specific user story for traceability
- **Each user story is independently completable and testable**
- **No tests requested** = Focus on infrastructure setup, not test writing
- **Constitution violations** = These are the explicit purpose of this feature and will be remediated
- **Large file refactoring (US6)** = Plan creation only, implementation deferred to future feature
- **Commit frequency**: Commit after each logical group of tasks or at each checkpoint
- **Stop at checkpoints** to validate each user story independently before proceeding
