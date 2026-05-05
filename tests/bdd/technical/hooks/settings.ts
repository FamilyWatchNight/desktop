/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';
import { type AuthContextPayload } from '../../../src/main/auth/context-manager';

/**
 * API layer for exposing settings-related functionality in the electron app to Cucumber tests.
 */
export class Settings {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * 
   * Get the initialization status of the settings manager.
   */
  async getStatus(): Promise<{ initialized: boolean }> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.settings.getStatus();
    });
  }

  /**
   * Initialize mock settings for testing purposes. This will clear any existing settings and set the provided test settings.
   */
  async initializeMockSettings(testSettings?: Record<string, unknown>): Promise<void> {
    await withTestHooks(this.app, async (hooks, testSettings) => {
      return hooks.settings.initializeMockSettings(testSettings);
    }, testSettings);
  }

  /**
   * Get a setting value by key
   */
  async getSetting(key: string, authContext?: AuthContextPayload): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, key, authContext) => {
      return hooks.settings.get(key, authContext);
    }, key, authContext);
  }

  /**
   * Set a setting value
   */
  async setSetting(key: string, value: unknown, authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, key, value, authContext) => {
      return hooks.settings.set(key, value, authContext);
    }, key, value, authContext);
  }

  /**
   * Load all settings
   */
  async loadSettings(authContext?: AuthContextPayload): Promise<Record<string, unknown>> {
    return await withTestHooks(this.app, async (hooks, authContext) => {
      return hooks.settings.load(authContext);
    }, authContext);
  }

  /**
   * Save all settings
   */
  async saveSettings(settings: Record<string, unknown>, authContext?: AuthContextPayload): Promise<void> {
    return await withTestHooks(this.app, async (hooks, settings, authContext) => {
      return hooks.settings.save(settings, authContext);
    }, settings, authContext);
  }
}
