# Implementation Notes: Admin Login System

**Feature**: 003-admin-login-system
**Completed**: All 59 tasks across 8 phases

## Summary

Full session-based authentication system implemented for TriviaSpark with admin user/role management, protected routes, and first-run setup.

## Architecture Decisions

### Session-Based Auth (No JWT)
- HTTP-only cookie (`triviaspark_session`) with CSPRNG tokens (`RandomNumberGenerator.GetHexString(32)`)
- 2-hour sliding expiration with 5-minute debounce to reduce DB writes
- Custom `SessionAuthMiddleware` + `SessionAuthenticationHandler` for dual Minimal API / MVC controller support

### Constant-Time Login
- Pre-computed `DummyBCryptHash` in `AuthConstants` for timing-safe comparison on invalid usernames
- Prevents user enumeration via response timing differences

### Password Hashing
- BCrypt via `BCrypt.Net-Next 4.1.0`
- Default admin password: `ChangeMe123!` (flagged via `passwordChangeRequired` in `/api/auth/me`)

## Deviations from Plan

### Controller Migration (T057)
- Plan specified `[Authorize]` attributes on migrated endpoints; implemented as Minimal API endpoint filters instead since the endpoints use the custom `HttpContext.Items["User"]` pattern consistently with other endpoints
- `EfCoreTestController` and `EventsV2Controller` restricted to Development environment via inline endpoint filter rather than removed, to preserve dev-time debugging capability
- `EventImagesController` admin cleanup endpoint uses `AdminAuthFilter`

### Global 401 Interceptor (T047)
- Implemented via `QueryCache.onError` and `MutationCache.onError` on the TanStack QueryClient rather than `defaultOptions.queries.onError` (which is deprecated in TanStack Query v5)

## Files Created

| File | Purpose |
|------|---------|
| `TriviaSpark.Api/Data/Entities/UserSession.cs` | Session entity with FK to User |
| `TriviaSpark.Api/Utils/AuthConstants.cs` | Centralized auth config (cookie name, duration, options) |
| `TriviaSpark.Api/Services/ISessionService.cs` | Session service interface |
| `TriviaSpark.Api/Services/EfCore/EfCoreSessionService.cs` | Session CRUD with debounced sliding expiration |
| `TriviaSpark.Api/Middleware/SessionAuthMiddleware.cs` | Cookie → User resolution middleware |
| `TriviaSpark.Api/Middleware/SessionAuthenticationHandler.cs` | ASP.NET Core auth handler for `[Authorize]` |
| `client/src/contexts/AuthContext.tsx` | React auth provider with TanStack Query |
| `client/src/hooks/useAuth.ts` | Auth hook wrapper |
| `client/src/lib/auth.tsx` | ProtectedRoute component |
| `client/src/pages/login.tsx` | Login page with Zod validation |
| `tests/http/auth-admin-tests.http` | HTTP test file for all auth/admin endpoints |

## Files Modified

| File | Changes |
|------|---------|
| `TriviaSpark.Api/Program.cs` | DI registration, auth pipeline, startup seeding, HTTPS enforcement |
| `TriviaSpark.Api/Data/TriviaSparkDbContext.cs` | UserSessions DbSet + entity config |
| `TriviaSpark.Api/ApiEndpoints.EfCore.cs` | Auth, admin, image, unsplash, dev-test endpoint groups |
| `TriviaSpark.Api/Services/IAdminService.cs` | Added ChangePasswordAsync |
| `TriviaSpark.Api/Services/EfCore/EfCoreAdminService.cs` | Last-admin guards, password change, role seeding |
| `TriviaSpark.Api/Services/EfCore/EventImageService.cs` | Replaced hardcoded user ID |
| `client/src/App.tsx` | AuthProvider, ProtectedRoute wrappers, login route |
| `client/src/pages/Admin.tsx` | Nested role objects, role management |
| `client/src/pages/dashboard.tsx` | Password change banner |
| `client/src/pages/question-edit.tsx` | Authenticated user ID |
| `client/src/components/layout/header.tsx` | Role-based nav, logout button |
| `client/src/lib/queryClient.ts` | Global 401 interceptor |

## Files Deleted

| File | Reason |
|------|--------|
| `TriviaSpark.Api/Controllers/EfCoreTestController.cs` | Migrated to Minimal API (dev-only) |
| `TriviaSpark.Api/Controllers/EventsV2Controller.cs` | Migrated to Minimal API (dev-only) |
| `TriviaSpark.Api/Controllers/EventImagesController.cs` | Migrated to Minimal API |
| `TriviaSpark.Api/Controllers/UnsplashController.cs` | Migrated to Minimal API |

## Roles

| Role | Access |
|------|--------|
| Admin | Full access, manages users/roles, bypasses ownership checks |
| Owner | Creates/manages own events |
| Participant | Public routes only (join events, view leaderboards) |
| User | Legacy role, minimal access |
