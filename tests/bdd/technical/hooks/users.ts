/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';
import { AuthenticatedUser } from '../../../src/main/services/UserService';

/**
 * API layer for exposing user-related functionality in the electron app to Cucumber tests.
 */
export class Users {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * Create a new user
   */
  async createUser(data: { username: string; email?: string; password?: string }): Promise<AuthenticatedUser> {
    return await withTestHooks(this.app, async (hooks, data) => {
      return hooks.users.createTestUser(data);
    }, data);
  }

  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username: string, password: string): Promise<AuthenticatedUser | null> {
    return await withTestHooks(this.app, async (hooks, username, password) => {
      return hooks.users.authenticateTestUser(username, password);
    }, username, password);
  }

  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<AuthenticatedUser | null> {
    return await withTestHooks(this.app, async (hooks, id) => {
      return hooks.users.getTestUserById(id);
    }, id);
  }

  /**
   * Update a user's profile
   */
  async updateUserProfile(id: number, profileData: { displayName?: string | null; profileImagePath?: string | null }): Promise<void> {
    return await withTestHooks(this.app, async (hooks, id, profileData) => {
      return hooks.users.updateTestUserProfile(id, profileData);
    }, id, profileData);
  }
}