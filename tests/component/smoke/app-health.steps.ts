/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/infrastructure/world';
import { withTestHooks } from '../../support/infrastructure/utils';

When('I launch the application', async function (this: CustomWorld) {
  // Application is launched in the Before hook
  // This step is primarily for documentation purposes
});

Then('the application should consider itself ready', async function (this: CustomWorld) {
  // Check that the Electron app has declared itself ready
  const appReady = await withTestHooks(this.app, async (hooks) => {
    return hooks.app.isReady();
  });
  expect(appReady).toBe(true);
});

Then('the database should be connected', async function (this: CustomWorld) {
  const status = await this.dbApi.getStatus();
  expect(status.dbConnected).toBe(true);
});

Then('I can perform basic movie searches', async function (this: CustomWorld) {
  // Test that searching for a non-existent movie returns empty results
  const results = await this.moviesApi.searchByTitle('ThisMovieDefinitelyDoesNotExist12345');
  expect(results).toEqual([]);
});