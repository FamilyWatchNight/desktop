# Stage 2 Implementation Plan: Role-Based Access Control (RBAC) Service

## Overview
This document provides a detailed implementation plan for Stage 2 of the user security system. Stage 2 focuses on implementing the Role-Based Access Control (RBAC) service that manages roles, permissions, and user-role assignments. The implementation builds on the existing database schema and permissions definitions.

## Current State Analysis
Based on code exploration, the following components already exist:
- **Database Schema**: Tables `roles`, `role_permissions`, and `user_roles` are created via migrations
- **Permissions**: Defined in `src/main/auth/permissions.ts` with `PERMISSIONS` array and `DEFAULT_ROLES`
- **UserService**: Has `getUsersWithPermissions()` method that queries role tables for permission checking
- **Database Seeding**: Default roles are seeded on startup if no roles exist
- **i18n Support**: Application uses i18next for localization, requiring translatable display names

## i18n Integration Requirements

### Permissions Display Names
- Change `PERMISSIONS` array to use `displayNameKey` instead of `displayName`
- Use i18next keys (e.g., `'permissions.canHost'`) for translatable permission names
- Add corresponding translation keys to locale files (e.g., `en/common.json`)
- Translate when displaying permissions using `i18next.t(permission.displayNameKey)`

### Roles Display Names
- Change `DEFAULT_ROLES` to use `displayNameKey` instead of `displayName`
- Use i18next keys (e.g., `'roles.administrator'`) for default role names
- During database seeding, translate keys using `i18next.t(displayNameKey)` with current app language
- Store translated strings in database (become user-editable after seeding)

### i18n Key Management
- Add new i18next keys to both `en/common.json` and `dev/common.json`
- `en/common.json`: Use proper English translations
- `dev/common.json`: Use same English text wrapped with `___` at start and end (e.g., `"___Can Host Watch Night___"`)
- Follow existing nested key structure (e.g., `"permissions": { "canHost": "Can Host Watch Night" }`)

## Implementation Components

### Database Schema Updates
**Required Changes**:
- Update `004_create_roles_table.sql` migration to include `system_stub` (nullable VARCHAR) and `is_hidden` (BOOLEAN DEFAULT FALSE) columns
- Ensure system roles get `system_stub` set during seeding

### 1. Database Models
Create new model classes to handle database operations for roles and permissions.

#### Roles.ts Model
**Location**: `src/main/db/models/Roles.ts`

**Responsibilities**:
- CRUD operations for roles (create, read, update, delete)
- Query roles by stub or ID
- Handle role data transformation between database rows and application objects

**Key Methods**:
- `create(data: RoleData): Promise<number>`
- `getById(id: number): Role | null`
- `getBySystemStub(systemStub: string): Role | null`
- `getAll(): Role[]`
- `update(id: number, data: Partial<RoleData>): void`
- `delete(id: number): void`

**Data Types**:
```typescript
interface PermissionDefinition {
  stub: PermissionStub;
  displayNameKey: string; // i18next key for translatable display name
}

interface RoleRow {
  id: number;
  system_stub: string | null; // null for user-created roles, set for system roles
  display_name: string;
  is_hidden: boolean; // whether role is available for user assignment
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  systemStub: string | null;
  displayName: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoleData {
  systemStub?: string | null;
  displayName: string;
  isHidden?: boolean;
}
```

#### RolePermissions.ts Model
**Location**: `src/main/db/models/RolePermissions.ts`

**Responsibilities**:
- Manage permission assignments to roles
- Query permissions for a role
- Add/remove permissions from roles

**Key Methods**:
- `addPermission(roleId: number, permissionStub: PermissionStub): void`
- `removePermission(roleId: number, permissionStub: PermissionStub): void`
- `getPermissionsForRole(roleId: number): PermissionStub[]`
- `getRolesForPermission(permissionStub: PermissionStub): number[]`
- `setPermissionsForRole(roleId: number, permissionStubs: PermissionStub[]): void`

### 2. RoleService
**Location**: `src/main/services/RoleService.ts`

**Responsibilities**:
- Business logic for role and permission management
- User-role assignment and removal
- Permission checking with can-admin logic
- Role CRUD operations
- Integration with i18next for role display name translation during seeding

**Key Methods**:

#### Role Management
- `createRole(data: RoleData): Promise<number>`
- `getRoleById(id: number): Role | null`
- `getSystemRole(systemStub: string): Role | null`
- `getAllRoles(): Role[]`
- `updateRole(id: number, data: Partial<RoleData>): void`
- `deleteRole(id: number): void` (prevents deletion of system roles and assigned roles)
- `duplicateRole(id: number): Promise<number>` (creates user role copy with auto-generated display name)
- `hideRole(id: number): void` (prevents assignment of system roles)
- `showRole(id: number): void` (allows assignment of previously hidden roles)

#### Permission Management
- `addPermissionToRole(roleId: number, permissionStub: PermissionStub): void` (prevents modification of system roles)
- `removePermissionFromRole(roleId: number, permissionStub: PermissionStub): void` (prevents modification of system roles)
- `getPermissionsForRole(roleId: number): PermissionStub[]`
- `setPermissionsForRole(roleId: number, permissionStubs: PermissionStub[]): void` (prevents modification of system roles)

