# Quickstart: Admin Login System

**Feature**: `003-admin-login-system` | **Date**: 2026-02-26

## Prerequisites

- .NET 10 SDK installed
- Node.js 18+ installed
- Production database at `C:\websites\TriviaSpark\trivia.db`

## Implementation Order

### Step 1: Backend — Session Entity & Service

1. Create `TriviaSpark.Api/Data/Entities/UserSession.cs` entity
2. Add `DbSet<UserSession>` to `TriviaSparkDbContext.cs` with index configuration
3. Create EF Core migration: `dotnet ef migrations add AddUserSessions`
4. Create `TriviaSpark.Api/Services/ISessionService.cs` interface
5. Create `TriviaSpark.Api/Services/EfCore/EfCoreSessionService.cs` implementation
6. Register `ISessionService` in `Program.cs` DI container

### Step 2: Backend — Auth Middleware

1. Create `TriviaSpark.Api/Middleware/SessionAuthMiddleware.cs`
   - Read `triviaspark_session` cookie
   - Look up session in database, validate not expired
   - Slide expiration (update `ExpiresAt` and `LastAccessAt`)
   - Set `HttpContext.Items["User"]` with user object (including role)
2. Register middleware in `Program.cs` pipeline (after CORS, before endpoints)
3. Remove the no-op cookie middleware

### Step 3: Backend — Auth Endpoints

Add to `ApiEndpoints.EfCore.cs`:

1. `POST /api/auth/login` — validate credentials via `IAdminService` user lookup + BCrypt verify, create session via `ISessionService`, set cookie
2. `POST /api/auth/logout` — delete session, clear cookie
3. `GET /api/auth/me` — return user from `HttpContext.Items["User"]` or 401

### Step 4: Backend — Admin Endpoints

Add to `ApiEndpoints.EfCore.cs`:

1. Create `AdminAuthFilter` endpoint filter — checks `HttpContext.Items["User"]` has Admin role
2. Map admin user endpoints at `/api/admin/users` with admin filter
3. Map admin role endpoints at `/api/admin/roles` with admin filter
4. Wire to existing `IAdminService` methods

### Step 5: Backend — Fix Hardcoded User IDs

1. Create helper `GetAuthenticatedUserId(HttpContext)` 
2. Replace `"mark-user-id"` at L301, L741, L857 in `ApiEndpoints.EfCore.cs`
3. Update `EventImageService.cs` fallback logic

### Step 6: Backend — Role Seeding & Default Admin

1. Uncomment/re-enable role initialization in `Program.cs`
2. Add default admin user creation when zero users exist
3. Run as scoped service before `app.Run()`

### Step 7: Frontend — Auth Context & Hook

1. Create `client/src/contexts/AuthContext.tsx` — provider with `GET /api/auth/me` query
2. Create `client/src/hooks/useAuth.ts` — exposes user, login, logout, isAuthenticated
3. Wrap app in `AuthProvider` in `App.tsx`

### Step 8: Frontend — Login Page

1. Create `client/src/pages/login.tsx` — Zod schema, react-hook-form, shadcn/ui form
2. Add `/login` route to `App.tsx`
3. Implement redirect-after-login (store intended URL)

### Step 9: Frontend — Protected Routes

1. Create `client/src/lib/auth.ts` — `ProtectedRoute` component
2. Wrap admin routes (`/admin`, `/dashboard`, `/events/:id/manage`, etc.) with `ProtectedRoute`
3. Update `Admin.tsx` to work with the now-live backend endpoints (verify existing API calls match contract)

### Step 10: Testing

1. Create `tests/http/auth-admin-tests.http` — HTTP tests for all auth and admin endpoints
2. Verify login flow end-to-end
3. Verify admin panel loads and functions
4. Verify protected routes redirect to login when unauthenticated

## Verification

```bash
# Build frontend
npm run build

# Run server
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj

# Test login (should return 200 with user object)
# POST http://localhost:14166/api/auth/login
# { "identifier": "admin", "password": "ChangeMe123!" }

# Test admin access (should return 200 with user list)
# GET http://localhost:14166/api/admin/users
# (with session cookie from login)
```
