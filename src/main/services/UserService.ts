/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import fs from 'fs';
import path from 'path';

import bcrypt from 'bcryptjs';
import log from 'electron-log/main';

import { AuthContext } from '../auth/auth-context';
import { AuthenticationError, AuthorizationError } from '../auth/errors';
import { type PermissionStub, PERMISSIONS } from '../auth/permissions';
import { getDb, getModels } from '../database';
import { type UserProfile, type UserProfileData } from '../db/models/UserProfiles';
import { type User, type UserData } from '../db/models/Users';
import i18n from '../i18n';
import { getAppDataRoot } from '../paths';
import {
  assertNoSymlinkEscape,
  assertPathInsideAllowedDirs,
  safeJoin,
  ValidationError,
} from '../security';

export type CreateUserData = UserData;

/**
 * Missing account/profile metadata means the authenticated caller lacks permission to see it;
 * null means the field is visible but has no value. `getUserById` returns private fields to the
 * target user or a caller with `can-manage-users`, and otherwise returns the public fields.
 * `getCurrentUserDetails` additionally requires `can-update-profile` for self-access.
 * `hasPassword` is included in both views, matching the public login roster.
 */
export interface UserDetails {
  account: {
    id?: number;
    username: string;
    email?: string | null;
    hasPassword: boolean;
    lastLoginAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  profile: {
    id?: number;
    userId?: number;
    displayName: string | null;
    profileImagePath: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
}

export interface AuthenticatedUser extends UserDetails {
  account: User & { hasPassword: boolean };
  profile: UserProfile | null;
}

export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export interface BasicUserInfo {
  username: string;
  profile: { displayName: string | null; profileImagePath: string | null } | null;
}

export interface LoginRosterUser {
  id: number;
  username: string;
  hasPassword: boolean;
  profile: { displayName: string | null } | null;
}

export interface PermissionInfo {
  stub: PermissionStub;
  displayName: string;
}

export interface FirstAdminUserData {
  username: string;
  email?: string | null;
  password?: string;
  displayName?: string | null;
}

export class UserService {
  private t = i18n.getFixedT(null, 'auth');

  private validateAuthContext(authContext?: AuthContext, targetUserId?: number): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }

    // Allow self-access or user manager access
    const canAccess =
      (targetUserId && authContext.userId === targetUserId) ||
      authContext.hasPermission('can-manage-users');

    if (!canAccess) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  private validateProfileUpdateAccess(authContext: AuthContext | undefined, targetUserId: number): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }

    const hasRequiredPermission =
      authContext.userId === targetUserId
        ? authContext.hasPermission('can-update-profile')
        : authContext.hasPermission('can-manage-users');

