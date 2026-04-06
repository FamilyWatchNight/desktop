/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import i18n from '../i18n';
import * as db from '../database';
import { type Role, type RoleData } from '../db/models/Roles';
import type { PermissionStub } from '../auth/permissions';
import { PERMISSIONS } from '../auth/permissions';

export interface RoleWithPermissions extends Role {
  permissions: PermissionInfo[];
}

export interface PermissionInfo {
  stub: PermissionStub;
  displayName: string;
}

export class RoleService {
  private t = i18n.getFixedT(null, 'auth');

  // Role CRUD operations
  createRole(data: RoleData): number {
    const models = db.getModels();
    return models.roles.create(data);
  }

  getRoleById(id: number): Role | null {
    const models = db.getModels();
    return models.roles.getById(id);
  }

  getRoleBySystemStub(systemStub: string): Role | null {
    const models = db.getModels();
    return models.roles.getBySystemStub(systemStub);
  }

  getAllRoles(): Role[] {
    const models = db.getModels();
    return models.roles.getAll();
  }

  updateRole(id: number, data: Partial<RoleData>): void {
    const models = db.getModels();
    models.roles.update(id, data);
  }

  deleteRole(id: number): void {
    const models = db.getModels();
    const role = models.roles.getById(id);
    if (!role) {
      throw new Error(this.t('errors.roleNotFound', 'Role not found'));
    }

    if (role.systemStub) {
      throw new Error(this.t('errors.systemRoleDeletion', 'System roles cannot be deleted'));
    }

    // Check if role is in use
    const usersWithRole = models.userRoles.getUsersByRoleId(id);
    if (usersWithRole.length > 0) {
      throw new Error(this.t('errors.roleInUse', 'Role is assigned to users and cannot be deleted'));
    }

    models.roles.delete(id);
  }

  // Permission management
  setPermissionsForRole(roleId: number, permissionStubs: PermissionStub[]): void {
    const models = db.getModels();
    models.rolePermissions.setPermissionsForRole(roleId, permissionStubs);
  }

  getPermissionsForRole(roleId: number): PermissionInfo[] {
    const models = db.getModels();
    const permissionStubs = models.rolePermissions.getPermissionsForRole(roleId);
    return permissionStubs.map(stub => ({
      stub: stub.stub as PermissionStub,
      displayName: this.t(
        PERMISSIONS.find(p => p.stub === stub.stub)?.displayNameKey || 'common.unknown'
      )
    }));
  }

  getRoleWithPermissions(roleId: number): RoleWithPermissions | null {
    const models = db.getModels();
    const role = models.roles.getById(roleId);
    if (!role) return null;

    const permissions = this.getPermissionsForRole(roleId);
    return { ...role, permissions };
  }

  getAllRolesWithPermissions(): RoleWithPermissions[] {
    const models = db.getModels();
    const roles = models.roles.getAll();
    return roles.map(role => ({
      ...role,
      permissions: this.getPermissionsForRole(role.id)
    }));
  }

  // Query users with a specific role (for role management operations)
  getUsersWithRole(roleId: number): number[] {
    const models = db.getModels();
    return models.userRoles.getUsersByRoleId(roleId);
  }

  // User-role assignment operations
  assignRoleToUser(userId: number, roleId: number): void {
    const models = db.getModels();
    models.userRoles.assignRoleToUser(userId, roleId);
  }

  removeRoleFromUser(userId: number, roleId: number): void {
    const models = db.getModels();
    models.userRoles.removeRoleFromUser(userId, roleId);
  }

  getRolesForUser(userId: number): number[] {
    const models = db.getModels();
    return models.userRoles.getRoleIdsForUser(userId);
  }

  getAllPermissions(): PermissionInfo[] {
    return PERMISSIONS.map(permission => ({
      stub: permission.stub,
      displayName: this.t(permission.displayNameKey)
    }));
  }

  duplicateRole(sourceRoleId: number): number {
    const models = db.getModels();
    const sourceRole = models.roles.getById(sourceRoleId);
    if (!sourceRole) {
      throw new Error(this.t('errors.roleNotFound', 'Role not found'));
    }

    // Get the permissions for the source role
    const permissionStubs = models.rolePermissions.getPermissionsForRole(sourceRoleId);

    // Generate the display name for the duplicate
    const baseName = this.t('roles.copyOf', 'Copy of {{name}}', { name: sourceRole.displayName });
    let displayName = baseName;
    let counter = 2;

    // Check for existing roles with similar names and increment counter
    while (models.roles.getByDisplayName(displayName)) {
      displayName = `${baseName} (${counter})`;
      counter++;
    }

    // Create the new role
    const newRoleId = models.roles.create({
      displayName,
      systemStub: null, // Duplicates are never system roles
      isHidden: sourceRole.isHidden
    });

    // Copy the permissions
    if (permissionStubs.length > 0) {
      models.rolePermissions.setPermissionsForRole(newRoleId, permissionStubs.map(p => p.stub));
    }

    return newRoleId;
  }
}