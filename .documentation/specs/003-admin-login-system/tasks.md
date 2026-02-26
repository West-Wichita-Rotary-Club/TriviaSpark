# Tasks: Admin Login System

**Input**: Design documents from `/specs/003-admin-login-system/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: HTTP endpoint tests included (spec requires testing per constitution principle IV). No unit tests explicitly requested — incremental addition per constitution acknowledgment.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `TriviaSpark.Api/` (ASP.NET Core Minimal API)
- **Frontend**: `client/src/` (React 19 + TypeScript)
- **Tests**: `tests/http/` (HTTP test files)
- **Database**: `C:\websites\TriviaSpark\trivia.db` (production SQLite)

---

## Phase 1: Setup

**Purpose**: Verify prerequisites and constitution compliance (pre-development gate)

- [ ] T001 [P] Verify branch is `003-admin-login-system` and all design docs are present in `.documentation/specs/003-admin-login-system/`
- [ ] T002 [P] Verify constitution compliance: frontend stack (React 19, TS strict, shadcn/ui, Tailwind, Zod + react-hook-form) per plan.md pre-design check
- [ ] T003 [P] Verify constitution compliance: backend stack (ASP.NET Core 10, EF Core, SQLite at `C:\websites\TriviaSpark\trivia.db`, interface-based DI) per plan.md pre-design check
- [ ] T004 [P] Verify file organization: all new files target correct directories (Middleware/, Services/, Data/Entities/, pages/, contexts/, hooks/, lib/, tests/http/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core session infrastructure and database setup that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. This phase creates the session management layer and authentication middleware that all stories depend on.

### Session Entity & Database

- [ ] T005 Create UserSession entity with Id, UserId (FK), CreatedAt, ExpiresAt, LastAccessAt, IpAddress, UserAgent, and User navigation property in `TriviaSpark.Api/Data/Entities/UserSession.cs`
- [ ] T006 Add `DbSet<UserSession> UserSessions` to TriviaSparkDbContext, configure entity with indexes on UserId and ExpiresAt, and add cascade delete relationship to User in `TriviaSpark.Api/Data/TriviaSparkDbContext.cs`
- [ ] T007 Generate EF Core migration for UserSessions table: `dotnet ef migrations add AddUserSessions --project TriviaSpark.Api`

### Session Service

- [ ] T008 [P] Create ISessionService interface with CreateSessionAsync, ValidateSessionAsync, DeleteSessionAsync, DeleteUserSessionsAsync, SlideExpirationAsync methods in `TriviaSpark.Api/Services/ISessionService.cs`
- [ ] T009 Create EfCoreSessionService implementing ISessionService with 2-hour sliding expiration, BCrypt-free session ID (GUID), and expired session cleanup in `TriviaSpark.Api/Services/EfCore/EfCoreSessionService.cs`
- [ ] T010 Register `ISessionService` as `AddScoped<ISessionService, EfCoreSessionService>()` in `TriviaSpark.Api/Program.cs` DI container

### Authentication Middleware

- [ ] T011 Create SessionAuthMiddleware that reads `triviaspark_session` cookie, validates session via ISessionService, slides expiration, and sets `HttpContext.Items["User"]` with user object (including role) in `TriviaSpark.Api/Middleware/SessionAuthMiddleware.cs`
- [ ] T012 Wire SessionAuthMiddleware into Program.cs pipeline after CORS and before endpoint mapping, remove the existing no-op cookie middleware (L200-203) in `TriviaSpark.Api/Program.cs`

### Data Seeding

- [ ] T013 Add role seeding on startup: create Admin, Host, User roles if they don't already exist, using a scoped IAdminService.EnsureDefaultRolesExistAsync() call before app.Run() in `TriviaSpark.Api/Program.cs`
- [ ] T014 Add default admin user creation on startup when zero users exist: username "admin", email "admin@triviaspark.local", password "ChangeMe123!" (BCrypt hashed), Admin role, using scoped IAdminService in `TriviaSpark.Api/Program.cs`

**Checkpoint**: Session infrastructure ready. Database has UserSessions table, middleware populates auth context, default admin user exists. User story implementation can now begin.

---

## Phase 3: User Story 1 — Admin Login/Logout (Priority: P1) 🎯 MVP

**Goal**: Enable administrators to log in with username/email and password, maintain authenticated sessions across page refreshes, and log out. This is the core authentication flow.

**Independent Test**: Navigate to `/login`, enter "admin" / "ChangeMe123!", verify redirect to dashboard. Refresh the page — session persists. Click logout — redirected to login page. Try accessing `/admin` without session — redirected to login.

**Spec References**: FR-001 (login endpoint), FR-002 (logout endpoint), FR-003 (current user endpoint), FR-008 (login page), FR-009 (auth context), FR-014 (password hashing), FR-015 (generic error messages)

### Backend — Auth Endpoints

- [ ] T015 [US1] Add auth endpoint group with POST `/api/auth/login` that accepts `{ identifier, password }`, looks up user by username OR email via IAdminService, verifies password with BCrypt, creates session via ISessionService, sets `triviaspark_session` HTTP-only cookie (SameSite=Lax, Secure in production, Path=/, Max-Age=7200), returns user profile per contracts/auth.md in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T016 [US1] Add POST `/api/auth/logout` endpoint that reads session cookie, deletes session via ISessionService, clears cookie, returns `{ message: "Logged out" }` (idempotent — 200 even with no active session) in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T017 [US1] Add GET `/api/auth/me` endpoint that returns authenticated user from `HttpContext.Items["User"]` (id, username, email, fullName, role with id and name, createdAt) or 401 `{ message: "Not authenticated" }` in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`

