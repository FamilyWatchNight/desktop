/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';
import { Role } from '../../../../src/main/db/models/Roles';

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
  async createRole(name: string, permissionStubs: string[]): Promise<Role> {
    return await withTestHooks(this.app, async (hooks, name, permissionStubs) => {
      return hooks.roles.createTestRole(name, permissionStubs);
    }, name, permissionStubs);
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
   * Assign a role to a user
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    return await withTestHooks(this.app, async (hooks, userId, roleId) => {
      return hooks.roles.assignRoleToUser(userId, roleId);
    }, userId, roleId);
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
  async setRolePermissions(roleId: number, permissionStubs: string[]): Promise<void> {
    return await withTestHooks(this.app, async (hooks, roleId, permissionStubs) => {
      return hooks.roles.setRolePermissions(roleId, permissionStubs);
    }, roleId, permissionStubs);
  }

  /**
   * Delete a role
   */
  async deleteRole(id: number): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id) => {
      return hooks.roles.deleteRole(id);
    }, id);
  }

  /**
   * Update role with multiple properties
   */
  async updateRole(id: number, data: Partial<import('../../../../src/main/db/models/Roles').RoleData>): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, data) => {
      return hooks.roles.updateRole(id, data);
    }, id, data);
  }

  /**
   * Update role display name
   */
  async updateRoleDisplayName(id: number, displayName: string): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, displayName) => {
      return hooks.roles.updateRoleDisplayName(id, displayName);
    }, id, displayName);
  }

  /**
   * Update role hidden status
   */
  async updateRoleHiddenStatus(id: number, isHidden: boolean): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, isHidden) => {
      return hooks.roles.updateRoleHiddenStatus(id, isHidden);
    }, id, isHidden);
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
   * Remove a role from a user
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    return await withTestHooks(this.app, async (hooks, userId, roleId) => {
      return hooks.roles.removeRoleFromUser(userId, roleId);
    }, userId, roleId);
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