# API Contracts: Authentication

**Group**: `/api/auth` | **Auth Required**: No (public endpoints)

## POST /api/auth/login

Authenticate a user and create a session.

**Request**:
```json
{
  "identifier": "string",   // Username or email
  "password": "string"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Login successful | `{ "id": "string", "username": "string", "email": "string", "fullName": "string", "role": { "id": "string", "name": "string" } }` |
| 401 | Invalid credentials | `{ "message": "Invalid credentials" }` |
| 400 | Validation error | `{ "message": "Identifier and password are required" }` |

**Side Effects**:
- Creates a `UserSession` row in the database
- Sets `triviaspark_session` HTTP-only cookie with the session ID
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Secure` (production only), `Path=/`, `Max-Age=7200`

---

## POST /api/auth/logout

End the current session.

**Request**: No body. Session identified by cookie.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Logout successful | `{ "message": "Logged out" }` |
| 200 | No active session (idempotent) | `{ "message": "Logged out" }` |

**Side Effects**:
- Deletes the `UserSession` row from the database
- Clears the `triviaspark_session` cookie

---

## GET /api/auth/me

Get the currently authenticated user's profile.

**Request**: No body. Session identified by cookie.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Authenticated | `{ "id": "string", "username": "string", "email": "string", "fullName": "string", "role": { "id": "string", "name": "string" }, "createdAt": "string (ISO 8601)" }` |
| 401 | Not authenticated | `{ "message": "Not authenticated" }` |
