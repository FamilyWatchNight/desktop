# Stage 1: User Authentication Service - Implementation Details

## Overview
Implement the core UserService for user management, authentication, and profile handling. This provides the foundation for user operations before adding role-based permissions.

## Files to Create/Modify

### New Files
- `src/main/paths.ts` - Central path utilities
- `src/main/services/UserService.ts` - Main user service
- `src/main/db/models/User.ts` - User database model
- `src/main/db/models/UserProfile.ts` - UserProfile database model
- `tests/component/user-service.feature` - Cucumber feature tests
- `tests/component/user-service.steps.ts` - Cucumber step definitions

### Modified Files
- `src/main/database.ts` - Refactor to use paths.ts
- `src/main/testing-active/TestHooksImpl.ts` - Add user test hooks

## Path Management Refactoring
- Create `src/main/paths.ts` with `getAppDataRoot()` returning the base app data directory
- Refactor `database.ts`: Rename `getAppDataDir` to `getSqliteDir() = path.join(getAppDataRoot(), 'sqlite')`
- UserService uses `getProfileImagesDir() = path.join(getAppDataRoot(), 'profile-images')`

## UserService Implementation
- `createUser(userData: CreateUserData)` - Create user with bcrypt-hashed password (salt rounds: 12)
- `authenticateUser(username: string, password: string)` - Verify credentials by comparing hashes
- `getUserById(id: number)` - Retrieve user with profile data
- `updateUserProfile(userId: number, profileData)` - Update display name and profile picture
- `changePassword(userId: number, newPassword: string)` - Update password hash
- `getUsersWithPermissions(permissions: PermissionStub[])` - Get users having specified permissions (for login UI)

## Password Security
- Use bcrypt with 12 salt rounds for hashing
- Store hash and salt separately in database
- Verification: hash input with stored salt and compare

## Database Models
- **User Model**: CRUD operations for users table, handles password hashing/verification
- **UserProfile Model**: CRUD for user_profiles table, manages profile image paths

## Profile Image Handling
- Store in `profile-images/` subdirectory of app data root
- Use `safeJoin()` and `assertPathInsideAllowedDirs()` for security
- Generate unique filenames (UUID + extension)
- Validate file types (png, jpg, jpeg) and size limits (e.g., 5MB)
- Methods: `saveProfileImage(userId, imageBuffer, mimeType)`, `deleteProfileImage(userId)`

## Test Isolation
- Monkey-patch `paths.getAppDataRoot()` in test setup to return a temp directory
- This automatically isolates all app data storage (profile images, future subdirs) since all paths derive from the root
- Create temp dir once per test scenario
- Clean up entire temp directory tree in After hooks to prevent test pollution
- Follows pattern of in-memory DB and mock store for complete isolation

## Test Hooks Extension
Add to TestHooks interface:
```
users: {
  createTestUser: (data) => Promise<User>
  authenticateTestUser: (username, password) => Promise<User | null>
  getTestUserById: (id) => Promise<User>
  updateTestUserProfile: (id, profileData) => Promise<void>
}
```

## Cucumber Tests
Feature file with scenarios covering:
- User creation with/without password
- Authentication success/failure cases
- Profile updates (name, image)
- Password changes
- Image upload/deletion with validation
- Users with specific permissions

## Dependencies
- Add `bcrypt` for password hashing
- Ensure `uuid` for filename generation
- Use existing `safeJoin` and security functions</content>
<parameter name="filePath">c:\Users\steve\OneDrive\Documents\develop\FamilyWatchNight\desktop\STAGE_1.md