    if (!hasRequiredPermission) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  private validatePasswordManagementAccess(
    authContext: AuthContext | undefined,
    targetUserId: number,
  ): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }

    if (
      authContext.userId !== targetUserId &&
      !authContext.hasPermission('can-manage-users')
    ) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  private getPrivateUserDetails(userId: number): AuthenticatedUser | null {
    const { users, userProfiles } = getModels();
    const user = users.getById(userId);
    if (!user) return null;

    const userRow = users.getByUsername(user.username);
    return {
      account: {
        ...user,
        hasPassword: Boolean(userRow?.password_hash),
      },
      profile: userProfiles.getByUserId(userId),
    };
  }

  hasUsers(): boolean {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    return result.count > 0;
  }

  async createUser(data: CreateUserData, authContext?: AuthContext): Promise<AuthenticatedUser> {
    // Bootstrap mode: allow creating first user without authentication
    if (!this.hasUsers()) {
      // This is bootstrap - allow creating admin user
    } else {
      // Normal mode: require authentication and permissions
      if (!authContext) {
        throw new AuthenticationError(this.t('errors.cannotBootstrapAdmin'));
      }
      if (!authContext.hasPermission('can-manage-users')) {
        throw new AuthorizationError(this.t('errors.insufficientPermissions'));
      }
    }

    try {
      const { users } = getModels();
      const userId = await users.create(data);
      const user = this.getPrivateUserDetails(userId);
      if (!user) throw new Error('Failed to retrieve created user');
      return user;
    } catch (error) {
      log.error('[UserService.createUser] Error creating user:', error, 'data:', data);
      if (error instanceof Error) {
        log.error('[UserService.createUser] Stack:', error.stack);
      }
      throw error;
    }
  }

  async createFirstAdmin(data: FirstAdminUserData): Promise<User> {
    if (this.hasUsers()) {
      throw new AuthenticationError(this.t('errors.cannotBootstrapAdmin'));
    }

    const username = typeof data?.username === 'string' ? data.username.trim() : '';

    if (!username) {
      throw new Error(this.t('errors.usernameRequired'));
    }

    const { users, userProfiles, roles, userRoles } = getModels();
    const adminRole = roles.getBySystemStub('admin');
    if (!adminRole) {
      throw new Error(this.t('errors.adminRoleNotFound'));
    }
    const userId = await users.create({
      username,
      email: data.email,
      password: data.password,
    });

    try {
      const db = getDb();
      if (!db) throw new Error(this.t('errors.databaseNotInitialized'));
      db.transaction(() => {
        userProfiles.create(userId, {
          displayName: data.displayName,
        });
        userRoles.assignRoleToUser(userId, adminRole.id);
      })();

      const user = users.getById(userId);
      if (!user) throw new Error(this.t('errors.createdUserUnavailable'));
      return user;
    } catch (error) {
      users.delete(userId);
      throw error;
    }
  }

  async authenticateUser(
    username: string,
    password: string,
    authContext?: AuthContext,
  ): Promise<AuthenticatedUser | null> {
    const { users } = getModels();
    const userRow = users.getByUsername(username);
    if (!userRow) return null;

    if (authContext && authContext.userId !== userRow.id) {
      // If already authenticated, do not allow re-authentication as someone else (to prevent abuse of this method)
      throw new AuthorizationError(this.t('errors.mustBeLoggedOut'));
    }

    let isValid = false;

    if (userRow.password_hash) {
      // This user has a password. Validate it.
      isValid = await bcrypt.compare(password, userRow.password_hash);
    } else {
      // If no password set, only an empty or missing password is accepted
      if (password === '' || password === null || password === undefined) {
        isValid = true;
      }
    }

    if (!isValid) return null;

    users.updateLastLogin(userRow.id);
    return this.getPrivateUserDetails(userRow.id);
  }

  getUserById(id: number, authContext?: AuthContext): UserDetails | null {
    let canSeeUserDetails = false;

    if (authContext) {
      canSeeUserDetails =
        authContext.userId === id || authContext.hasPermission('can-manage-users');
    }

    const user = this.getPrivateUserDetails(id);
    if (!user) return null;

    if (canSeeUserDetails) return user;

    return {
      account: {
        username: user.account.username,
        hasPassword: user.account.hasPassword,
      },
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            profileImagePath: user.profile.profileImagePath,
          }
        : null,
    };
  }

  async updateUserProfile(
    userId: number,
    data: UserProfileData,
    authContext?: AuthContext,
  ): Promise<void> {
    this.validateProfileUpdateAccess(authContext, userId);

    const { userProfiles } = getModels();
    const existingProfile = userProfiles.getByUserId(userId);
    if (existingProfile) {
      userProfiles.update(userId, data);
    } else {
      userProfiles.create(userId, data);
    }
  }

  getCurrentUserDetails(authContext?: AuthContext): UserDetails | null {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    this.validateProfileUpdateAccess(authContext, authContext.userId);

    return this.getUserById(authContext.userId, authContext);
  }

  async updateCurrentUserProfile(
    data: Pick<UserProfileData, 'displayName'>,
    authContext?: AuthContext,
  ): Promise<void> {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    await this.updateUserProfile(authContext.userId, data, authContext);
  }

  async changePassword(
    userId: number,
    newPassword: string,
    authContext?: AuthContext,
  ): Promise<void> {
    this.validatePasswordManagementAccess(authContext, userId);

    if (!newPassword) {
      throw new ValidationError(this.t('errors.passwordRequired'));
    }

    const { users } = getModels();
    await users.updatePassword(userId, newPassword);
  }

  async removePassword(userId: number, authContext?: AuthContext): Promise<void> {
    this.validatePasswordManagementAccess(authContext, userId);

    const { users } = getModels();
    users.removePassword(userId);
  }

  async changeCurrentUserPassword(newPassword: string, authContext?: AuthContext): Promise<void> {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    await this.changePassword(authContext.userId, newPassword, authContext);
  }

  async removeCurrentUserPassword(authContext?: AuthContext): Promise<void> {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    await this.removePassword(authContext.userId, authContext);
  }

  getUsersWithPermissions(
    permissions: PermissionStub[],
    authContext?: AuthContext,
  ): BasicUserInfo[] {
    if (authContext) {
      // We really don't expect this ever to be called when someone is logged in.
      // The purpose is to get a list of users who *can* log in.
      // If we ever use it for something different, then we need to rethink it.
      // So for now, fail if that ever happens.
      throw new AuthorizationError(this.t('errors.mustBeLoggedOut'));
    }

    return this.getUsersWithPermissionStubs(permissions);
  }

  getLoginRoster(): LoginRosterUser[] {
    const userIds = new Set([
      ...this.getUserIdsWithPermissionStubs(['can-host']),
      ...this.getUsersWithAdminPermission(),
    ]);

    return Array.from(userIds)
      .map((userId) => this.toLoginRosterUser(userId))
      .filter((user): user is LoginRosterUser => user !== null);
  }

  private getUsersWithPermissionStubs(permissions: PermissionStub[]): BasicUserInfo[] {
    const userIds = new Set([
      ...this.getUserIdsWithPermissionStubs(permissions),
      ...this.getUsersWithAdminPermission(),
    ]);

    return Array.from(userIds)
      .map((userId) => this.toBasicUserInfo(userId))
      .filter((user): user is BasicUserInfo => user !== null);
  }

  private getUserIdsWithPermissionStubs(permissions: PermissionStub[]): number[] {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    // Build query to get user IDs with specified permissions
    const placeholders = permissions.map(() => '?').join(',');
    const query = `
      SELECT DISTINCT u.id
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE rp.permission_stub IN (${placeholders})
    `;

    return (db.prepare(query).all(...permissions) as Array<{ id: number }>).map((row) => row.id);
  }

  private toBasicUserInfo(userId: number): BasicUserInfo | null {
    const { users, userProfiles } = getModels();
    const user = users.getById(userId);
    if (!user) return null;
    const profile = userProfiles.getByUserId(userId);
    return {
      username: user.username,
      profile: {
        displayName: profile?.displayName || null,
        profileImagePath: profile?.profileImagePath || null,
      },
    };
  }

  private toLoginRosterUser(userId: number): LoginRosterUser | null {
    const { users, userProfiles } = getModels();
    const user = users.getById(userId);
    if (!user) return null;
    const profile = userProfiles.getByUserId(userId);
    const userRow = users.getByUsername(user.username);
    return {
      id: user.id,
      username: user.username,
      hasPassword: Boolean(userRow?.password_hash),
      profile: profile ? { displayName: profile.displayName } : null,
    };
  }

  private getUsersWithAdminPermission(): number[] {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const query = `
      SELECT DISTINCT u.id
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE rp.permission_stub = 'can-admin'
    `;

    const userIds = (db.prepare(query).all() as Array<{ id: number }>).map((row) => row.id);

    return userIds;
  }

  private getProfileImagesDir(): string {
    return safeJoin(getAppDataRoot(), 'profile-images');
  }

  async getCurrentUserProfileImage(
    authContext?: AuthContext,
  ): Promise<{ data: string; mimeType: 'image/jpeg' | 'image/png' } | null> {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    this.validateProfileUpdateAccess(authContext, authContext.userId);

    const user = this.getPrivateUserDetails(authContext.userId);
    const filename = user?.profile?.profileImagePath;
    if (!filename) return null;

    const imagesDir = this.getProfileImagesDir();
    assertNoSymlinkEscape(imagesDir, getAppDataRoot());
    const filePath = safeJoin(imagesDir, filename);
    assertPathInsideAllowedDirs(filePath, imagesDir);

    const extension = path.extname(filename).toLowerCase();
    const mimeType =
      extension === '.jpg' || extension === '.jpeg'
        ? 'image/jpeg'
        : extension === '.png'
          ? 'image/png'
          : null;
    if (!mimeType) {
      throw new ValidationError('Invalid profile image type');
    }

    const fileStats = await fs.promises.stat(filePath);
    if (fileStats.size > PROFILE_IMAGE_MAX_BYTES) {
      throw new ValidationError('Profile image exceeds the maximum size');
    }

    const image = await fs.promises.readFile(filePath);
    return { data: image.toString('base64'), mimeType };
  }

  async saveProfileImage(
    userId: number,
    imageBuffer: Buffer,
    mimeType: string,
    authContext?: AuthContext,
  ): Promise<string> {
    this.validateProfileUpdateAccess(authContext, userId);

    // Validate mime type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(mimeType)) {
      throw new ValidationError('Invalid image type. Only PNG and JPEG are allowed.');
    }

    if (imageBuffer.length > PROFILE_IMAGE_MAX_BYTES) {
      throw new ValidationError('Image too large. Maximum size is 5MB.');
    }

    // Ensure directory exists
    const imagesDir = this.getProfileImagesDir();
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Generate filename
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const { v4: uuidv4 } = await import('uuid');
    const filename = `${uuidv4()}.${ext}`;
    const filePath = safeJoin(imagesDir, filename);

    // Security check
    assertPathInsideAllowedDirs(filePath, imagesDir);

    // Write file
    fs.writeFileSync(filePath, imageBuffer);

    // Update profile
    await this.updateUserProfile(userId, { profileImagePath: filename }, authContext);

    return filename;
  }

  async saveCurrentUserProfileImage(
    imageBuffer: Buffer,
    mimeType: string,
    authContext?: AuthContext,
  ): Promise<string> {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    return this.saveProfileImage(authContext.userId, imageBuffer, mimeType, authContext);
  }

  async deleteProfileImage(userId: number, authContext?: AuthContext): Promise<void> {
    this.validateProfileUpdateAccess(authContext, userId);

    const user = this.getUserById(userId);
    if (!user || !user.profile?.profileImagePath) return;

    const imagesDir = this.getProfileImagesDir();
    const filePath = safeJoin(imagesDir, user.profile.profileImagePath);

    // Security check
    assertPathInsideAllowedDirs(filePath, imagesDir);

    // Delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update profile
    await this.updateUserProfile(userId, { profileImagePath: null }, authContext);
  }

  async deleteCurrentUserProfileImage(authContext?: AuthContext): Promise<void> {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    await this.deleteProfileImage(authContext.userId, authContext);
  }

  // Permission checking - aggregates permissions from all user roles
  private getUserPermissionStubs(userId: number): PermissionStub[] {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const query = `
      SELECT DISTINCT rp.permission_stub
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = ?
    `;

    const rows = db.prepare(query).all(userId) as Array<{ permission_stub: PermissionStub }>;
    return rows.map((row) => row.permission_stub);
  }

  getUserPermissions(userId: number, authContext?: AuthContext): PermissionInfo[] {
    this.validateAuthContext(authContext, userId);
    const permissionStubs = this.getUserPermissionStubs(userId);

    // If can-admin, return all possible permissions
    if (permissionStubs.includes('can-admin')) {
      return PERMISSIONS.map((p) => ({
        stub: p.stub,
        displayName: this.t(p.displayNameKey),
      }));
    }

    // Otherwise return only the user's permissions
    return permissionStubs.map((stub) => {
      const permissionDef = PERMISSIONS.find((p) => p.stub === stub);
      return {
        stub,
        displayName: this.t(permissionDef?.displayNameKey || 'common.unknown'),
      };
    });
  }

  // User role management
  getRolesForUser(userId: number, authContext?: AuthContext): number[] {
    this.validateAuthContext(authContext, userId);
    const { userRoles } = getModels();
    return userRoles.getRoleIdsForUser(userId);
  }

  assignRoleToUser(userId: number, roleId: number, authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }

    if (!authContext.hasPermission('can-manage-users')) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }

    // Users cannot modify roles for their own user account
    if (authContext.userId === userId) {
      throw new AuthorizationError(this.t('errors.cannotModifyOwnRoles'));
    }

    // Verify role exists
    const { roles, userRoles } = getModels();
    const role = roles.getById(roleId);
    if (!role) {
      throw new Error(this.t('errors.roleNotFound', 'Role not found'));
    }

    userRoles.assignRoleToUser(userId, roleId);
  }

  removeRoleFromUser(userId: number, roleId: number, authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }

    if (!authContext.hasPermission('can-manage-users')) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }

    // Users cannot modify roles for their own user account
    if (authContext.userId === userId) {
      throw new AuthorizationError(this.t('errors.cannotModifyOwnRoles'));
    }

    const { userRoles } = getModels();
    userRoles.removeRoleFromUser(userId, roleId);
  }
}
