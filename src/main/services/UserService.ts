/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import i18n from '../i18n';
import { getDb, getModels } from '../database';
import { getAppDataRoot } from '../paths';
import { safeJoin, assertPathInsideAllowedDirs } from '../security';
import { type User, type UserData } from '../db/models/Users';
import { type UserProfile, type UserProfileData } from '../db/models/UserProfiles';
import { type Role } from '../db/models/Roles';
import { type PermissionStub, PERMISSIONS } from '../auth/permissions';

export interface CreateUserData extends UserData {}

export interface AuthenticatedUser extends User {
  profile: UserProfile | null;
}

export interface PermissionInfo {
  stub: PermissionStub;
  displayName: string;
}

export class UserService {
  private t = i18n.getFixedT(null, 'auth');
  
  async createUser(data: CreateUserData): Promise<AuthenticatedUser> {
    try {
      const { users, userProfiles } = getModels();
      const userId = await users.create(data);
      const user = users.getById(userId);
      if (!user) throw new Error('Failed to retrieve created user');
      const profile = userProfiles.getByUserId(userId);
      return { ...user, profile };
    } catch (error) {
      console.error('[UserService.createUser] Error creating user:', error, 'data:', data);
      if (error instanceof Error) {
        console.error('[UserService.createUser] Stack:', error.stack);
      }
      throw error;
    }
  }

  async authenticateUser(username: string, password: string): Promise<AuthenticatedUser | null> {
    const { users, userProfiles } = getModels();
    const userRow = users.getByUsername(username);
    if (!userRow) return null;

    let isValid = false;

    if (userRow.password_hash) {
      // This user has a password. Validate it.
      isValid = await bcrypt.compare(password, userRow.password_hash)
    }
    else {
      // If no password set, only an empty or missing password is accepted
      if (password === '' || password === null || password === undefined) {
        isValid = true;
      }
    }

    if (!isValid) return null;

    const profile = userProfiles.getByUserId(userRow.id);

    users.updateLastLogin(userRow.id);
    const user = users.getById(userRow.id);
    return user ? { ...user, profile } : null;
  }

  getUserById(id: number): AuthenticatedUser | null {
    const { users, userProfiles } = getModels();
    const user = users.getById(id);
    if (!user) return null;

    const profile = userProfiles.getByUserId(user.id);
    return { ...user, profile };
  }

  async updateUserProfile(userId: number, data: UserProfileData): Promise<void> {
    const { userProfiles } = getModels();
    const existingProfile = userProfiles.getByUserId(userId);
    if (existingProfile) {
      userProfiles.update(userId, data);
    } else {
      userProfiles.create(userId, data);
    }
  }

  async changePassword(userId: number, newPassword: string): Promise<void> {
    const { users } = getModels();
    await users.updatePassword(userId, newPassword);
  }

  getUsersWithPermissions(permissions: PermissionStub[]): AuthenticatedUser[] {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const { users, userProfiles } = getModels();

    // Build query to get user IDs with specified permissions
    const placeholders = permissions.map(() => '?').join(',');
    const query = `
      SELECT DISTINCT u.id
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE rp.permission_stub IN (${placeholders})
    `;

    const userIds = (db.prepare(query).all(...permissions) as Array<{ id: number }>).map(row => row.id);

    // Check for can-admin (grants all permissions)
    const adminUsers = this.getUsersWithAdminPermission();

    // Combine and deduplicate
    const userMap = new Map<number, AuthenticatedUser>();

    for (const userId of userIds) {
      const user = users.getById(userId);
      if (!user) continue;
      const profile = userProfiles.getByUserId(userId);
      userMap.set(user.id, { ...user, profile });
    }

    for (const adminUser of adminUsers) {
      userMap.set(adminUser.id, adminUser);
    }

    return Array.from(userMap.values());
  }