### Frontend — Auth Infrastructure

- [ ] T018 [P] [US1] Create AuthContext provider that calls `GET /api/auth/me` on mount via TanStack Query (with `on401: "returnNull"`), exposes user state, loading state, login mutation (POST `/api/auth/login`), and logout mutation (POST `/api/auth/logout`) in `client/src/contexts/AuthContext.tsx`
- [ ] T019 [P] [US1] Create useAuth hook that consumes AuthContext and exposes `user`, `isLoading`, `isAuthenticated`, `login(identifier, password)`, `logout()` in `client/src/hooks/useAuth.ts`

### Frontend — Login Page

- [ ] T020 [US1] Create login page with Zod schema validation (`identifier`: required string, `password`: required string min 1), react-hook-form with zodResolver, shadcn/ui form components (Input, Button, Card), error display for invalid credentials (generic message per FR-015), redirect to intended URL after login in `client/src/pages/login.tsx`
- [ ] T021 [US1] Add `/login` route using React.lazy, wrap entire app in `<AuthProvider>`, and import AuthContext in `client/src/App.tsx`

**Checkpoint**: Admin can log in at `/login`, session persists across refreshes, `GET /api/auth/me` returns user profile, logout clears session. US1 is fully functional.

---

## Phase 4: User Story 2 — Admin Manages Trivia Events (Priority: P2)

**Goal**: Associate events with the authenticated user who creates them instead of a hardcoded ID. Enforce authentication on event management endpoints so only logged-in users (admin or host) can create, edit, and delete events.

**Independent Test**: Log in as admin, create a new event — verify the event's HostId is the admin's user ID (not "mark-user-id"). Try creating an event without being logged in — verify 401 rejection.

**Spec References**: FR-006 (event ownership), FR-007 (role-based access — admin/host for events)

### Backend — Fix Hardcoded User IDs

- [ ] T022 [US2] Create static helper method `GetAuthenticatedUserId(HttpContext httpContext)` that extracts user ID from `HttpContext.Items["User"]` and returns it (or null if unauthenticated) in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T023 [US2] Replace hardcoded `"mark-user-id"` in event creation endpoint (~L301) with `GetAuthenticatedUserId(context)` call in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T024 [P] [US2] Replace hardcoded `"mark-user-id"` in question selection endpoints (~L741, ~L857) with `GetAuthenticatedUserId(context)` call in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T025 [P] [US2] Update EventImageService.cs fallback logic to use authenticated user ID from HttpContext instead of hardcoded `"mark-user-id"` in `TriviaSpark.Api/Services/EfCore/EventImageService.cs`

### Backend — Event Auth Enforcement

