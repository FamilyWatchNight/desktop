/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../technical/infrastructure/world';
import { InternalSystemPersona } from '../../business-flow/personas/internal-system';

function userState(world: CustomWorld) {
  return world.getStateStore('userService');
}

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system;
}

When('I create a user with username {string} and no password', async function (this: CustomWorld, username: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.createdUser = await system.createUser({ username });
});

When('I create a user with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.createdUser = await system.createUser({ username, password });
});

Then('the user should be created successfully', function (this: CustomWorld) {
  const state = userState(this);
  const createdUser = state.createdUser as Record<string, unknown> | undefined;
  expect(createdUser).toBeDefined();
  expect(createdUser?.id).toBeDefined();
  expect(createdUser?.username).toBeDefined();
});

Given('a user exists with username {string} and no password', async function (this: CustomWorld, username: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.createdUser = await system.createUser({ username });
});

Given('a user exists with username {string}', async function (this: CustomWorld, username: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.createdUser = await system.createUser({ username });
});

Given('a user exists with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.createdUser = await system.createUser({ username, password });
});

When('I authenticate with username {string} and no password', async function (this: CustomWorld, username: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.authResult = await system.authenticateUser(username, '');
});

When('I authenticate with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  const state = userState(this);
  const system = getSystemPersona(this);
  state.authResult = await system.authenticateUser(username, password);
});

Then('authentication should succeed', function (this: CustomWorld) {
  const state = userState(this);
  const authResult = state.authResult as Record<string, unknown> | null | undefined;
  expect(authResult).toBeDefined();
  expect(authResult?.id).toBeDefined();
});

Then('authentication should fail', function (this: CustomWorld) {
  const state = userState(this);
  const authResult = state.authResult as unknown;
  expect(authResult).toBeNull();
});

When('I update the user\'s display name to {string}', async function (this: CustomWorld, displayName: string) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  await system.updateUserProfile(createdUser.id, { displayName });
});

Then('the user\'s display name should be {string}', async function (this: CustomWorld, expectedDisplayName: string) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const updated = await system.getUserById(createdUser.id);
  expect(updated?.profile?.displayName).toBe(expectedDisplayName);
});