# Feature Specification: Constitution Compliance & Audit Remediation

**Feature Branch**: `001-constitution-compliance`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "Bring the application up to compliance with the constitution and remediate identified issues from the site audit"

**Constitution Compliance**: This feature must comply with TriviaSpark Constitution v1.0.0 (see `.documentation/memory/constitution.md`)

**Audit Reference**: Based on site audit results from 2026-02-25 (.documentation/copilot/audit/2026-02-25_results.md)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Production Code (Priority: P1)

As a developer, I need all console.log statements removed from production code and proper code quality tools configured, so that the codebase follows professional standards and prevents information leakage in production.

**Why this priority**: This is the most critical issue affecting code quality and security. Console.log statements can leak sensitive data in production and violate Constitution Principle V. ESLint and Prettier are foundational tools needed before other improvements.

**Independent Test**: Run ESLint and verify zero console.log statements in client/src. Run Prettier and verify all files are formatted consistently. Build the application and verify no console output during normal operation.

**Acceptance Scenarios**:

1. **Given** the codebase contains 38 console.log statements, **When** cleanup is complete, **Then** zero console.log statements exist in client/src/**/*.{ts,tsx}
2. **Given** no linting configuration exists, **When** ESLint is configured, **Then** running `npm run lint` reports zero errors on a clean build
3. **Given** no formatting configuration exists, **When** Prettier is configured, **Then** running `npm run format` successfully formats all files without errors
4. **Given** a production build is created, **When** the application runs, **Then** no console output appears during normal user operations

---

### User Story 2 - Correct Database Configuration (Priority: P2)

As a system administrator, I need all database path references to use the correct production path (C:\websites\TriviaSpark\trivia.db), so that the application consistently uses the same database regardless of how it's started.

**Why this priority**: Database path violations are high-severity issues that can cause data inconsistencies and deployment failures. This affects data integrity and operational stability.

**Independent Test**: Search codebase for database path references and verify all use the production path or environment variable. Start the application and confirm it connects to C:\websites\TriviaSpark\trivia.db.

**Acceptance Scenarios**:

1. **Given** 10 incorrect database path references exist, **When** all are updated, **Then** all references use "C:\websites\TriviaSpark\trivia.db" or environment variable
2. **Given** the application is started, **When** database connection is established, **Then** logs confirm connection to C:\websites\TriviaSpark\trivia.db
3. **Given** Program.cs has fallback path "./data/trivia.db", **When** updated, **Then** fallback path is "C:\websites\TriviaSpark\trivia.db"
4. **Given** ApiEndpoints.EfCore.cs contains relative paths, **When** updated, **Then** paths use production database location

---

### User Story 3 - Test Infrastructure Foundation (Priority: P3)

As a developer, I need automated testing infrastructure configured for both frontend and backend, so that I can write tests for new features and prevent regressions.

**Why this priority**: Zero test coverage is a critical gap, but setting up infrastructure is separate from writing tests. This enables future test development and compliance with Constitution Principle IV.

**Independent Test**: Run `npm test` to execute Vitest tests. Run `dotnet test` to execute MSTest tests. Both should execute successfully (even if no tests exist yet).

**Acceptance Scenarios**:

1. **Given** no Vitest configuration exists, **When** configured, **Then** running `npm test` executes the test framework without errors
2. **Given** no MSTest project exists, **When** created, **Then** running `dotnet test` executes successfully
3. **Given** Vitest is configured, **When** a sample test file is created, **Then** the test is discovered and can be executed
4. **Given** MSTest project is created, **When** a sample test is added, **Then** the test is discovered and can be executed
5. **Given** test frameworks are configured, **When** package.json is updated, **Then** test scripts are documented and runnable

---

### User Story 4 - C# Code Documentation (Priority: P4)

As a developer maintaining the backend, I need all public classes, interfaces, and methods documented with XML summary comments, so that I can understand the purpose and usage of code components without reading implementation details.

**Why this priority**: Documentation improves maintainability and onboarding. While important, it's lower priority than runtime issues and testing infrastructure.

**Independent Test**: Run documentation coverage analysis and verify all public members in Services/ and Controllers/ have XML summary comments. Generate XML documentation file and verify it contains comprehensive documentation.

**Acceptance Scenarios**:

