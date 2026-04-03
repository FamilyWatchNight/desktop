/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';
import { Role } from '../../../src/main/db/models/Roles';
import { UserRole } from '../../../src/main/db/models/UserRoles';

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
  async getUserRoles(userId: number): Promise<UserRole[]> {
    return await withTestHooks(this.app, async (hooks, userId) => {
      return hooks.roles.getUserRoles(userId);
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
}