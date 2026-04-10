/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';
import { Role } from '../../../../src/main/db/models/Roles';
import { type AuthContextPayload } from '../../../../src/main/auth/context-manager';

/**
 * API layer for exposing role-related functionality in the electron app to Cucumber tests.
 */
export class Roles {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * Create a new role with permissions
   */
  async createRole(name: string, permissionStubs: string[], authContext?: AuthContextPayload): Promise<Role> {
    return await withTestHooks(this.app, async (hooks, name, permissionStubs, authContext) => {
      return hooks.roles.createTestRole(name, permissionStubs, authContext);
    }, name, permissionStubs, authContext);
  }

  /**
   * Get a role by ID
   */
  async getRoleById(id: number): Promise<Role | null> {
    return await withTestHooks(this.app, async (hooks, id) => {
      return hooks.roles.getTestRoleById(id);
    }, id);
  }

  /**
   * Get roles assigned to a user
   */
  async getRolesForUser(userId: number): Promise<number[]> {
    return await withTestHooks(this.app, async (hooks, userId) => {
      return hooks.roles.getRolesForUser(userId);
    }, userId);
  }

  /**
   * Get effective permissions for a user
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    return await withTestHooks(this.app, async (hooks, userId) => {
      return hooks.roles.getUserPermissions(userId);
    }, userId);
  }

  /**
   * Get a role by system stub
   */
  async getRoleByStub(stub: string): Promise<Role | null> {
    return await withTestHooks(this.app, async (hooks, stub) => {
      return hooks.roles.getTestRoleByStub(stub);
    }, stub);
  }

  /**
   * Get permissions assigned to a role
   */
  async getRolePermissions(roleId: number): Promise<string[]> {
    return await withTestHooks(this.app, async (hooks, roleId) => {
      return hooks.roles.getRolePermissions(roleId);
    }, roleId);
  }

  /**
   * Set the complete set of permissions for a role
   */
  async setRolePermissions(roleId: number, permissionStubs: string[], authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, roleId, permissionStubs, authContext) => {
      return hooks.roles.setRolePermissions(roleId, permissionStubs, authContext);
    }, roleId, permissionStubs, authContext);
  }

  /**
   * Delete a role
   */
  async deleteRole(id: number, authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, authContext) => {
      return hooks.roles.deleteRole(id, authContext);
    }, id, authContext);
  }

  /**
   * Update role with multiple properties
   */
  async updateRole(id: number, data: Partial<import('../../../../src/main/db/models/Roles').RoleData>, authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, data, authContext) => {
      return hooks.roles.updateRole(id, data, authContext);
    }, id, data, authContext);
  }

  /**
   * Update role display name
   */
  async updateRoleDisplayName(id: number, displayName: string, authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, displayName, authContext) => {
      return hooks.roles.updateRoleDisplayName(id, displayName, authContext);
    }, id, displayName, authContext);
  }

  /**
   * Update role hidden status
   */
  async updateRoleHiddenStatus(id: number, isHidden: boolean, authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, isHidden, authContext) => {
      return hooks.roles.updateRoleHiddenStatus(id, isHidden, authContext);
    }, id, isHidden, authContext);
  }

  /**
   * Duplicate a role
   */
  async duplicateRole(sourceRoleId: number): Promise<number> {
    return await withTestHooks(this.app, async (hooks, sourceRoleId) => {
      return hooks.roles.duplicateRole(sourceRoleId);
    }, sourceRoleId);
  }

  /**
   * Get all user IDs with a specific role
   */
  async getUsersWithRole(roleId: number): Promise<number[]> {
    return await withTestHooks(this.app, async (hooks, roleId) => {
      return hooks.roles.getUsersWithRole(roleId);
    }, roleId);
  }

  /**
   * Get all defined permissions
   */
  async getAllPermissions(): Promise<string[]> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.roles.getAllPermissions();
    });
  }
}



