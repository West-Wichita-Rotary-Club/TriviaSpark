# Research: Admin Login System

**Feature**: `003-admin-login-system` | **Date**: 2026-02-26

## Research Task 1: Session Management Approach for ASP.NET Core

**Context**: The old session service was removed. Need to choose between ASP.NET Core built-in sessions, custom session table, or JWT tokens.

**Decision**: Custom session table (`UserSessions` entity) with server-side validation middleware.

**Rationale**:
- ASP.NET Core's built-in `IDistributedCache`-based sessions are designed for ephemeral data, not authentication state. They store session data in memory/Redis, making session enumeration (e.g., "list all active sessions for a user") difficult.
- JWT tokens are stateless — cannot be revoked server-side without a blocklist, which defeats the purpose. JWTs also complicate sliding expiration.
- A `UserSessions` table in SQLite provides: server-side revocation, sliding expiration via SQL update, session enumeration per user, and a simple query-based validation in middleware.
- The constitution requires EF Core for all data access, making a custom entity the natural fit.

**Alternatives considered**:
1. ASP.NET Core built-in sessions (`AddDistributedMemoryCache` + `AddSession`) — rejected because no persistent storage, no session enumeration, memory-only by default on SQLite deployments.
2. JWT with refresh tokens — rejected because spec requires session-based auth with HTTP-only cookies, and JWT revocation requires additional complexity.
3. ASP.NET Core Identity — rejected as too heavyweight; the existing `User`/`Role` entities and `EfCoreAdminService` already handle what Identity provides, without the framework coupling.

## Research Task 2: Session Cookie Configuration

**Context**: Need secure cookie handling compatible with the existing CORS configuration (`AllowCredentials` already enabled).

**Decision**: HTTP-only, `SameSite=Lax`, `Secure` in production, cookie name `triviaspark_session`.

**Rationale**:
- HTTP-only prevents JavaScript access (XSS protection).
- `SameSite=Lax` allows the cookie to be sent on top-level navigations (GET requests from links) but blocks it on cross-site POST requests, balancing security and usability.
- `Secure` flag enforced in production ensures cookies only travel over HTTPS.
- The existing `app.Use` cookie-parsing middleware in Program.cs (L200-203) is a no-op passthrough — it will be replaced by the session auth middleware.

**Alternatives considered**:
1. `SameSite=Strict` — rejected because it would break the flow when users navigate to the app from external links.
2. `SameSite=None` — rejected because it requires `Secure` even in development and is overly permissive.

## Research Task 3: Authentication Middleware Placement

**Context**: Program.cs has a comment `// Removed admin authorization middleware` at line 209. Need to determine where session auth middleware should be placed in the pipeline.

**Decision**: Place `SessionAuthMiddleware` after CORS (`app.UseCors`) and before endpoint mapping (`app.MapControllers`, `app.MapEfCoreApiEndpoints`). Replace the existing no-op cookie middleware.

**Rationale**:
- The middleware must run after CORS so preflight OPTIONS requests aren't blocked.
- It must run before endpoint mapping so `HttpContext.Items["User"]` is populated for endpoint authorization checks.
- The middleware does NOT reject unauthenticated requests — it only populates the user context. Individual endpoint groups apply authorization via endpoint filters.
- This avoids breaking public routes (health check, event join, participant routes).

**Alternatives considered**:
1. ASP.NET Core `[Authorize]` attribute with `AddAuthentication`/`AddAuthorization` — rejected because the project uses Minimal API pattern exclusively, and the built-in auth system adds complexity for custom session-table auth. Endpoint filters are the idiomatic Minimal API approach.
2. Per-endpoint auth checks — rejected as too much repetition; an endpoint filter on the admin group is cleaner.

## Research Task 4: Admin Endpoint Mapping Pattern

**Context**: Existing endpoints use `app.MapGroup("/api")` with `RequireCors("ApiCors")` and a `CorsFilter`. The admin service is registered but no endpoints expose it.

**Decision**: Add two new endpoint groups within `MapEfCoreApiEndpoints`: `/api/auth` (public) and `/api/admin` (protected). Use an `AdminAuthFilter` endpoint filter on the admin group.

