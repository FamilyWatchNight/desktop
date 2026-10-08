# User Security Implementation Plan

## Overview

This document outlines the implementation plan for completing the user security capabilities described in `USER_SECURITY.md`. The plan is broken into discrete stages that can be committed separately on the `chore/add-user-security` branch. Each stage includes proposed conventional commit messages.

The implementation builds on the existing database schema (users, user_profiles, roles, role_permissions, user_roles tables) and permissions definitions in `permissions.ts`.

## Implementation Stages

### Stage 1: User Authentication Service

- Implement UserService with methods for user creation, authentication, password hashing/verification using bcrypt
- Add User and UserProfile models to handle database operations
- Include methods for updating user profiles and managing profile images (stored in filesystem)
- Add Cucumber integration tests for UserService methods
- **Tests for this step:** Unit-test password hashing/verification, required unique usernames, passwordless users, profile updates, and secure profile-image storage; run the UserService Cucumber scenarios.
- **Commit:** `feat: add UserService with authentication methods`

### Stage 2: Role-Based Access Control (RBAC) Service

- Implement RoleService for managing roles and permissions
- Add methods to assign/remove roles from users and check aggregated user permissions
- Implement logic where can-admin grants all permissions
- Add Cucumber integration tests for RoleService and permission checking
- **Tests for this step:** Unit-test permission aggregation, `can-admin` wildcard behavior, role assignment/removal, and role constraints; run the RoleService Cucumber scenarios.
- **Commit:** `feat: add RoleService and permission checking`

### Stage 3: Secure Services and APIs

- Add permission checks to UserService and RoleService methods
- Implement authorization middleware in IPC and HTTP API layers (`src/main/api-server` and `src/renderer/api-client`)
- Add authentication endpoints for login/session management
- Add Cucumber integration tests verifying: when no users exist, can initialize roles/permissions and create first admin; with users present, services require authentication and proper permissions
- **Tests for this step:** Test unauthenticated bootstrap operations, 401/403 transport mappings, authenticated service access, denied permissions, and fresh permission resolution through both IPC and HTTP.
- **Commit:** `feat: secure services and APIs with authentication and authorization`

### Stage 4: Basic UI Testing Infrastructure

- Set up Cucumber UI testing with Playwright for both Electron and browser transports
- Use environment variable ( RENDER_LOCATION = electron | browser ) in hooks to configure whether to target the built-in
  electron BrowserWindow UI (that uses IPC for its communication) or whether to open up an external browser that connects
  to the express server via HTTP.
- Implement basic UI smoke test: open window, click menu, verify Settings page opens
- Add Cucumber integration tests for the basic UI infrastructure
- **Tests for this step:** Run the smoke feature in Electron and browser modes, confirming the window opens, menu interaction works, and Settings is reachable through the configured transport.
- **Commit:** `feat: add basic UI testing infrastructure with Playwright`

### Stage 5: First Admin User Creation UI

- Add conditional UI that appears when no users exist in the database
- Allow creation of the first admin user with username, password, display name, and profile picture
- Automatically assign admin role
- Introduce UnauthenticatedUser persona in Business flow layer for bootstrap actions
- Add Cucumber integration tests for the first admin creation workflow
- **Tests for this step:** Test empty-database visibility, valid and invalid submissions, optional fields, admin-role assignment, duplicate/second bootstrap rejection, and continued unauthenticated state in Electron and browser modes.
- **Commit:** `feat: add first admin user creation UI`

### Stage 6: Login UI Workflow