#### User-Role Management
- `assignRoleToUser(userId: number, roleId: number): void`
- `removeRoleFromUser(userId: number, roleId: number): void`
- `getUserRoles(userId: number): Role[]`
- `getUsersWithRole(roleId: number): number[]`

#### Permission Checking
- `getUserPermissions(userId: number): PermissionStub[]`
- `userHasPermission(userId: number, permissionStub: PermissionStub): boolean`
- `userHasAnyPermission(userId: number, permissionStubs: PermissionStub[]): boolean`

**Can-Admin Logic**:
The `userHasPermission` and `getUserPermissions` methods must implement the requirement that if a user has the `can-admin` permission, they are considered to have all permissions. This is implemented by:
1. Getting the user's aggregated permissions from their roles
2. If `can-admin` is present, return all possible permissions
3. Otherwise return only the explicitly assigned permissions

### 3. Database Integration
**Location**: `src/main/database.ts`

**Changes Required**:
- Import new model classes
- Add `roles` and `rolePermissions` to the `DbModels` interface
- Initialize new models in `initModels()` function
- Update `getModels()` return type
- Modify `runSeed()` to translate role display names using i18next before database insertion (seeding logic remains in database.ts, RoleService handles runtime operations)

### 4. Service Registration
**Location**: `src/main/services/index.ts`

**Changes Required**:
- Import `RoleService`
- Export `RoleService` in the module exports

### 5. Test Infrastructure Updates

#### Unit Tests
**Location**: `tests/unit/role-service.test.ts`

**Test Coverage**:
- Role CRUD operations
- Permission management (including system role protection)
- User-role assignments
- Permission checking logic (including can-admin)
- System role identification and protection
- Role duplication and hiding functionality
- Edge cases (non-existent roles/users, duplicate assignments, system role constraints)

#### Cucumber Integration Tests
**Location**: `tests/component/workflows/roles.feature` and `tests/component/workflows/roles.steps.ts`

**Feature Scenarios**:
- Creating and managing roles (system vs user roles)
- Assigning permissions to roles (with system role protection)
- Assigning roles to users (respecting hidden roles)
- Permission checking (normal permissions and can-admin)
- Role duplication and hiding functionality
- System role protection (no deletion, no permission modification)

#### Test Hooks Updates
**Location**: `src/main/testing/TestHooksImpl.ts` and `tests/support/domains/roles.ts`

**New Test Hooks**:
- `roles.createTestRole(data: RoleData): Promise<number>`
- `roles.getTestRoleById(id: number): Role | null`
- `roles.getTestRoleBySystemStub(systemStub: string): Role | null`
- `roles.duplicateTestRole(id: number): Promise<number>`
- `roles.hideTestRole(id: number): void`
- `roles.assignTestRoleToUser(userId: number, roleId: number): void`
- `roles.getTestUserPermissions(userId: number): PermissionStub[]`
- `roles.testUserHasPermission(userId: number, permissionStub: PermissionStub): boolean`

### 6. Integration with Existing UserService
**Location**: `src/main/services/UserService.ts`

**Changes Required**:
- The existing `getUsersWithPermissions()` method can be refactored to use the new `RoleService`
- Consider deprecating the method in favor of `RoleService` methods
- Ensure compatibility during transition

## Implementation Order

1. **Update Database Schema** (add system_stub and is_hidden columns)
2. **Create Database Models** (Roles.ts, RolePermissions.ts with updated schema)
3. **Update Database Integration** (database.ts with seeding changes)
4. **Implement RoleService** with all business logic (including system role protection)
5. **Update Service Registration** (services/index.ts)
6. **Create Unit Tests** for RoleService
7. **Update Test Infrastructure** (TestHooksImpl.ts, roles.ts domain)
8. **Create Cucumber Integration Tests**
9. **Refactor UserService** to use RoleService where appropriate

## Testing Strategy

### Unit Tests
- Test each RoleService method in isolation
- Mock database dependencies
- Test can-admin permission logic thoroughly
- Test error conditions (non-existent roles/users)

### Integration Tests
- Test full workflows: create role → assign permissions → assign to user → check permissions
- Test can-admin grants all permissions
- Test role deletion prevention
- Test permission aggregation from multiple roles

### Validation
- Run existing tests to ensure no regressions
- Test permission checking in UserService still works
- Verify database seeding still works correctly

## Security Considerations
- All database operations use parameterized queries (already handled by better-sqlite3)
- Role deletion validation prevents orphaned user-role assignments
- Permission checking is centralized in RoleService for consistency
- Can-admin logic is implemented at the service level, not in UI

## Dependencies
- Database schema migration to add `system_stub` and `is_hidden` columns
- No new external dependencies required
- Uses existing better-sqlite3 for database operations
- Integrates with existing permission definitions and i18next for localization

## Commit Strategy
Single commit: `feat: add RoleService and permission checking`

This implementation provides a complete RBAC system that integrates seamlessly with the existing UserService and permission definitions, enabling the security features required for the user management UI in later stages.</content>
<parameter name="filePath">c:\Users\steve\OneDrive\Documents\develop\FamilyWatchNight\desktop\STAGE_2.md