- [ ] T026 [US2] Create `AuthRequiredFilter` endpoint filter that checks `HttpContext.Items["User"]` is not null, returns 401 if unauthenticated, and apply it to event creation/update/delete endpoints in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T027 [US2] Add host-level ownership check: host-role users can only update/delete events where HostId matches their user ID; admin-role users bypass ownership check in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`

**Checkpoint**: Events are created with the real authenticated user's ID. Unauthenticated users cannot create/edit/delete events. Hosts can only manage their own events; admins can manage all events.

---

## Phase 5: User Story 3 — Admin Manages Users and Roles (Priority: P3)

**Goal**: Expose the existing IAdminService through API endpoints so the Admin.tsx frontend panel can manage users (CRUD + role changes) and roles (CRUD). Only admin-role users can access these endpoints.

**Independent Test**: Log in as admin, navigate to `/admin`, verify user list loads from API. Create a new user, verify it appears. Change a user's role, verify it persists. Delete a user, verify removal. Test role management similarly.

**Spec References**: FR-004 (admin user endpoints), FR-005 (admin role endpoints), FR-013 (prevent last admin deletion), FR-016 (connect Admin.tsx)

### Backend — Admin Endpoints

- [ ] T028 [US3] Create `AdminAuthFilter` endpoint filter that checks `HttpContext.Items["User"]` has Admin role (role name == "Admin"), returns 403 if not admin, 401 if unauthenticated in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T029 [US3] Map admin user management endpoints at `/api/admin/users`: GET (list all), GET `/{id}` (get by ID), POST (create), PUT `/{id}` (update), DELETE `/{id}` (delete with last-admin guard), POST `/{userId}/change-role` — all wired to IAdminService, all using AdminAuthFilter, per contracts/admin-users.md in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T030 [US3] Map admin role management endpoints at `/api/admin/roles`: GET (list all), GET `/{id}` (get by ID), POST (create), PUT `/{id}` (update), DELETE `/{id}` (with assigned-users guard) — all wired to IAdminService, all using AdminAuthFilter, per contracts/admin-roles.md in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T031 [US3] Verify EfCoreAdminService.DeleteUserAsync prevents deletion of last admin user (FR-013); add guard if missing in `TriviaSpark.Api/Services/EfCore/EfCoreAdminService.cs`

### Frontend — Admin Panel Integration

- [ ] T032 [US3] Verify and update Admin.tsx API calls to match contract response shapes (user objects with nested role object, proper status codes, error message format) in `client/src/pages/Admin.tsx`

**Checkpoint**: Admin panel at `/admin` fully functional: user list, create/edit/delete users, role changes, role management. Only admin-role users can access. Last admin cannot be deleted.

---

## Phase 6: User Story 4 — Protected Routes and Role-Based Access (Priority: P4)

**Goal**: Enforce authentication and authorization across all admin-facing frontend routes. Public participant routes (joining events, viewing leaderboards) remain accessible without login. Unauthenticated navigation to protected pages redirects to login.

**Independent Test**: Without logging in, navigate to `/admin` — verify redirect to `/login`. Log in as admin — verify access to all admin routes. Log in as host — verify access to event management but not user management. Navigate to public routes (home, join event) without login — verify access.

**Spec References**: FR-007 (role-based access), FR-010 (redirect to login with return URL)

### Frontend — Route Protection

- [ ] T033 [US4] Create ProtectedRoute component that checks isAuthenticated from useAuth, renders children if authenticated, redirects to `/login?redirect={currentPath}` if not, and optionally accepts a `requiredRole` prop for role-based guards in `client/src/lib/auth.ts`
- [ ] T034 [US4] Wrap admin routes (`/admin`, `/dashboard`, event management routes) with ProtectedRoute in `client/src/App.tsx`
- [ ] T035 [US4] Update login page to read `redirect` query parameter and navigate to that URL after successful login instead of default redirect in `client/src/pages/login.tsx`
- [ ] T036 [P] [US4] Add role-based navigation visibility: show/hide admin links in header/navigation based on user role from useAuth in `client/src/components/layout/Header.tsx` (or equivalent navigation component)
- [ ] T037 [US4] Verify public participant routes (home, join event, leaderboard, presenter view) remain accessible without authentication — no ProtectedRoute wrapper on these routes in `client/src/App.tsx`

**Checkpoint**: All admin pages require login. Role-based access enforced (admin vs host). Public routes work without auth. Login redirect preserves intended destination.

---

## Phase 7: User Story 5 — First-Run Admin Setup (Priority: P5)

**Goal**: Ensure the system is usable after a fresh deployment without manual database manipulation. Default roles and admin user are created automatically. The admin is encouraged to change the default password.

**Independent Test**: Delete all users and roles from database. Restart app. Verify default roles exist. Verify default admin user exists. Log in with admin/ChangeMe123!. Verify prompted to change password.

**Spec References**: FR-011 (role seeding), FR-012 (default admin), edge case (database has users but no roles — repair)

*Note: Core seeding logic was implemented in Phase 2 (T013, T014). This phase handles the user-facing enhancements and edge cases.*

- [ ] T038 [US5] Add first-login detection: when user logs in with default password, include a `passwordChangeRequired: true` flag in the `/api/auth/me` response in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T039 [US5] Display password change banner/prompt on dashboard when `passwordChangeRequired` is true, guiding admin to change default password via user management in `client/src/pages/Admin.tsx` or dashboard component
- [ ] T040 [US5] Verify idempotent seeding: restart app multiple times with existing data — confirm no duplicate roles or users created (already implemented in T013/T014 but verify edge cases) in `TriviaSpark.Api/Program.cs`
- [ ] T041 [US5] Verify independent role repair: if database has users but missing roles, startup creates only the missing roles without errors in `TriviaSpark.Api/Program.cs`

**Checkpoint**: Fresh deployment auto-creates roles and admin. Admin prompted to change default password. Repeated restarts create no duplicates. Missing roles are repaired.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Testing, documentation, and quality improvements that span multiple user stories

- [ ] T042 [P] Create HTTP test file with test cases for all auth endpoints (login success, login failure, logout, me authenticated, me unauthenticated) and all admin endpoints (user CRUD, role CRUD, permission checks) per constitution principle IV in `tests/http/auth-admin-tests.http`
- [ ] T043 [P] Update feature documentation with implementation notes and any deviations from plan in `.documentation/specs/003-admin-login-system/`
- [ ] T044 [P] Add security logging: log login attempts (success/failure without passwords), session creation/deletion, admin user management actions via ILoggingService in `TriviaSpark.Api/ApiEndpoints.EfCore.cs`
- [ ] T045 Run quickstart.md end-to-end validation: build frontend (`npm run build`), start server (`dotnet run`), test login, verify admin panel, test protected routes, test public routes
- [ ] T046 Verify no `console.log` statements in frontend auth code, no credential logging in backend, HTTP-only cookies set correctly — security review per constitution

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          → No dependencies — verification only
Phase 2 (Foundational)   → Depends on Phase 1 — BLOCKS all user stories
Phase 3 (US1: Login)     → Depends on Phase 2 — MVP milestone
Phase 4 (US2: Events)    → Depends on Phase 2 — can run parallel with US1 (backend only)
Phase 5 (US3: Admin)     → Depends on Phase 2 — can run parallel with US1/US2 (backend only)
Phase 6 (US4: Routes)    → Depends on Phase 3 (needs AuthContext and login page)
Phase 7 (US5: Setup)     → Depends on Phase 2 (seeding) + Phase 3 (login for testing)
Phase 8 (Polish)         → Depends on all user stories being complete
```

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No dependencies on other stories. **MVP target.**
- **US2 (P2)**: Can start after Phase 2. Backend tasks (T022-T027) have no dependency on US1. Can run in parallel.
- **US3 (P3)**: Can start after Phase 2. Backend tasks (T028-T031) have no dependency on US1. Frontend task (T032) needs auth context from US1 for testing.
- **US4 (P4)**: Depends on US1 completion (needs AuthContext, useAuth, login page, /login route).
- **US5 (P5)**: Depends on Phase 2 seeding + US1 login flow for testing password change prompt.

