<!--
═══════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT - Constitution v1.0.0
═══════════════════════════════════════════════════════════════════════════

Version Change: TEMPLATE → 1.0.0 (INITIAL RATIFICATION)

Constitution Discovery Summary:
- Analyzed: 137 source files (46 C#, 91 TypeScript/TSX)
- Patterns Found: 15 high-confidence patterns
- Interactive Decisions: 8 formalized principles
- Coverage: Full-stack (frontend + backend + infrastructure)

Modified Principles:
✅ NEW: I. Frontend Technology Stack (React 19 + TypeScript + shadcn/ui)
✅ NEW: II. Backend Technology Stack (ASP.NET Core 10 + EF Core + SQLite)
✅ NEW: III. Validation & Type Safety (Zod + Data Annotations)
✅ NEW: IV. Testing Standards (Vitest + MSTest - NOT YET IMPLEMENTED)
✅ NEW: V. Error Handling & Observability (Serilog + ILoggingService)
✅ NEW: VI. File Organization (Strict directory structure)
✅ NEW: VII. API Architecture (Minimal API preferred)
✅ NEW: VIII. Code Quality & Documentation (XML docs + ESLint + Prettier)

Added Sections:
✅ NEW: Security Best Practices
✅ NEW: Performance Standards
✅ NEW: Deployment Requirements

Templates Requiring Updates:
✅ UPDATED: .documentation/templates/spec-template.md (added constitution compliance header)
✅ UPDATED: .documentation/templates/plan-template.md (added detailed constitution checklist)
✅ UPDATED: .documentation/templates/tasks-template.md (added Phase 0 compliance tasks)
✅ ALIGNED: .github/copilot-instructions.md (file organization already documented)

Follow-up TODOs:
1. Configure automated testing (Vitest + MSTest) - see gap-analysis.md
2. Add ESLint + Prettier configuration
3. Remove console.log statements from frontend
4. Complete XML documentation on remaining 27% of C# methods
5. Migrate Controllers to Minimal API pattern
6. Add API request validation middleware
7. Update templates to reference constitution principles

Next Steps:
- Run /speckit.site-audit to validate compliance
- Use /speckit.pr-review for Pull Request reviews
- Run /speckit.evolve-constitution after PRs to propose amendments

═══════════════════════════════════════════════════════════════════════════
-->

# TriviaSpark Constitution

## Core Principles

### I. Frontend Technology Stack (MANDATORY)

All frontend code MUST use the standardized React 18+ stack for consistency, type safety, and maintainability.

**Required Technologies:**
- **React 19** with functional components and hooks (MUST)
- **TypeScript** with strict mode enabled (`strict: true` in tsconfig.json) (MUST)
- **Wouter** for client-side routing with proper base path handling (MUST)
- **TanStack Query** for server state management via `useQuery`/`useMutation` (MUST)
- **shadcn/ui** component library (new-york style) for all UI components (MUST)
- **Tailwind CSS** with wine-themed design system (`wine-*`, `champagne-*` tokens) (MUST)
- **Zod** + **react-hook-form** with `zodResolver` for all form validation (MUST)

**Code Splitting:**
- All page components MUST use `React.lazy()` for code splitting
- Suspense boundaries MUST be implemented for lazy-loaded components

**Rationale:** Ensures consistent developer experience, type safety, and optimized bundle sizes across the entire frontend codebase.

### II. Backend Technology Stack (MANDATORY)

All backend code MUST use the standardized ASP.NET Core + Entity Framework Core stack.

**Required Technologies:**
- **ASP.NET Core 10** (.NET 10 LTS) as the web framework (MUST)
- **Entity Framework Core** with SQLite for all data access (MUST)
- **C# nullable reference types** enabled in all projects (MUST)
- **Interface-based dependency injection** for all services (MUST)
- **Serilog** for structured logging (MUST)

**Database Requirements:**
- All data access MUST go through `TriviaSparkDbContext`
- Production database path: `C:\websites\TriviaSpark\trivia.db` (MUST)
- NEVER create local database files in repository
- Database schema MUST use snake_case for tables and columns
- All entities MUST have data annotations (`[Key]`, `[Required]`, `[ForeignKey]`)

**Service Layer Pattern:**
- Every service MUST have an `I*Service` interface
- Services MUST be registered as `AddScoped` in DI container
- All service methods MUST be async and return `Task<T>`

**Rationale:** Provides type safety, testability through DI, and consistent data access patterns. SQLite path enforcement prevents accidental local database creation.

### III. Validation & Type Safety (MANDATORY)

All user input and data MUST be validated at multiple layers for security and data integrity.

**Frontend Validation:**
- All forms MUST use Zod schemas with `react-hook-form` + `zodResolver`
- Shared types MUST be defined in `shared/schema.ts` using Zod
- Client-side validation MUST provide immediate feedback

**Backend Validation:**
- All entities MUST have data annotations (`[Required]`, `[StringLength]`, `[Range]`, etc.)
- API endpoints MUST validate request inputs before processing
- Validation errors MUST return structured 400 responses with field-level details

**API Contracts:**
- JSON serialization MUST use camelCase for frontend compatibility
- API responses MUST match TypeScript interfaces defined in shared schema

**Rationale:** Defense in depth—catch errors early on client, enforce on server, prevent invalid data from reaching database.

### IV. Testing Standards (MANDATORY)

All new features MUST include automated tests to ensure code quality and prevent regressions.

**Test Requirements:**
- All new API endpoints MUST have integration tests using MSTest
- All new frontend features MUST have unit tests using Vitest
- Tests MUST pass before code can be merged to main branch
- HTTP test files (.http) MUST be placed in `tests/http/` for manual testing

**Test Organization:**
- Backend tests: MSTest project in solution
- Frontend tests: Vitest with React Testing Library
- Integration tests: Test against real SQLite database
- HTTP tests: `tests/http/*.http` for manual API verification

**Coverage Goals:**
- Critical business logic: 80% minimum coverage
- API endpoints: 100% of happy paths, key error scenarios
- Frontend forms: All validation scenarios

**Current State:** 0 automated tests exist (technical debt). Testing must be incrementally added to new features.

**Rationale:** Automated tests prevent regressions, enable confident refactoring, and serve as living documentation.

### V. Error Handling & Observability (MANDATORY)

All errors MUST be handled gracefully and logged comprehensively for debugging and monitoring.

**Exception Handling:**
- All API requests MUST flow through `ExceptionHandlingMiddleware`
- Exceptions MUST be mapped to appropriate HTTP status codes (400, 401, 404, 500)
- Error responses MUST include `requestId`, `timestamp`, `path`, `method`
- Sensitive details MUST NOT be exposed in production error messages

**Structured Logging:**
- All backend operations MUST use `ILoggingService` wrapper
- Log appropriate events: `LogApiCall`, `LogBusinessEvent`, `LogError`, `LogPerformance`, `LogDatabaseOperation`
- Serilog MUST be configured with console + file sinks
- Separate error log file MUST capture all errors and warnings
- Performance warnings MUST be logged for operations >1s

**Frontend Error Handling:**
- React Error Boundaries MUST be used for component error isolation
- NO `console.log` statements in production code (MUST)
- User-facing errors MUST be displayed via toast notifications

**Rationale:** Proper error handling improves user experience and makes production issues diagnosable.

### VI. File Organization & Repository Structure (MANDATORY)

All files MUST be placed in designated directories to maintain clean, navigable repository structure.

**Directory Structure:**
- `client/src/` - Frontend React application with subfolders for components, pages, hooks, contexts, lib
- `TriviaSpark.Api/` - ASP.NET Core backend with subfolders for Controllers, Services, Data, Middleware
- `shared/` - Shared TypeScript schemas
- `tests/http/` - ALL .http test files
- `tools/` - Development and test scripts
- `copilot/` - Generated documentation
- `temp/` - Temporary files (gitignored)
- Root directory - ONLY configuration, README, LICENSE, solution files

**Placement Rules:**
- Development/test scripts → `tools/`
- **ALL** .http files → `tests/http/`
- Generated documentation → `copilot/`
- Temporary/cache files → `temp/`
- Source code → `client/src/` or `TriviaSpark.Api/`

**Rationale:** Clean organization makes codebase navigable, prevents clutter, and enforces separation of concerns.

### VII. API Architecture Pattern (MANDATORY)

All API endpoints MUST follow a consistent architectural pattern for maintainability.

**Preferred Pattern: Minimal API**
- New API endpoints SHOULD use Minimal API style (inline `app.MapGet()`, `app.MapPost()`, etc.)
- Endpoints MUST be grouped logically in `ApiEndpoints.EfCore.cs` or feature-specific files
- Complex endpoints with extensive logic MAY use Controllers when Minimal API becomes unwieldy

**Migration Path:**
- Existing Controllers should be gradually migrated to Minimal API
- Controllers are acceptable during transition period
- New features should prefer Minimal API unless complexity requires Controllers

**API Versioning:**
- Use route prefixes for versioning: `/api/`, `/api/v2/`
- Document breaking changes in CHANGELOG when introducing new versions

**Route Organization:**
- Group related endpoints appropriately
- Use proper HTTP verbs: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- Return appropriate status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 404 (Not Found)

**Rationale:** Minimal API reduces boilerplate, improves readability, and keeps related endpoints together.

### VIII. Code Quality & Documentation (MANDATORY)

All code MUST be documented and formatted consistently for maintainability.

**C# Documentation:**
- All public classes, interfaces, and methods MUST have XML `<summary>` comments
- Complex algorithms MUST include explanatory comments
- API controllers/endpoints MUST document parameters and return types

**TypeScript Documentation:**
- Component props MUST use TypeScript interfaces (serves as documentation)
- Complex business logic SHOULD include explanatory comments
- Public utility functions MAY use JSDoc for additional context

**Code Formatting:**
- ESLint MUST be configured for TypeScript with recommended rules
- Prettier MUST be configured for consistent code formatting
- Pre-commit hooks SHOULD enforce linting and formatting
- Continuous Integration SHOULD run linting checks

**Configuration Requirements:**
- `.eslintrc.json` MUST be added with TypeScript + React rules
- `.prettierrc` MUST be added with project formatting standards
- `.husky/` pre-commit hooks SHOULD run lint and format checks

**Rationale:** Consistent formatting reduces cognitive load; documentation helps onboarding and maintenance.

## Security Best Practices

**Authentication:**
- Current state: Authentication removed (anonymous mode)
- Future: When auth is re-added, MUST use secure session management with HTTP-only cookies
- Password hashing MUST use BCrypt with appropriate work factor

**Input Sanitization:**
- All user input MUST be validated and sanitized
- SQL injection prevention via EF Core parameterized queries (automatic)
- XSS prevention via React's automatic escaping + CSP headers

**API Security:**
- CORS MUST be properly configured with specific origins in production
- Rate limiting SHOULD be implemented on public endpoints
- API keys for external services (OpenAI, Unsplash) MUST be stored in User Secrets or environment variables

## Performance Standards

**Build Process:**
- Frontend build MUST output to `TriviaSpark.Api/wwwroot` for integrated deployment
- Static build for GitHub Pages MUST output to `docs/` directory
- Build warnings SHOULD be addressed and not ignored

**Runtime Performance:**
- Database queries MUST use appropriate indexes
- EF Core SHOULD use `.AsNoTracking()` for read-only queries
- Frontend SHOULD use `React.memo()` for expensive components

**Deployment:**
- Always build frontend: `npm run build`
- Always run backend: `dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj`
- Never use Vite dev server in production workflows

## Governance

### Amendment Process
- Constitution amendments require team discussion and approval
- Breaking changes MUST be documented in CHANGELOG
- Migration plans MUST be provided for all breaking changes
- Reviews should occur quarterly to ensure constitution stays current

### Compliance
- All Pull Requests MUST verify compliance with core principles
- Spec Kit agents (`/speckit.pr-review`) SHOULD be used for automated compliance checks
- Technical debt exceptions MAY be granted with explicit documentation and repayment plan

### Living Document
- This constitution supersedes informal practices
- Conflicts between constitution and existing code should be resolved toward constitution
- Constitution evolves with project needs but changes require team consensus
- Use `.github/copilot-instructions.md` for detailed runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
