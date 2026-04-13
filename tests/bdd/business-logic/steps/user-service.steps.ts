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
import { generatePngBuffer, generateJpegBuffer } from '../../business-flow/utilities/image-generator';

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

When('I save a {int}KB PNG profile image for the user', async function (this: CustomWorld, sizeKb: number) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const imageBuffer = generatePngBuffer(sizeKb * 1024);
  try {
    state.profileImageFilename = await system.saveProfileImage(createdUser.id, imageBuffer, 'image/png');
    state.profileImageSaveError = null;
  } catch (error) {
    state.profileImageSaveError = error as Error;
  }
});

When('I save a {int}KB JPEG profile image for the user', async function (this: CustomWorld, sizeKb: number) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const imageBuffer = generateJpegBuffer(sizeKb * 1024);
  try {
    state.profileImageFilename = await system.saveProfileImage(createdUser.id, imageBuffer, 'image/jpeg');
    state.profileImageSaveError = null;
  } catch (error) {
    state.profileImageSaveError = error as Error;
  }
});

When('I save a {int}MB PNG profile image for the user', async function (this: CustomWorld, sizeMb: number) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const imageBuffer = generatePngBuffer(sizeMb * 1024 * 1024);
  try {
    state.profileImageFilename = await system.saveProfileImage(createdUser.id, imageBuffer, 'image/png');
    state.profileImageSaveError = null;
  } catch (error) {
    state.profileImageSaveError = error as Error;
  }
  console.log("Step finished");
});

When('I save a profile image with MIME type {string} for the user', async function (this: CustomWorld, mimeType: string) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  // Generate a small PNG buffer but claim it's a different format
  const imageBuffer = generatePngBuffer(10 * 1024);
  try {
    state.profileImageFilename = await system.saveProfileImage(createdUser.id, imageBuffer, mimeType);
    state.profileImageSaveError = null;
  } catch (error) {
    state.profileImageSaveError = error as Error;
  }
});

Then('the profile image should be saved successfully', function (this: CustomWorld) {
  const state = userState(this);
  expect(state.profileImageSaveError).toBeNull();
  expect(state.profileImageFilename).toBeDefined();
  expect(state.profileImageFilename).not.toBeNull();
});

Then('the user\'s profile should reference the saved image', async function (this: CustomWorld) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const updated = await system.getUserById(createdUser.id);
  expect(updated?.profile?.profileImagePath).toBe(state.profileImageFilename);
});

Then('the profile image save should fail with {string}', function (this: CustomWorld, expectedMessage: string) {
  const state = userState(this);
  expect(state.profileImageSaveError).toBeDefined();
  expect(state.profileImageSaveError?.message).toContain(expectedMessage);
});

Given('the user has a {int}KB PNG profile image saved', async function (this: CustomWorld, sizeKb: number) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const imageBuffer = generatePngBuffer(sizeKb * 1024);
  state.profileImageFilename = await system.saveProfileImage(createdUser.id, imageBuffer, 'image/png');
});

When('I delete the user\'s profile image', async function (this: CustomWorld) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  try {
    await system.deleteProfileImage(createdUser.id);
    state.deleteImageError = null;
  } catch (error) {
    state.deleteImageError = error as Error;
  }
});

Then('the profile image should be deleted successfully', async function (this: CustomWorld) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const updated = await system.getUserById(createdUser.id);
  expect(updated?.profile?.profileImagePath).toBeFalsy();
  expect(state.deleteImageError).toBeNull();
});

Then('the user\'s profile should have no image reference', async function (this: CustomWorld) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  const updated = await system.getUserById(createdUser.id);
  expect(updated?.profile?.profileImagePath).toBeFalsy();
});

Then('the deletion should complete without error', function (this: CustomWorld) {
  const state = userState(this);
  expect(state.deleteImageError).toBeNull();
});

When('I change the user\'s password to {string}', async function (this: CustomWorld, newPassword: string) {
  const state = userState(this);
  const createdUser = state.createdUser as { id?: number } | undefined;
  if (!createdUser?.id) {
    throw new Error('No created user available in scenario state');
  }
  const system = getSystemPersona(this);
  try {
    await system.changePassword(createdUser.id, newPassword);
    state.passwordChangeError = null;
  } catch (error) {
    state.passwordChangeError = error as Error;
  }
});

Then('the password change should succeed', function (this: CustomWorld) {
  const state = userState(this);
  expect(state.passwordChangeError).toBeNull();
});