### Parallel Execution Opportunities

**Within Phase 2** (after T007 migration):
- T008 (ISessionService) can run in parallel — separate file

**Within Phase 3** (US1):
- T018 (AuthContext) + T019 (useAuth) can run in parallel — different files
- T015-T017 (backend) can run in parallel with T018-T019 (frontend) — different codebases

**Within Phase 4** (US2):
- T024 (question selection fixes) + T025 (EventImageService fix) can run in parallel — different files

**Across User Stories** (after Phase 2):
- US1 backend (T015-T017) || US2 backend (T022-T027) || US3 backend (T028-T031) — all in ApiEndpoints.EfCore.cs but different endpoint groups, manageable in sequence within the file

**Within Phase 8**:
- T042 (HTTP tests) + T043 (docs) + T044 (logging) can all run in parallel — different files

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Phases 1 + 2 + 3 (US1)** = Login/Logout functionality

This delivers:
- Working session infrastructure
- Admin can log in and log out
- Session persists across page refreshes
- Frontend auth context tracks login state
- Default admin user seeded on first run

**Task Count**: T001-T021 (21 tasks)

### Full Feature Delivery

All phases (1-8) deliver the complete admin login system with:
- Authentication (login/logout/session management)
- Event ownership (replace hardcoded IDs)
- Admin user/role management panel
- Protected route enforcement
- First-run setup with default admin
- HTTP endpoint tests

**Total Task Count**: 46 tasks

### Task Breakdown by Phase

| Phase | Description | Tasks | Parallelizable |
|-------|-------------|-------|----------------|
| 1 | Setup | T001-T004 (4) | All [P] |
| 2 | Foundational | T005-T014 (10) | T008 [P] |
| 3 | US1: Login/Logout | T015-T021 (7) | T018, T019 [P] |
| 4 | US2: Events | T022-T027 (6) | T024, T025 [P] |
| 5 | US3: Admin | T028-T032 (5) | — |
| 6 | US4: Protected Routes | T033-T037 (5) | T036 [P] |
| 7 | US5: First-Run Setup | T038-T041 (4) | — |
| 8 | Polish | T042-T046 (5) | T042, T043, T044 [P] |
| **Total** | | **46** | **12 parallelizable** |
