/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { After, Before, Status } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import * as paths from '../../../src/main/paths';
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
      
      // Cancel active task if running
      if (state.active) {
        await this.backgroundTasksApi.cancelActive();
      }
      
      // Remove all queued tasks
      for (const task of state.queue as any[]) {
        await this.backgroundTasksApi.removeQueued(task.id);
      }
      
      // Small delay to allow tasks to clean up
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now close database
      await this.dbApi.closeDatabase();
    } catch (error) {
      // Database may not have been initialized in some scenarios
      console.log('Note: Could not close database (may not have been initialized)');
    }

    // Take screenshot on failure for debugging
    if (scenario.result?.status === Status.FAILED) {
      try {
        const window = await this.app.firstWindow();
        // Only capture screenshot if window exists and is ready
        if (window) {
          const screenshot = await window.screenshot();
          this.attach(screenshot, 'image/png');
        }
      } catch (screenshotError) {
        // Screenshot capture failed or no window available - continue with cleanup
        console.log('Screenshot not available (no window or capture failed)');
      }
    }

    // Restore paths and environment variables, then clean temp directory
    paths.getAppDataRoot = originalGetAppDataRoot;
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

    // Close the app first to release file handles before directory cleanup
    try {
      await this.closeApp();
    } catch (closeAppError) {
      console.log('Warning: closeApp failed during teardown:', closeAppError);
    }

    // Remove temporary app data directory with retries for transient Windows locks
    if (fs.existsSync(tempAppDataDir)) {
      const maxRetries = 5;
      let attempt = 0;
      let removed = false;
      while (attempt < maxRetries && !removed) {
        try {
          fs.rmSync(tempAppDataDir, { recursive: true, force: true });
          removed = true;
        } catch (rmError) {
          attempt += 1;
          console.log(`Warning: Failed to remove tempAppDataDir (attempt ${attempt}):`, rmError);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          }
        }
      }
      if (!removed) {
        console.log('Error: Could not remove tempAppDataDir after retries:', tempAppDataDir);
      }
    }
  }
});
