# API Contracts: Admin - Role Management

**Group**: `/api/admin/roles` | **Auth Required**: Yes (Admin role only)

All endpoints in this group return **403 Forbidden** if the authenticated user does not have the Admin role, and **401 Unauthorized** if no valid session exists.

## GET /api/admin/roles

List all roles.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Success | `[ { "id": "string", "name": "string", "description": "string?", "createdAt": "string (ISO 8601)" } ]` |

---

## GET /api/admin/roles/{id}

Get a single role by ID.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Found | `{ "id", "name", "description", "createdAt" }` |
| 404 | Not found | `{ "message": "Role not found" }` |

---

## POST /api/admin/roles

Create a new role.

**Request**:
```json
{
  "name": "string",
  "description": "string?"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 201 | Created | `{ "id", "name", "description", "createdAt" }` |
| 400 | Validation error | `{ "message": "string" }` |
| 409 | Name conflict | `{ "message": "Role name already exists" }` |

---

## PUT /api/admin/roles/{id}

Update an existing role.

**Request**:
```json
{
  "name": "string?",
  "description": "string?"
}
```

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 200 | Updated | `{ "id", "name", "description", "createdAt" }` |
| 404 | Not found | `{ "message": "Role not found" }` |
| 409 | Name conflict | `{ "message": "Role name already exists" }` |

---

## DELETE /api/admin/roles/{id}

Delete a role.

**Responses**:

| Status | Description | Body |
|--------|-------------|------|
| 204 | Deleted | No body |
| 404 | Not found | `{ "message": "Role not found" }` |
| 409 | Cannot delete | `{ "message": "Cannot delete role that has assigned users" }` |
