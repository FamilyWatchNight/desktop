/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { After, Before } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import { createSystemContext } from '../../../../src/main/auth/context-manager';
import * as paths from '../../../../src/main/paths';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { withTestHooks } from './utils';

// Store original function and temp dir for cleanup
let originalGetAppDataRoot: () => string;
let tempAppDataDir: string;
let originalAppDataEnv: string | undefined;
let originalHomeEnv: string | undefined;

// Before each scenario - launch the app with preInit step support
Before({ timeout: 60 * 1000 }, async function (this: CustomWorld, scenario: any) {
  // Reset per-scenario state store
  this.clearAllStateStores();
  this.collectPreInitSteps(scenario);

  // Set up test isolation for file system
  tempAppDataDir = path.join(os.tmpdir(), 'test-app-data-' + Date.now());
  fs.mkdirSync(tempAppDataDir, { recursive: true });

  const pathsAny = paths as any;
  originalGetAppDataRoot = pathsAny.getAppDataRoot;
  pathsAny.getAppDataRoot = () => tempAppDataDir;

  // Preserve and override environment variables used by getAppDataRoot
  originalAppDataEnv = process.env.APPDATA;
  originalHomeEnv = process.env.HOME;
  process.env.APPDATA = tempAppDataDir;
  process.env.HOME = tempAppDataDir;

  // Phase 1: Launch app (pauses at preInit hook)
  await this.launchApp();

  // Phase 2: Execute the preInit steps collected earlier
  await this.executePreInitSteps();

  // If the preInit steps didn't initialize the settings and database, do it here.
  const dbStatus = await this.dbApi.getStatus();
  if (!dbStatus.dbInitialized) {
    await this.dbApi.initMockDatabase();
  }
  const settingsStatus = await this.settingsApi.getStatus();
  if (!settingsStatus.initialized) {
    await this.settingsApi.initializeMockSettings();
  }

  // Phase 3: Signal app to continue with ready handler
  await withTestHooks(this.app, async (hooks) => {
    hooks.appLifecycle.signalPreInitComplete();
  });

  // Phase 4: Wait for app to be fully ready
  await withTestHooks(this.app, async (hooks) => {
    return hooks.appLifecycle.waitForAppReady();
  });
});

// After each scenario - cleanup
After({ timeout: 60 * 1000 }, async function (this: CustomWorld) {

  const systemContext = createSystemContext();
  const authContextPayload = {
    userId: systemContext.userId,
    permissions: systemContext.permissions
  };

  if (this.page && this.page.isClosed() === false) {
    await this.page.close();
  }

  if (this.browser) {
    await this.browser.close();
  }
  
  if (this.app) {
    try {
      // Clean up background tasks first
      const state = await this.backgroundTasksApi.getState(authContextPayload);
      if (state.active) {
        await this.backgroundTasksApi.cancelActive(authContextPayload);
      }
      for (const task of state.queue as Array<{ id: string }>) {
        await this.backgroundTasksApi.removeQueued(task.id, authContextPayload);
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
    (paths as any).getAppDataRoot = originalGetAppDataRoot;
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


