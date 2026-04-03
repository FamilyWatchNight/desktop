/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import i18n from '../i18n';
import { getModels } from '../database';
import RolesModel, { type Role, type RoleData } from '../db/models/Roles';
import RolePermissionsModel from '../db/models/RolePermissions';
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
  private rolesModel: RolesModel;
  private rolePermissionsModel: RolePermissionsModel;
  private t = i18n.getFixedT(null, 'auth');

  constructor() {
    const models = getModels();
    this.rolesModel = models.roles;
    this.rolePermissionsModel = models.rolePermissions;
  }

  // Role CRUD operations
  createRole(data: RoleData): number {
    return this.rolesModel.create(data);
  }

  getRoleById(id: number): Role | null {
    return this.rolesModel.getById(id);
  }

  getRoleBySystemStub(systemStub: string): Role | null {
    return this.rolesModel.getBySystemStub(systemStub);
  }

  getAllRoles(): Role[] {
    return this.rolesModel.getAll();
  }

  updateRole(id: number, data: Partial<RoleData>): void {
    this.rolesModel.update(id, data);
  }

  deleteRole(id: number): void {
    // Check if role is in use
    const { userRoles } = getModels();
    const usersWithRole = userRoles.getUsersByRoleId(id);
    if (usersWithRole.length > 0) {
      throw new Error(this.t('errors.roleInUse', 'Role is assigned to users and cannot be deleted'));
    }

    this.rolesModel.delete(id);
  }

  // Permission management
  setPermissionsForRole(roleId: number, permissionStubs: PermissionStub[]): void {
    this.rolePermissionsModel.setPermissionsForRole(roleId, permissionStubs);
  }

  getPermissionsForRole(roleId: number): PermissionInfo[] {
    const permissionStubs = this.rolePermissionsModel.getPermissionsForRole(roleId);
    return permissionStubs.map(stub => ({
      stub: stub.stub as PermissionStub,
      displayName: this.t(
        PERMISSIONS.find(p => p.stub === stub.stub)?.displayNameKey || 'common.unknown'
      )
    }));
  }

  getRoleWithPermissions(roleId: number): RoleWithPermissions | null {
    const role = this.rolesModel.getById(roleId);
    if (!role) return null;

    const permissions = this.getPermissionsForRole(roleId);
    return { ...role, permissions };
  }

  getAllRolesWithPermissions(): RoleWithPermissions[] {
    const roles = this.rolesModel.getAll();
    return roles.map(role => ({
      ...role,
      permissions: this.getPermissionsForRole(role.id)
    }));
  }

  // Query users with a specific role (for role management operations)
  getUsersWithRole(roleId: number): number[] {
    const { userRoles } = getModels();
    return userRoles.getUsersByRoleId(roleId);
  }
}