1. **Given** Services/OpenAIService.cs lacks XML comments, **When** documented, **Then** all public classes, interfaces, and methods have `<summary>` tags
2. **Given** Services/EfCore/*.cs files have incomplete documentation, **When** completed, **Then** all public members are documented
3. **Given** Controllers/*.cs files lack documentation, **When** added, **Then** all controller actions are documented with parameters and returns
4. **Given** XML documentation is added, **When** project is built, **Then** XML documentation file is generated without warnings

---

### User Story 5 - File Organization Compliance (Priority: P5)

As a developer, I need all files placed in their correct directories according to the constitution, so that the codebase structure remains navigable and organized.

**Why this priority**: File organization is important for maintainability but doesn't impact functionality. Can be addressed after more critical issues.

**Independent Test**: Verify TriviaSpark.Api/TriviaSpark.Api.http is moved to tests/http/. Verify no .http files exist outside tests/http/ directory.

**Acceptance Scenarios**:

1. **Given** TriviaSpark.Api/TriviaSpark.Api.http exists in wrong location, **When** moved, **Then** file exists at tests/http/triviaspark-api.http
2. **Given** file organization structure is defined, **When** audit is run, **Then** 100% of files are in correct directories
3. **Given** legacy server/ directory exists, **When** evaluated, **Then** decision is documented whether to archive or delete

---

### User Story 6 - Large File Refactoring (Priority: P6)

As a developer working on the codebase, I need excessively large files broken into smaller, focused components, so that code is easier to understand, test, and maintain.

**Why this priority**: While important for long-term maintainability, large files are functional and this can be done incrementally. Lower priority than fixing constitution violations.

**Independent Test**: Verify no files in client/src exceed 500 lines. Verify refactored components maintain same functionality through manual testing.

**Acceptance Scenarios**:

1. **Given** event-manage.tsx is 1778 lines, **When** refactored, **Then** no single file exceeds 500 lines and all functionality is preserved
2. **Given** components are split, **When** application runs, **Then** all features work identically to before refactoring
3. **Given** large files are identified, **When** refactoring plan is created, **Then** plan documents how to split while maintaining functionality

---

### Edge Cases

- What happens when ESLint finds violations in existing code? **Answer**: Fix all violations before merging to ensure clean baseline
- What happens when a developer adds console.log during debugging? **Answer**: ESLint pre-commit hook prevents commit
- What happens when database path environment variable is not set? **Answer**: Application falls back to hardcoded production path C:\websites\TriviaSpark\trivia.db
- What happens when tests fail? **Answer**: CI/CD pipeline blocks deployment, developer must fix before merging
- What happens when XML documentation is incomplete? **Answer**: Build generates warnings but doesn't fail (warnings should be addressed)
- What happens to archived server/ directory code? **Answer**: Document that it's archived, not active; safe to delete if confirmed unused

## Requirements *(mandatory)*

### Functional Requirements

#### Code Quality & Tooling (CRITICAL)

- **FR-001**: Codebase MUST have zero console.log statements in client/src/**/*.{ts,tsx} files (remove debug statements entirely; replace user-feedback console.log with toast notifications)
- **FR-002**: Repository MUST have .eslintrc.json configured with TypeScript and React recommended rules
- **FR-003**: Repository MUST have .prettierrc configured with project formatting standards
- **FR-004**: Running `npm run lint` MUST execute ESLint and report zero errors on clean code
- **FR-005**: Running `npm run format` MUST format all files using Prettier
- **FR-006**: ESLint MUST be configured to fail on console.log usage in production code

#### Database Configuration (HIGH)

