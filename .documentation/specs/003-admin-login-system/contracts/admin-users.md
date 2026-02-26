# API Contracts: Admin - User Management

**Group**: `/api/admin/users` | **Auth Required**: Yes (Admin role only)

All endpoints in this group return **403 Forbidden** if the authenticated user does not have the Admin role, and **401 Unauthorized** if no valid session exists.

## GET /api/admin/users

List all users with their role information.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Success | `[ { "id": "string", "username": "string", "email": "string", "fullName": "string", "createdAt": "string (ISO 8601)", "role": { "id": "string", "name": "string" } } ]` |

---

## GET /api/admin/users/{id}

Get a single user by ID.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Found | `{ "id", "username", "email", "fullName", "createdAt", "role": { "id", "name" } }` |
| 404 | Not found | `{ "message": "User not found" }` |

---

## POST /api/admin/users

Create a new user account.

**Request**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "roleId": "string?"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 201 | Created | `{ "id", "username", "email", "fullName", "createdAt", "role": { ... } }` |
| 400 | Validation error | `{ "message": "string" }` |
| 409 | Username/email conflict | `{ "message": "Username or email already exists" }` |

---

## PUT /api/admin/users/{id}

Update an existing user's details (not password).

**Request**:
```json
{
  "username": "string?",
  "email": "string?",
  "fullName": "string?",
  "roleId": "string?"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Updated | `{ "id", "username", "email", "fullName", "createdAt", "role": { ... } }` |
| 404 | Not found | `{ "message": "User not found" }` |
| 409 | Username/email conflict | `{ "message": "Username or email already exists" }` |

---

## DELETE /api/admin/users/{id}

Delete a user account.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 204 | Deleted | No body |
| 404 | Not found | `{ "message": "User not found" }` |
| 409 | Cannot delete | `{ "message": "Cannot delete the last admin user" }` |

---

## POST /api/admin/users/{userId}/change-role

Change a user's role assignment.

**Request**:
```json
{
  "roleId": "string"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Updated | `{ "id", "username", "email", "fullName", "createdAt", "role": { ... } }` |
| 404 | User or role not found | `{ "message": "string" }` |
| 409 | Cannot change | `{ "message": "Cannot remove admin role from the last admin user" }` |