- Create login page component that lists existing users with can-host or can-admin permissions
- Display users as chips or cards, each with a user profile picture (in a circle) and display name (below the profile picture)
- Where display name is missing, default to the username
- Where profile picture is missing, default to the user's first initial in white in a solid colored circle, using the user record's numeric id to deterministically choose the color from among the `--core-*` color variables from `colors.scss`
- Include a hover effect to enlarge the user's login chip in place without moving the other users' chips.
- User clicks on their chip to begin login
- For users with passwords, respond to a click by hiding other users' chips, animating the selected user's chip to the center of the screen, enlarged, with a password prompt added to the chip below the login/display name.
- For users without passwords, respond to a click by logging in immmediately.
- Integrate with UserService for authentication
- Add AdminUser, HostUser, and RegularUser personas in Business flow layer for login and profile workflows
- Add Cucumber integration tests for login workflow
- Include a logout option in the menu.
- **Tests for this step:** Unit-test session creation, one-hour expiry, invalidation, logout, deleted-user handling, and permission refresh. Test the blocking login overlay, eligible-user filtering, display-name fallback, deterministic initial avatars, hover/selection behavior, password and passwordless login, failed-login retry, authenticated shell access, and logout in both Electron and browser modes.
- **Commit:** `feat: add login UI workflow`

### Stage 7: User Profile Management UI

- Create profile update page for logged-in users
- Allow updating display name, password, and profile picture
- Enforce can-update-profile permission check
- Add Cucumber integration tests for profile management
- **Tests for this step:** Test permission gating, display-name/password/profile-image updates, validation failures, persistence, and the profile workflow in both supported UI transports.
- **Commit:** `feat: add user profile management UI`

### Stage 8: User Management UI (Add/Edit/Delete)

- Build comprehensive UI for managing users (create, read, update, delete)
- Include fields for username, email, password, display name, profile picture, and role assignments
- Enforce can-manage-users permission
- Prevent granting/removing can-admin role unless user has can-admin
- Prevent removing can-admin from own account
- Allow creating users without roles
- Add Cucumber integration tests for user management workflows
- **Tests for this step:** Test authorized CRUD, users without roles, role assignment restrictions, self-admin protection, validation, persistence, and denied access for insufficient permissions.
- **Commit:** `feat: add user management UI`

### Stage 9: Role Management UI

- Create UI for managing roles (add, edit, delete roles and their permissions)
- Display role system-stubs (for system roles), display names, and associated permissions
- Allow duplicating roles, renaming system roles, and hiding roles
- Enforce can-admin permission
- Prevent deletion of system roles and roles that are assigned to users
- Prevent modification of permissions for system roles
- Add Cucumber integration tests for role management
- **Tests for this step:** Test authorized role CRUD, duplication, display-name/hide changes, system-role protections, assigned-role deletion prevention, and unauthorized access.
- **Commit:** `feat: add role management UI`

### Stage 10: Security Enforcement in Logic

- Add permission checks to all relevant services and API endpoints
- Ensure restrictions are enforced in application logic, not just UI
- Update existing services to integrate with UserService and RoleService
- Add Cucumber integration tests for permission enforcement
- **Tests for this step:** Exercise every secured service/API operation with missing, valid, insufficient, stale, and `can-admin` contexts, asserting consistent domain and transport errors.
- **Commit:** `feat: enforce permissions in application logic`

### Stage 11: Cucumber Feature Tests

- Write Cucumber feature files for all user security workflows (login, user creation, profile updates, etc.)
- Implement step definitions using TDD approach
- Validate behaviors including permission enforcement
- **Tests for this step:** Execute the complete feature matrix for bootstrap, login, logout, profile, user, role, and permission workflows, including successful and denied paths.
- **Commit:** `test: add cucumber features for user security workflows`

### Stage 12: Integration and Testing

- Run full test suite (unit tests, feature tests)
- Fix any integration issues or failing tests
- Ensure all workflows function end-to-end
- **Tests for this step:** Run the full unit suite, all Cucumber features in Electron and browser modes, main/renderer builds, lint, and manual security checks for session expiry, credential leakage, authorization, and transport parity.
- **Commit:** `chore: integrate and test user security features`

## Notes

- Each stage should be implemented and committed separately to maintain clean git history
- After each stage, run tests to ensure no regressions
- Periodic breaks for human validation as mentioned in requirements
- Profile images should be stored securely in the app's data directory using safe path handling
