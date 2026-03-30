/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { After, Before, Status } from '@cucumber/cucumber';
import { CustomWorld } from './world';

// Before each scenario - launch the app
Before({ timeout: 60 * 1000 }, async function (this: CustomWorld) {
  await this.launchApp();
});

// After each scenario - cleanup
After(async function (this: CustomWorld, scenario) {
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

    // Close the app
    await this.closeApp();
  }
});