  private getUsersWithAdminPermission(): AuthenticatedUser[] {
    const db = getDb();
    if (!db) throw new Error('Database not initialized');

    const { users, userProfiles } = getModels();

    const query = `
      SELECT DISTINCT u.id
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      WHERE rp.permission_stub = 'can-admin'
    `;

    const userIds = (db.prepare(query).all() as Array<{ id: number }>).map(row => row.id);

    return userIds
      .map(userId => {
        const user = users.getById(userId);
        if (!user) return null;
        const profile = userProfiles.getByUserId(userId);
        return { ...user, profile };
      })
      .filter((u): u is AuthenticatedUser => u !== null);
  }

  private getProfileImagesDir(): string {
    return path.join(getAppDataRoot(), 'profile-images');
  }

  async saveProfileImage(userId: number, imageBuffer: Buffer, mimeType: string): Promise<string> {
    // Validate mime type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid image type. Only PNG and JPEG are allowed.');
    }

    // Validate size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (imageBuffer.length > maxSize) {
      throw new Error('Image too large. Maximum size is 5MB.');
    }

    // Ensure directory exists
    const imagesDir = this.getProfileImagesDir();
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Generate filename
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${uuidv4()}.${ext}`;
    const filePath = safeJoin(imagesDir, filename);

    // Security check
    assertPathInsideAllowedDirs(filePath, imagesDir);

    // Write file
    fs.writeFileSync(filePath, imageBuffer);

    // Update profile
    await this.updateUserProfile(userId, { profileImagePath: filename });

    return filename;
  }

  async deleteProfileImage(userId: number): Promise<void> {
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
    await this.updateUserProfile(userId, { profileImagePath: null });
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
    return rows.map(row => row.permission_stub);
  }

  getUserPermissions(userId: number): PermissionInfo[] {
    const permissionStubs = this.getUserPermissionStubs(userId);

    // If can-admin, return all possible permissions
    if (permissionStubs.includes('can-admin')) {
      return PERMISSIONS.map(p => ({
        stub: p.stub,
        displayName: this.t(p.displayNameKey)
      }));
    }

    // Otherwise return only the user's permissions
    return permissionStubs.map(stub => {
      const permissionDef = PERMISSIONS.find(p => p.stub === stub);
      return {
        stub,
        displayName: this.t(permissionDef?.displayNameKey || 'common.unknown')
      };
    });
  }

  userHasPermission(userId: number, permissionStub: PermissionStub): boolean {
    const stubs = this.getUserPermissionStubs(userId);
    return stubs.includes('can-admin') || stubs.includes(permissionStub);
  }

  userHasAnyPermission(userId: number, permissionStubs: PermissionStub[]): boolean {
    const userStubs = this.getUserPermissionStubs(userId);
    return userStubs.includes('can-admin') || permissionStubs.some(stub => userStubs.includes(stub));
  }

  userHasAllPermissions(userId: number, permissionStubs: PermissionStub[]): boolean {
    const userStubs = this.getUserPermissionStubs(userId);
    return userStubs.includes('can-admin') || permissionStubs.every(stub => userStubs.includes(stub));
  }

  // User role management
  getUserRoles(userId: number): Role[] {
    const { userRoles, roles } = getModels();
    const userRoleRows = userRoles.getRolesForUser(userId);
    return userRoleRows.map(userRole => {
      const role = roles.getById(userRole.roleId);
      if (!role) throw new Error(`Role ${userRole.roleId} not found`);
      return role;
    });
  }

  assignRoleToUser(userId: number, roleId: number): void {
    // Verify role exists
    const { roles, userRoles } = getModels();
    const role = roles.getById(roleId);
    if (!role) {
      throw new Error(this.t('errors.roleNotFound', 'Role not found'));
    }

    userRoles.assignRoleToUser(userId, roleId);
  }

  removeRoleFromUser(userId: number, roleId: number): void {
    const { userRoles } = getModels();
    userRoles.removeRoleFromUser(userId, roleId);
  }

  assignMultipleRolesToUser(userId: number, roleIds: number[]): void {
    for (const roleId of roleIds) {
      this.assignRoleToUser(userId, roleId);
    }
  }

  removeMultipleRolesFromUser(userId: number, roleIds: number[]): void {
    for (const roleId of roleIds) {
      this.removeRoleFromUser(userId, roleId);
    }
  }
}