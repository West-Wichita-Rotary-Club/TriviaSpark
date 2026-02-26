# Implementation Plan: Admin Login System

**Branch**: `003-admin-login-system` | **Date**: 2026-02-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-admin-login-system/spec.md`

## Summary

Enable and fix the admin system and user login capabilities. The backend has an existing `IAdminService`/`EfCoreAdminService` with full user/role CRUD and BCrypt password hashing, but no API endpoints expose it and all auth middleware was removed. The frontend `Admin.tsx` page exists but calls non-existent endpoints. This plan wires up authentication endpoints (login/logout/me), admin management endpoints, session middleware, frontend login page, auth context, and protected route enforcement — reconnecting existing service implementations to working API routes and creating the missing frontend auth layer.

## Technical Context

**Language/Version**: C# / .NET 10 (backend), TypeScript strict (frontend)  
**Primary Dependencies**: ASP.NET Core 10, Entity Framework Core + SQLite, React 19, Wouter, TanStack Query, shadcn/ui, Tailwind CSS, Zod + react-hook-form  
**Storage**: SQLite at `C:\websites\TriviaSpark\trivia.db` via `TriviaSparkDbContext`  
**Testing**: MSTest (backend), Vitest (frontend) — currently 0 tests exist (tech debt); new tests required per constitution  
**Target Platform**: Windows server (IIS/Kestrel), modern browsers  
**Project Type**: Web application (ASP.NET Core API + React SPA)  
**Performance Goals**: Login response <500ms, session validation <50ms per request  
**Constraints**: Session-based auth with HTTP-only cookies (no JWT), sliding 2-hour inactivity timeout  
**Scale/Scope**: Small admin team (<50 users), single-server deployment

## Constitution Check (Pre-Design)

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**TriviaSpark Constitution v1.0.0 Compliance:**

- [x] **I. Frontend Stack**: Login page will use React 19 + TypeScript strict + shadcn/ui + Tailwind + Zod validation with react-hook-form + zodResolver
- [x] **II. Backend Stack**: Uses ASP.NET Core 10 + EF Core + SQLite (production DB: `C:\websites\TriviaSpark\trivia.db`). Auth endpoints use Minimal API. Service layer follows `IAdminService` interface pattern with DI.
- [x] **III. Validation**: Login form uses Zod schema; backend `CreateUserRequest`/`UpdateUserRequest` records already exist; API request validation at endpoint level.
- [x] **IV. Testing**: HTTP test files for all new endpoints in `tests/http/`. Unit tests for auth middleware and login logic. (Constitution acknowledges 0 existing tests — incremental addition.)
- [x] **V. Error Handling**: Login errors use structured responses via `ExceptionHandlingMiddleware`. `ILoggingService` for auth events. No console.log in frontend auth code.
- [x] **VI. File Organization**: New files placed correctly: Middleware → `TriviaSpark.Api/Middleware/`, pages → `client/src/pages/`, contexts → `client/src/contexts/`, hooks → `client/src/hooks/`, HTTP tests → `tests/http/`.
- [x] **VII. API Architecture**: New auth and admin endpoints use Minimal API pattern in `ApiEndpoints.EfCore.cs` (consistent with all existing endpoints).
- [x] **VIII. Code Quality**: New C# classes/methods include XML `<summary>` docs. TypeScript interfaces for all props and API types.
- [x] **Security**: BCrypt password hashing (already in `EfCoreAdminService`), HTTP-only session cookies, generic login error messages, no credential logging, CORS already configured with `AllowCredentials`.
- [x] **Performance**: `.AsNoTracking()` for read-only user/role queries, session lookup indexed by session ID.

**Gate Result**: PASS — no violations. Proceeding to Phase 0.

## Constitution Check (Post-Design)

*Re-evaluated after Phase 1 design completion.*

- [x] **I. Frontend Stack**: Login page uses React 19 + TS strict + shadcn/ui + Tailwind + Zod + react-hook-form + zodResolver. `React.lazy()` code splitting. Auth context follows existing ThemeContext/WebSocketContext pattern.
- [x] **II. Backend Stack**: ASP.NET Core 10, EF Core SQLite at `C:\websites\TriviaSpark\trivia.db`. New `ISessionService` interface with `EfCoreSessionService` registered as `AddScoped`. All methods async returning `Task<T>`.
- [x] **III. Validation**: Zod schema for login form. Backend uses existing `CreateUserRequest`/`UpdateUserRequest` records with validation. Login endpoint validates inputs.
- [x] **IV. Testing**: HTTP test file in `tests/http/auth-admin-tests.http`. Constitution acknowledges 0 existing tests — incremental.
- [x] **V. Error Handling**: Auth errors flow through `ExceptionHandlingMiddleware`. Generic login error messages. `ILoggingService` for auth event logging. No console.log.
- [x] **VI. File Organization**: All new files in correct directories (see Source Code tree below).
- [x] **VII. API Architecture**: All new endpoints use Minimal API pattern in `ApiEndpoints.EfCore.cs`. No new controllers.
- [x] **VIII. Code Quality**: XML docs on all new C# classes/methods/interfaces. TypeScript interfaces for all props and API types.
- [x] **Security**: BCrypt hashing (existing), HTTP-only session cookies, generic login errors, no credential logging, CORS with `AllowCredentials` already configured.
- [x] **Performance**: `.AsNoTracking()` for read-only user/role queries. Session table indexed on `UserId` and `ExpiresAt`.

**Post-Design Gate Result**: PASS — no violations. All design artifacts align with constitution.

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-login-system/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (new/modified files)

```text
TriviaSpark.Api/
├── Middleware/
│   └── SessionAuthMiddleware.cs        # NEW - Session validation middleware
├── Services/
│   └── ISessionService.cs             # NEW - Session management interface
│   └── EfCore/
│       └── EfCoreSessionService.cs    # NEW - Session management implementation
├── Data/
│   └── Entities/
│       └── UserSession.cs             # NEW - Session entity
│   └── TriviaSparkDbContext.cs        # MODIFY - Add UserSessions DbSet
├── ApiEndpoints.EfCore.cs             # MODIFY - Add auth + admin endpoint groups
├── Program.cs                         # MODIFY - Re-enable auth middleware, role seeding

client/src/
├── pages/
│   └── login.tsx                      # NEW - Login page component
├── contexts/
│   └── AuthContext.tsx                 # NEW - Auth context provider
├── hooks/
│   └── useAuth.ts                     # NEW - Auth hook
├── lib/
│   └── auth.ts                        # NEW - Auth utility (protected route component)
├── App.tsx                            # MODIFY - Wrap with AuthProvider, add login route, protect admin routes

tests/http/
└── auth-admin-tests.http              # NEW - HTTP test file for auth + admin endpoints
```

**Structure Decision**: Web application pattern. Backend code stays in `TriviaSpark.Api/` following existing service/middleware/entity conventions. Frontend code stays in `client/src/` following existing page/context/hook conventions. No new projects needed — all changes extend existing structure.

## Complexity Tracking

No constitution violations to justify. All design choices align with existing patterns.