- **FR-007**: Program.cs default connection string MUST use "Data Source=C:\\websites\\TriviaSpark\\trivia.db" (note: backslashes are escaped for C# string literal format)
- **FR-008**: ApiEndpoints.EfCore.cs MUST NOT contain hardcoded relative paths to database files
- **FR-009**: All database path references MUST use environment variable DATABASE_URL with fallback to production path
- **FR-010**: Application startup logs MUST confirm actual database path being used

#### Testing Infrastructure (HIGH)

- **FR-011**: Repository MUST have vitest.config.ts configured for frontend testing
- **FR-012**: Solution MUST have MSTest project for backend testing
- **FR-013**: Running `npm test` MUST execute Vitest test runner
- **FR-014**: Running `dotnet test` MUST execute MSTest test runner
- **FR-015**: Test scripts MUST be documented in package.json and README.md
- **FR-016**: Sample test files MUST be created to validate test infrastructure works (minimum complexity: render a component and assert on behavior, not just trivial arithmetic)

#### Documentation (MEDIUM)

- **FR-017**: All public classes in Services/ directory MUST have XML `<summary>` comments
- **FR-018**: All public interfaces in Services/ directory MUST have XML documentation
- **FR-019**: All public methods in Services/ directory MUST have XML documentation including parameters and return values
- **FR-020**: All controller actions in Controllers/ directory MUST have XML documentation
- **FR-021**: Project build MUST generate XML documentation file for API

#### File Organization (MEDIUM)

- **FR-022**: TriviaSpark.Api/TriviaSpark.Api.http MUST be moved to tests/http/triviaspark-api.http
- **FR-023**: ALL .http files MUST reside in tests/http/ directory
- **FR-024**: Decision on server/ directory (archive or delete) MUST be documented by tech lead based on git history analysis (if no commits in 6+ months and no active references, recommend deletion)
- **FR-025**: Repository structure MUST achieve 100% compliance with constitution file organization rules

#### Code Structure (LOW)

- **FR-026**: No files in client/src SHOULD exceed 500 lines (guideline, not strict requirement for this phase)
- **FR-027**: Refactoring plan for large files (event-manage.tsx, event-trivia-manage.tsx, question-edit.tsx, api-docs.tsx) MUST be documented
- **FR-028**: Any refactored components MUST maintain identical functionality to original implementation

### Key Entities *(include if feature involves data)*

This feature primarily involves configuration and code cleanup, not data entities. However, it affects:

- **Configuration Files**: .eslintrc.json, .prettierrc, vitest.config.ts - new files defining code quality standards
- **Test Projects**: MSTest project - new testing infrastructure
- **Database Connection Configuration**: Program.cs, ApiEndpoints.EfCore.cs - modified to use correct paths
- **Documentation Artifacts**: XML documentation comments - embedded in source code

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Constitution compliance audit score improves from 42% to minimum 80% (calculated by dividing compliant principles by total principles in constitution.md)
- **SC-002**: Code quality score improves from 35% to minimum 75% (weighted average: 40% ESLint pass rate, 30% documentation coverage, 20% test coverage, 10% file organization)
- **SC-003**: File organization compliance improves from 95% to 100%
- **SC-004**: Database path violations decrease from 10 to 0
- **SC-005**: Console.log statements decrease from 38 to 0
- **SC-006**: Critical issues decrease from 6 to 0
- **SC-007**: High priority issues decrease from 12 to maximum 2 (large file refactoring can be deferred)
- **SC-008**: Test infrastructure passes health check (frameworks configured and runnable)
- **SC-009**: Running `npm run lint` completes in under 10 seconds with zero errors
- **SC-010**: Running `npm run format` formats all files without errors and completes in under 15 seconds
- **SC-011**: All C# public classes, interfaces, and methods in Services/ have XML documentation
- **SC-012**: Build process generates XML documentation file without warnings for documented assemblies
- **SC-013**: Application successfully connects to C:\websites\TriviaSpark\trivia.db on startup
- **SC-014**: Re-running site audit shows all CRITICAL and HIGH priority violations resolved (except large file refactoring if deferred)

## Assumptions *(optional)*

- Development environment has access to C:\websites\TriviaSpark\ directory for database storage
- Developers are familiar with ESLint, Prettier, Vitest, and MSTest
- Existing functionality should not be changed, only code quality and configuration
- Large file refactoring can be done incrementally and may be partially deferred to future sprints
- No breaking changes to API contracts or frontend interfaces are needed
- Archived server/ directory code is not actively used in production (to be verified)

## Out of Scope *(optional)*

- Writing comprehensive test suites (only test infrastructure setup is in scope)
- Achieving specific test coverage percentages (that's for future work)
- Complete refactoring of all large files (plan is in scope, execution may be partial)
- Removing legacy Drizzle ORM dependencies (low priority, can be done later)
- Adding pre-commit hooks with Husky (medium priority, deferred to next sprint)
- Implementing JSDoc comments for frontend utilities (low priority)
- Running npm audit and updating vulnerable dependencies (separate effort)
- Performance optimization beyond fixing constitution violations

## Dependencies *(optional)*

- Access to production database path C:\websites\TriviaSpark\trivia.db for testing
- Node.js and npm installed for ESLint, Prettier, and Vitest configuration
- .NET SDK for MSTest project creation and execution
- Visual Studio or VS Code for C# XML documentation tooling
- Git for file moves and branch management
- Existing development environment and build pipeline remain functional

## Risks *(optional)*

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Removing console.log breaks debugging workflows | Medium | Low | Configure ESLint to allow console in development mode; use React DevTools instead |
| Database path change breaks local development | Low | High | Test thoroughly; use environment variables; document in README |
| ESLint configuration too strict | Medium | Medium | Start with recommended rules; gradually increase strictness |
| Test infrastructure setup takes longer than estimated | Medium | Low | Prioritize getting basic infrastructure working; defer complex test scenarios |
| Large file refactoring introduces bugs | High | High | Make refactoring optional for this phase; focus on working infrastructure first |
| XML documentation effort underestimated | High | Low | Document high-value services first; complete rest incrementally |

## Notes *(optional)*

### Implementation Priorities

Based on audit severity, implement in this order:

1. **Phase 1 (Must Have)**: Remove console.log, configure ESLint/Prettier, fix database paths
2. **Phase 2 (Should Have)**: Configure test infrastructure, move .http file
3. **Phase 3 (Could Have)**: Add XML documentation, archive legacy files
4. **Phase 4 (Future)**: Refactor large files, complete test suite

### Constitution Principles Addressed

This specification directly addresses violations of:

- **Principle IV**: Testing Standards - by configuring test infrastructure
- **Principle V**: Error Handling & Observability - by removing console.log statements
- **Principle VI**: File Organization - by moving misplaced files
- **Principle VIII**: Code Quality & Documentation - by adding ESLint, Prettier, and XML docs
- **Principle II**: Backend Technology Stack - by fixing database path violations

### Related Documents

- Constitution: `.documentation/memory/constitution.md`
- Audit Report: `.documentation/copilot/audit/2026-02-25_results.md`
- Spec Template: `.documentation/templates/spec-template.md`
