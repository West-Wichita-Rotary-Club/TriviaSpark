# Feature Specification: Admin Login System

**Feature Branch**: `003-admin-login-system`  
**Created**: 2026-02-26  
**Status**: Draft  
**Input**: User description: "Enable and fix the admin system and user login capabilities so that a user can login and manage events. Do a review of existing functionality and do a gap analysis to create a plan to have a fully functional user login and trivia event admin functionality."

**Constitution Compliance**: This feature must comply with TriviaSpark Constitution v1.0.0 (see `.documentation/memory/constitution.md`)

## Gap Analysis Summary

The codebase was audited for authentication, login, session management, and admin/event management functionality. The following summarizes the current state:

| Component                  | Status               | Details                                                                 |
| -------------------------- | -------------------- | ----------------------------------------------------------------------- |
| User & Role data models    | Implemented          | User.cs and Role.cs entities exist with proper EF Core relationships    |
| Admin service (backend)    | Implemented          | IAdminService and EfCoreAdminService fully implement user/role CRUD     |
| Admin API endpoints        | Missing              | No HTTP routes expose the admin service methods                         |
| Login endpoint             | Missing/Removed      | Old endpoints were disabled; no replacements exist                      |
| Session/auth middleware     | Removed              | Program.cs has comments indicating auth middleware was stripped out      |
| Role initialization        | Removed              | Default role seeding was removed from startup                           |
| Admin panel (frontend)     | Broken               | Admin.tsx calls non-existent /api/admin/* endpoints                     |
| Login page (frontend)      | Missing              | No login page exists in client/src/pages/                               |
| Auth context (frontend)    | Missing              | No AuthContext or useAuth hook for sharing auth state                   |
| Event management endpoints | Working (no auth)    | Full CRUD exists but uses hardcoded user ID and has no access control   |
| Event management UI        | Working (no auth)    | Event pages function but anyone can edit any event                      |

## Clarifications

### Session 2026-02-26

- Q: How long should an admin's authenticated session remain valid before requiring re-authentication? → A: Sliding 2-hour timeout (session extends with each request; expires after 2 hours of inactivity)
- Q: Should users log in with their username, their email address, or either one? → A: Either username or email in a single input field
- Q: What level of event access should the host role have? → A: Hosts can create events and edit/delete only events they created (own events only)
- Q: What should the default admin account credentials be for first-run setup? → A: Username "admin", password "ChangeMe123!"
- Q: Which capabilities should be explicitly out of scope for this feature? → A: All three out of scope for MVP: no password reset, no OAuth/SSO, no self-registration (admin creates all accounts)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Logs In and Accesses Dashboard (Priority: P1)

An administrator navigates to the TriviaSpark application, is presented with a login form, enters valid credentials (username and password), and gains access to the admin dashboard where they can see an overview of events, users, and system status.

**Why this priority**: Without login, no other admin functionality can be secured. This is the foundational gate that unlocks all administrative capabilities.

**Independent Test**: Can be fully tested by navigating to the login page, entering valid admin credentials, and verifying the admin dashboard loads with event/user summaries.

**Acceptance Scenarios**:

1. **Given** the admin has valid credentials, **When** they submit the login form, **Then** they are redirected to the admin dashboard and their session persists across page refreshes.
2. **Given** the admin enters invalid credentials, **When** they submit the login form, **Then** they see a clear error message and remain on the login page.
3. **Given** the admin is already logged in, **When** they navigate directly to the login page, **Then** they are redirected to the dashboard.
4. **Given** the admin is logged in, **When** they click the logout button, **Then** their session ends and they are returned to the login page.

---

### User Story 2 - Admin Manages Trivia Events (Priority: P2)

A logged-in administrator creates, edits, and deletes trivia events. Events they create are associated with their user account. They can view a list of all events, update event details (name, date, theme, configuration), and remove events that are no longer needed.

**Why this priority**: Event management is the core administrative workflow. Once login is working, admins need to manage the primary content of the platform.

**Independent Test**: Can be tested by logging in, creating a new event with all required fields, verifying it appears in the event list, editing its details, and confirming changes persist.

**Acceptance Scenarios**:

1. **Given** a logged-in admin, **When** they create a new event with valid details, **Then** the event is saved and appears in the event list with the admin recorded as the creator.
2. **Given** a logged-in admin viewing the event list, **When** they select an event and update its name and date, **Then** the changes are saved and reflected in the list.
3. **Given** a logged-in admin, **When** they delete an event, **Then** the event is removed from the list and is no longer accessible.
4. **Given** an unauthenticated user, **When** they attempt to create or modify an event via the API, **Then** the request is rejected with an appropriate error.

---

### User Story 3 - Admin Manages Users and Roles (Priority: P3)

A logged-in administrator with the "admin" role can view all registered users, create new user accounts, assign roles (admin, host, participant), and deactivate or remove user accounts.

**Why this priority**: User management allows the admin to delegate responsibilities and control access. It builds on top of the login system but is not needed for the admin themselves to function.

**Independent Test**: Can be tested by logging in as an admin, navigating to the user management section, creating a new user with a specific role, and verifying that user appears in the list with the correct role.

**Acceptance Scenarios**:

1. **Given** a logged-in admin, **When** they navigate to user management, **Then** they see a list of all users with their roles and creation dates.
2. **Given** a logged-in admin, **When** they create a new user with username, email, password, and role, **Then** the user is created and appears in the user list.
3. **Given** a logged-in admin, **When** they change a user's role from "host" to "admin", **Then** the role change is saved and the user's permissions are updated accordingly.
4. **Given** a logged-in admin, **When** they delete a user account, **Then** the user is removed and can no longer log in.
5. **Given** a user without admin role, **When** they attempt to access user management, **Then** they are denied access and shown an appropriate message.

---

### User Story 4 - Protected Routes and Role-Based Access (Priority: P4)

The system enforces authentication and authorization across all admin-facing routes. Public-facing participant routes (joining events, answering questions) remain accessible without login, while all event management and admin routes require an authenticated session with the appropriate role.

**Why this priority**: Securing the boundary between public and admin functionality is essential for production readiness but depends on the login and admin foundations.

**Independent Test**: Can be tested by attempting to access admin endpoints and pages without being logged in, verifying redirection to login, then logging in with different roles and verifying access is granted or denied appropriately.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they attempt to access any admin page or API endpoint, **Then** they are redirected to the login page (frontend) or receive an unauthorized response (API).
2. **Given** a user with the "host" role, **When** they attempt to access user management features, **Then** they are denied access.
3. **Given** a user with the "admin" role, **When** they access any admin or event management feature, **Then** they are granted full access.
4. **Given** any user (authenticated or not), **When** they access public participant routes (joining an event, viewing a leaderboard), **Then** access is allowed without login.

---

### User Story 5 - First-Run Admin Setup (Priority: P5)

When the system starts for the first time with an empty database (no users), a default admin account is automatically created so that the administrator can log in without manual database manipulation. Default roles (admin, host, participant) are also seeded.

**Why this priority**: Without automatic setup, the system is unusable after a fresh deployment. However, this only needs to run once.

**Independent Test**: Can be tested by starting the application with a fresh (empty) database and verifying that default roles exist and a default admin user is created with known credentials.

**Acceptance Scenarios**:

1. **Given** a fresh database with no users or roles, **When** the application starts, **Then** default roles (admin, host, participant) are created.
2. **Given** a fresh database with no users, **When** the application starts, **Then** a default admin user is created with a well-known initial password.
3. **Given** the default admin user exists, **When** the admin logs in for the first time, **Then** they are prompted or encouraged to change the default password.
4. **Given** the database already has users and roles, **When** the application starts, **Then** no duplicate roles or users are created.

---

### Edge Cases

- What happens when the admin's session expires mid-operation (e.g., while editing an event)? The system should detect the expired session and redirect to login, preserving the URL so the user can return after re-authenticating.
- How does the system handle concurrent login sessions from the same user? Allow multiple sessions (different devices/browsers) by default.
- What happens when the last admin user is deleted? The system must prevent deletion of the last remaining admin account to avoid lockout.
- How does the system handle login attempts with a correct username but wrong password? Show a generic "invalid credentials" message (no user enumeration) and apply rate limiting after repeated failures.
- What happens if the database has users but no roles? The role seeding should run independently and repair missing roles on startup.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a login endpoint that accepts a single identifier field (username or email) and password, validates credentials against both the username and email columns, and establishes an authenticated session.
- **FR-002**: System MUST provide a logout endpoint that terminates the current session and clears session credentials.
- **FR-003**: System MUST provide a "current user" endpoint that returns the authenticated user's profile (ID, username, email, role) or indicates no active session.
- **FR-004**: System MUST expose admin API endpoints for user management: list all users, get user by ID, create user, update user, delete user, and change user role — all requiring admin role authorization.
- **FR-005**: System MUST expose admin API endpoints for role management: list all roles, create role, update role, and delete role — all requiring admin role authorization.
- **FR-006**: System MUST enforce authentication on all event management endpoints (create, update, delete events), associating events with the authenticated user instead of a hardcoded user ID.
- **FR-007**: System MUST enforce role-based authorization: admin role for user/role management and full access to all events; host role for creating events and editing/deleting only events they created; participant role has no event management access; no authentication required for public participant routes.
- **FR-008**: System MUST provide a frontend login page with a single identifier field (accepting username or email), a password field, validation feedback, and error messaging.
- **FR-009**: System MUST provide a frontend authentication context that tracks login state and makes the current user available to all components.
- **FR-010**: System MUST redirect unauthenticated users to the login page when they attempt to access protected frontend routes, and return them to their intended destination after login.
- **FR-011**: System MUST seed default roles (admin, host, participant) on application startup if they do not already exist.
- **FR-012**: System MUST seed a default admin user on first startup when no users exist in the database, using the username "admin" and an initial password of "ChangeMe123!" (stored hashed).
- **FR-013**: System MUST prevent deletion of the last admin user account to avoid system lockout.
- **FR-014**: System MUST store passwords securely using one-way hashing; plaintext passwords must never be stored or logged.
- **FR-015**: System MUST display a generic error message for failed login attempts without revealing whether the username or password was incorrect.
- **FR-016**: System MUST connect the existing Admin.tsx frontend to working backend admin endpoints so the admin panel is fully functional.

### Key Entities

- **User**: Represents an authenticated person in the system. Key attributes: unique identifier, username, email, hashed password, full name, associated role, creation timestamp. A user belongs to exactly one role.
- **Role**: Represents a permission level within the system. Key attributes: unique identifier, name (admin, host, participant), description, creation timestamp. Predefined roles control access to different system features.
- **Session**: Represents an active authenticated session. Key attributes: session identifier, associated user, creation timestamp, expiration. Uses a sliding 2-hour inactivity timeout — each authenticated request resets the expiration window. Links a browser/client to an authenticated user.
- **Event**: Existing entity representing a trivia event. The ownership relationship must change from a hardcoded ID to the authenticated user who created the event.

## Assumptions

### Out of Scope (MVP)

- **Password reset / forgot password flow**: Not included in this feature. Admins who forget their password must have another admin reset it, or the database can be manually updated.
- **OAuth / SSO integration**: No external identity provider support. Authentication is username/email + password only.
- **Self-registration**: Users cannot create their own accounts. Only administrators can create new user accounts through the admin panel.

### Assumptions
- The existing User and Role entity models and EF Core database configuration are correct and sufficient; no schema changes are needed beyond what already exists.
- The existing EfCoreAdminService implementation is functionally correct and can be exposed directly through API endpoints.
- Session-based authentication with HTTP-only cookies is the appropriate approach, consistent with the existing cookie infrastructure in the codebase.
- The application runs behind HTTPS in production, ensuring session cookies are transmitted securely.
- Sessions use a sliding 2-hour inactivity timeout; each request resets the expiration clock.
- The default admin password must be changed on first login for security (enforced via documentation/UI prompt, not a hard block).
- Rate limiting for login attempts is handled at the infrastructure level or as a future enhancement, not a hard requirement for this initial implementation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can complete the full login flow (navigate to login page, enter credentials, reach the dashboard) in under 30 seconds.
- **SC-002**: All admin API endpoints (user CRUD, role CRUD) return correct results and are accessible only to authenticated users with the admin role; unauthorized requests receive a rejection response within 1 second.
- **SC-003**: Event creation, editing, and deletion correctly associate events with the logged-in user, and events can no longer be modified anonymously.
- **SC-004**: The admin panel page (user management, role management) loads successfully and displays accurate data from the backend without console errors.
- **SC-005**: On a fresh database with no users, the system automatically creates default roles and an admin account, allowing login within 60 seconds of first deployment.
- **SC-006**: 100% of protected routes (both API and frontend) correctly reject unauthenticated access and redirect to the login page or return an appropriate error.
- **SC-007**: Users with non-admin roles (host, participant) cannot access admin-only features (user management, role management), verifiable by role-based access tests.
- **SC-008**: An administrator can create a new user account and that user can subsequently log in with the assigned credentials on their first attempt.