**Rationale**:
- Follows the exact same pattern as existing endpoint groups in `ApiEndpoints.EfCore.cs`.
- The `/api/auth` group (login, logout, me) is public — no auth filter needed.
- The `/api/admin` group (user CRUD, role CRUD) uses an `AdminAuthFilter` that checks `HttpContext.Items["User"]` for admin role.
- Event management endpoints (`/api/events`) need a lighter `EventAuthFilter` that checks for any authenticated user with admin or owner role (returns 403 for participant role), then individual endpoints check ownership for owner-role users.
- This keeps auth logic centralized in filters, not scattered across endpoint bodies.

**Alternatives considered**:
1. Separate `AdminController` — rejected per constitution principle VII (Minimal API preferred).
2. Inline auth checks in each endpoint — rejected as repetitive and error-prone.

## Research Task 5: Frontend Auth Architecture

**Context**: No auth context, hook, or login page exists. The app uses Wouter for routing, TanStack Query for data fetching, and shadcn/ui for components.

**Decision**: Create `AuthContext.tsx` provider wrapping the app, `useAuth()` hook, `login.tsx` page, and a `ProtectedRoute` wrapper component.

**Rationale**:
- `AuthContext` calls `GET /api/auth/me` on mount to check for existing session. Uses TanStack Query with `on401: 'returnNull'` (already supported in `queryClient.ts`).
- `useAuth()` hook exposes `user`, `isLoading`, `isAuthenticated`, `login()`, `logout()`.
- `ProtectedRoute` component wraps admin routes — renders children if authenticated, redirects to `/login` if not, stores the intended URL for post-login redirect.
- Login page uses Zod schema + react-hook-form + zodResolver per constitution principle III.
- This pattern is consistent with the existing context pattern (`ThemeContext`, `WebSocketContext`).

**Alternatives considered**:
1. Route-level guards in each page component — rejected as repetitive; a wrapper component is DRY.
2. Navigation guard middleware — Wouter doesn't have router middleware; the `ProtectedRoute` pattern is idiomatic.

## Research Task 6: Hardcoded User ID Replacement Strategy

**Context**: `"mark-user-id"` is hardcoded in multiple places in `ApiEndpoints.EfCore.cs` and `EventImageService.cs`. These must be replaced with the authenticated user's ID.

**Decision**: Replace hardcoded IDs with the user from `HttpContext.Items["User"]`. Add a helper method `GetAuthenticatedUserId(HttpContext)` that returns the user ID from session context, falling back to null for unauthenticated requests.

**Rationale**:
- Event creation must use the authenticated user's ID as `HostId`.
- Question selection must use the authenticated user's ID as `SelectedByUserId`.
- `EventImageService.cs` fallback logic already handles null user IDs gracefully — the null-check pattern can be simplified once auth is in place.
- A shared helper method avoids duplicating the extraction logic.

**Alternatives considered**:
1. `ClaimsPrincipal` — rejected because we're not using ASP.NET Core's built-in auth; `HttpContext.Items` is simpler for custom session auth.
2. Leave fallback to "mark-user-id" — rejected; spec requires real user association.

## Research Task 7: Role Seeding and Default Admin

**Context**: Program.cs has `// Removed role initialization` at L230. Need to re-enable and extend it to seed the default admin user.

**Decision**: Call `IAdminService.EnsureDefaultRolesExistAsync()` from Program.cs startup, then check for zero users and create the default admin if needed. Run as a scoped operation before `app.Run()`.

**Rationale**:
- `EnsureDefaultRolesExistAsync()` already exists in `IAdminService` — it creates Admin, Owner, and Participant roles if missing.
- Default admin creation uses `CreateUserAsync` with username "admin", email "admin@triviaspark.local", password "ChangeMe123!" (hashed by service).
- Running in a scoped service before `app.Run()` ensures the database is seeded before any requests arrive.
- Idempotent: checks if users exist before creating, checks if roles exist before creating.

**Alternatives considered**:
1. EF Core migration seed data — rejected because seed data changes (like re-creating a deleted admin) wouldn't be picked up without new migrations.
2. Separate CLI command — rejected as spec requires automatic seeding on first startup.
