/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../../bdd/technical/infrastructure/world';
import { InternalSystemPersona } from '../../../bdd/business-flow/personas/internal-system';

// Helper to get or create system persona for this scenario
function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system;
}

When('I launch the application', async function (this: CustomWorld) {
  // Application is launched in the Before hook
  // This step is primarily for documentation purposes
});

Then('the application should consider itself ready', async function (this: CustomWorld) {
  // Check that the Electron app has declared itself ready
  const system = getSystemPersona(this);
  const appReady = await system.isAppReady();
  expect(appReady).toBe(true);
});

Then('the database should be connected', async function (this: CustomWorld) {
  const system = getSystemPersona(this);
  const status = await system.getDatabaseStatus();
  expect(status.dbConnected).toBe(true);
});

Then('I can perform basic movie searches', async function (this: CustomWorld) {
  const system = getSystemPersona(this);
  // Test that searching for a non-existent movie returns empty results
  const results = await system.searchMoviesByTitle('ThisMovieDefinitelyDoesNotExist12345');
  expect(results).toEqual([]);
});