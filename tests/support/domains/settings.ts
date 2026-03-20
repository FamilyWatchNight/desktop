/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';

/**
 * API layer for exposing settings-related functionality in the electron app to Cucumber tests.
 */
export class Settings {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * Initialize mock settings for testing purposes. This will clear any existing settings and set the provided test settings.
   */
  async initializeMockSettings(testSettings?: Record<string, unknown>): Promise<void> {
    await withTestHooks(this.app, async (hooks, testSettings) => {
      hooks.settings.initializeMockSettings(testSettings);
    }, testSettings);
  }

  /**
   * Get a setting value by key
   */
  async getSetting(key: string): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, key) => {
      return hooks.settings.get(key);
    }, key);
  }

  /**
   * Set a setting value
   */
  async setSetting(key: string, value: unknown): Promise<void> {
    return await withTestHooks(this.app, async (hooks, key, value) => {
      hooks.settings.set(key, value);
    }, key, value);
  }

  /**
   * Load all settings
   */
  async loadSettings(): Promise<Record<string, unknown>> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.settings.load();
    });
  }

  /**
   * Save all settings
   */
  async saveSettings(settings: Record<string, unknown>): Promise<void> {
    return await withTestHooks(this.app, async (hooks, settings) => {
      hooks.settings.save(settings);
    }, settings);
  }
}