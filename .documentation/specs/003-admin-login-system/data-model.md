# Data Model: Admin Login System

**Feature**: `003-admin-login-system` | **Date**: 2026-02-26

## Existing Entities (no changes needed)

### User

Already defined in `TriviaSpark.Api/Data/Entities/User.cs`.

| Field       | Type       | Constraints                 | Notes                      |
| ----------- | ---------- | --------------------------- | -------------------------- |
| Id          | string     | PK, auto-generated GUID     |                            |
| Username    | string     | Required, max 50, unique     | Login identifier (option 1)|
| Email       | string     | Required, max 255, unique    | Login identifier (option 2)|
| Password    | string     | Required                     | BCrypt hashed              |
| FullName    | string     | Required, max 100            |                            |
| CreatedAt   | DateTime   | Default: UTC now             |                            |
| RoleId      | string?    | FK → Role.Id                 | Nullable                   |
| Role        | Role?      | Navigation property          |                            |

### Role

Already defined in `TriviaSpark.Api/Data/Entities/Role.cs`.

| Field       | Type       | Constraints                 | Notes                      |
| ----------- | ---------- | --------------------------- | -------------------------- |
| Id          | string     | PK, auto-generated GUID     |                            |
| Name        | string     | Required, unique             | "Admin", "Host", "User"    |
| Description | string?    | Optional                     |                            |
| CreatedAt   | DateTime   | Default: UTC now             |                            |
| Users       | ICollection| Navigation property          | One-to-many                |

## New Entity

### UserSession

New entity for server-side session management. Stores active authenticated sessions.

| Field       | Type           | Constraints                          | Notes                                |
| ----------- | -------------- | ------------------------------------ | ------------------------------------ |
| Id          | string         | PK, auto-generated GUID              | Session identifier, stored in cookie |
| UserId      | string         | Required, FK → User.Id               | The authenticated user               |
| CreatedAt   | DateTime       | Required, default: UTC now           | When the session was created         |
| ExpiresAt   | DateTime       | Required                             | Sliding: UTC now + 2 hours           |
| LastAccessAt| DateTime       | Required, default: UTC now           | Updated on each authenticated request|
| IpAddress   | string?        | Optional, max 45                     | Client IP at login time              |
| UserAgent   | string?        | Optional, max 500                    | Browser user-agent at login time     |
| User        | User           | Navigation property                  |                                      |

**Indexes**:
- `IX_UserSessions_UserId` on `UserId` (for listing sessions by user)
- `IX_UserSessions_ExpiresAt` on `ExpiresAt` (for cleanup of expired sessions)

**State transitions**:
- Created → Active (on login: new row inserted, cookie set)
- Active → Active (on each request: `ExpiresAt` and `LastAccessAt` updated)
- Active → Expired (when `ExpiresAt < DateTime.UtcNow`: middleware rejects, cleanup job can delete)
- Active → Deleted (on logout: row deleted, cookie cleared)

## Entity Relationships

```
User (1) ──── (0..N) UserSession
User (N) ──── (0..1) Role
Event (N) ──── (1) User [HostId → User.Id]
```

## Default Seed Data

### Roles (seeded on every startup if missing)

| Name        | Description                                      |
| ----------- | ------------------------------------------------ |
| Admin       | Full system access: user management, all events  |
| Host        | Can create events and manage own events           |
| User        | Basic participant access (future use)             |

### Default Admin User (seeded only when zero users exist)

| Field    | Value                      |
| -------- | -------------------------- |
| Username | admin                      |
| Email    | admin@triviaspark.local    |
| Password | ChangeMe123! (BCrypt hash) |
| FullName | System Administrator       |
| Role     | Admin                      |
