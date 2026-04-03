/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { After, Before, Status } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import * as paths from '../../../../src/main/paths';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Store original function and temp dir for cleanup
let originalGetAppDataRoot: () => string;
let tempAppDataDir: string;
let originalAppDataEnv: string | undefined;
let originalHomeEnv: string | undefined;

// Before each scenario - launch the app
Before({ timeout: 60 * 1000 }, async function (this: CustomWorld) {
  // Reset per-scenario state store
  this.clearAllStateStores();

  // Set up test isolation for file system
  tempAppDataDir = path.join(os.tmpdir(), 'test-app-data-' + Date.now());
  console.log('[Hooks.Before] tempAppDataDir:', tempAppDataDir);
  fs.mkdirSync(tempAppDataDir, { recursive: true });

  originalGetAppDataRoot = paths.getAppDataRoot;
  paths.getAppDataRoot = () => tempAppDataDir;

  // Preserve and override environment variables used by getAppDataRoot
  originalAppDataEnv = process.env.APPDATA;
  originalHomeEnv = process.env.HOME;
  process.env.APPDATA = tempAppDataDir;
  process.env.HOME = tempAppDataDir;

  await this.launchApp();
});

// After each scenario - cleanup
After({ timeout: 60 * 1000 }, async function (this: CustomWorld, scenario) {
  // Close database connection
  if (this.app) {
    try {
      // Clean up background tasks first
      const state = await this.backgroundTasksApi.getState();
      if (state.active) {
        await this.backgroundTasksApi.cancelActive();
      }
      for (const task of state.queue) {
        await this.backgroundTasksApi.removeQueued(task.id);
      }

      // Close database
      await this.dbApi.closeDatabase();

      // Close the app
      await this.app.close();
    } catch (error) {
      console.error('[Hooks.After] Error during cleanup:', error);
    }
  }

  // Restore original paths and environment
  if (originalGetAppDataRoot) {
    paths.getAppDataRoot = originalGetAppDataRoot;
  }
  if (originalAppDataEnv !== undefined) {
    process.env.APPDATA = originalAppDataEnv;
  } else {
    delete process.env.APPDATA;
  }
  if (originalHomeEnv !== undefined) {
    process.env.HOME = originalHomeEnv;
  } else {
    delete process.env.HOME;
  }

  // Clean up temp directory
  if (tempAppDataDir && fs.existsSync(tempAppDataDir)) {
    try {
      fs.rmSync(tempAppDataDir, { recursive: true, force: true });
    } catch (error) {
      console.error('[Hooks.After] Error cleaning up temp dir:', error);
    }
  }
});