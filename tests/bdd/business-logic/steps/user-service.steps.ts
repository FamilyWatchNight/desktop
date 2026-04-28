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
import { attemptAsync } from '../../technical/infrastructure/utils';

export async function assert(assertion: () => Promise<void> | void, message: string) {
  try {
    await assertion();
  } catch (err) {
    throw new Error(`${message}\n${(err as Error).message}`);
  }
}

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system as InternalSystemPersona;
}

function setStoreUser(world: CustomWorld, user: { id: number }, userKey?: string) {
  world.setStateObject('users', user, userKey);
}

function getStoreUser(world: CustomWorld, userKey?: string) {
  return world.getStateObject('users', userKey) as { id: number };
}

function getStoreRole(world: CustomWorld, roleKey?: string) {
  return world.getStateObject('roles', roleKey) as { id: number, permissions: string[] };
}

async function createUserNoPassword(world: CustomWorld, username: string) {
  const system = getSystemPersona(world);
  const user = await system.createUser({ username });
  setStoreUser(world, user, username);
  return user;
}

async function createUserWithPassword(world: CustomWorld, username: string, password: string) {
  const system = getSystemPersona(world);
  const user = await system.createUser({ username, password });
  setStoreUser(world, user, username);
  return user;
}

When('I create a user with username {string} and no password', async function (this: CustomWorld, username: string) {
  await createUserNoPassword(this, username);
});

When('I attempt to create a user with username {string} and no password', async function (this: CustomWorld, username: string) {
  await attemptAsync(this, async () => { await createUserNoPassword(this, username); });
});

When('I create a user with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await createUserWithPassword(this, username, password);
});

When('I attempt to create a user with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await attemptAsync(this, async () => { await createUserWithPassword(this, username, password); });
});

Then('the user should be created successfully', function (this: CustomWorld) {
  const user = getStoreUser(this) as { id?: number; username?: string } | undefined;
  expect(user).toBeDefined();
  expect(user?.id).toBeDefined();
  expect(user?.username).toBeDefined();
});

Given('a user exists with username {string} and no password', async function (this: CustomWorld, username: string) {
  const system = getSystemPersona(this);
  const user = await system.createUser({ username });
  setStoreUser(this, user, username);
});

Given('a user exists with username {string}', async function (this: CustomWorld, username: string) {
  const system = getSystemPersona(this);
  const user = await system.createUser({ username });
  setStoreUser(this, user, username);
});

Given('a user exists with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  const system = getSystemPersona(this);
  const user = await system.createUser({ username, password });
  setStoreUser(this, user, username);
});

async function authenticateWithPassword(world: CustomWorld, username: string, password: string) {
  world.setStateReturn(undefined, "authenticate");
  const system = getSystemPersona(world);
  const user = await system.authenticateUser(username, password);
  world.setStateReturn(user, "authenticate");
  if (user) {
    setStoreUser(world, user, username);
  }
  return user;
}

async function authenticateNoPassword(world: CustomWorld, username: string) {
  return authenticateWithPassword(world, username, '');
}

When('I authenticate with username {string} and no password', async function (this: CustomWorld, username: string) {
  await authenticateNoPassword(this, username);
});

When('I attempt to authenticate with username {string} and no password', async function (this: CustomWorld, username: string) {
  await attemptAsync(this, async () => { await authenticateNoPassword(this, username); });
});

When('I authenticate with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await authenticateWithPassword(this, username, password);
});

When('I attempt to authenticate with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  await attemptAsync(this, async () => { await authenticateWithPassword(this, username, password); });
});

Then('authentication should succeed', function (this: CustomWorld) {
  const authResult = this.getStateReturn("authenticate") as Record<string, unknown> | null;
  expect(authResult).toBeDefined();
  expect(authResult?.id).toBeDefined();
});

Then('authentication should fail', function (this: CustomWorld) {
  const authResult = this.getStateReturn("authenticate") as Record<string, unknown> | null;
  expect(authResult).toBeNull();
});

async function updateUserProfile(world: CustomWorld, userKey: string | undefined, displayName: string) {
  const system = getSystemPersona(world);
  const user = getStoreUser(world, userKey) as { id?: number } | undefined;

  return system.updateUserProfile(user?.id as number, { displayName });
}

Given('the user\'s display name is {string}', async function (this: CustomWorld, displayName: string) {
  await updateUserProfile(this, undefined, displayName);
});

When('I update the user\'s display name to {string}', async function (this: CustomWorld, displayName: string) {
  await updateUserProfile(this, undefined, displayName);
});

When('I attempt to update the display name of user {string} to {string}', async function (this: CustomWorld, username: string, displayName: string) {
  await attemptAsync(this, async () => { await updateUserProfile(this, username, displayName); });
});

Then('the user\'s display name should be {string}', async function (this: CustomWorld, expectedDisplayName: string) {
  const user = getStoreUser(this) as { id: number };
  const system = getSystemPersona(this);
  const updated = await system.getUserById(user.id);
  expect(updated?.profile?.displayName).toBe(expectedDisplayName);
});

async function saveProfileImage(world: CustomWorld, userKey: string | undefined, fileSize: number, mimeType: string) {
  world.setStateReturn(undefined, "saveProfileImage");
  let imageBuffer: Buffer;
  if (mimeType === 'image/jpeg') {
    imageBuffer = generateJpegBuffer(fileSize);
  } else {
    imageBuffer = generatePngBuffer(fileSize);
  }

  const user = getStoreUser(world, userKey) as { id: number };
 
  const system = getSystemPersona(world);
  const filename = await system.saveProfileImage(user.id, imageBuffer, mimeType);
  world.setStateReturn(filename, "saveProfileImage");
}

When('I save a {int}KB PNG profile image for the user', async function (this: CustomWorld, size: number) {
  await saveProfileImage(this, undefined, size * 1024, 'image/png');
});

When('I attempt to save a {int}KB PNG profile image for the user', async function (this: CustomWorld, size: number) {
  await attemptAsync(this, async () => { await saveProfileImage(this, undefined, size * 1024, 'image/png'); });
});

When('I attempt to save a {int}KB PNG profile image for the user {string}', async function (this: CustomWorld, size: number, userKey: string) {
  await attemptAsync(this, async () => { await saveProfileImage(this, userKey, size * 1024, 'image/png'); });
});

When('I save a {int}KB JPEG profile image for the user', async function (this: CustomWorld, size: number) {
  await saveProfileImage(this, undefined, size * 1024, 'image/jpeg');
});

When('I attempt to save a {int}KB JPEG profile image for the user', async function (this: CustomWorld, size: number) {
  await attemptAsync(this, async () => { await saveProfileImage(this, undefined, size * 1024, 'image/jpeg'); });
});

When('I save a {int}MB PNG profile image for the user', async function (this: CustomWorld, size: number) {
  await saveProfileImage(this, undefined, size * 1024 * 1024, 'image/png');
});

When('I attempt to save a {int}MB PNG profile image for the user', async function (this: CustomWorld, size: number) {
  await attemptAsync(this, async () => { await saveProfileImage(this, undefined, size * 1024 * 1024, 'image/png'); });
});

When('I save a {int}MB JPEG profile image for the user', async function (this: CustomWorld, size: number) {
  await saveProfileImage(this, undefined, size * 1024 * 1024, 'image/jpeg');
});

When('I attempt to save a {int}MB JPEG profile image for the user', async function (this: CustomWorld, size: number) {
  await attemptAsync(this, async () => { await saveProfileImage(this, undefined, size * 1024 * 1024, 'image/jpeg'); });
});

When('I attempt to save a GIF profile image for the user', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await saveProfileImage(this, undefined, 100 * 1024, 'image/gif'); });
});

Then('the user\'s profile should reference the saved image', async function (this: CustomWorld) {
  const user = getStoreUser(this) as { id: number };
  const system = getSystemPersona(this);
  const updated = await system.getUserById(user.id);
  const lastFilename = this.getStateReturn("saveProfileImage") as string | undefined;
  expect(updated?.profile?.profileImagePath).toBe(lastFilename);
});

Then('the profile image save should fail with {string}', async function (this: CustomWorld, expectedMessage: string) {
  const { error } = this.getLastError() as { error?: Error ; errorMessage?: string };
  expect(error).toBeDefined();
  return await assert(() => { expect(error?.message.startsWith(expectedMessage)).toBe(true) }, `Expected error message to start with "${expectedMessage}", but got "${error?.message}"`);
});

Given('the user has a {int}KB PNG profile image saved', async function (this: CustomWorld, size: number) {
  await saveProfileImage(this, undefined, size * 1024, 'image/png');
});

async function deleteProfileImage(world: CustomWorld) {
  const user = getStoreUser(world) as { id: number };
  const system = getSystemPersona(world);
  await system.deleteProfileImage(user.id);
}

When('I delete the user\'s profile image', async function (this: CustomWorld) {
  await deleteProfileImage(this);
});

When('I attempt to delete the user\'s profile image', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await deleteProfileImage(this); });
});

Then('the user\'s profile should have no image reference', async function (this: CustomWorld) {
  const user = getStoreUser(this) as { id: number };
  const system = getSystemPersona(this);
  const updated = await system.getUserById(user.id);
  expect(updated?.profile?.profileImagePath).toBeFalsy();
});

async function changePassword(world: CustomWorld, userKey: string | undefined, newPassword: string) {
  const user = getStoreUser(world, userKey) as { id: number };
  const system = getSystemPersona(world);
  await system.changePassword(user.id, newPassword);
}

When('I change the user\'s password to {string}', async function (this: CustomWorld, newPassword: string) {
  await changePassword(this, undefined, newPassword);
});

When('I attempt to change the password of user {string} to {string}', async function (this: CustomWorld, userKey: string, newPassword: string) {
  await attemptAsync(this, async () => { await changePassword(this, userKey, newPassword); });
});

async function getUserProfile(world: CustomWorld, userKey: string) {
  world.setStateReturn(undefined, "getUserProfile");
  const user = getStoreUser(world, userKey) as { id: number };
  const system = getSystemPersona(world);
  const result = await system.getUserById(user.id as number);
  world.setStateReturn(result?.profile, "getUserProfile");
  return result?.profile;
}

When('I get the profile for user {string}', async function (this: CustomWorld, userKey: string) {
  await getUserProfile(this, userKey);
});

When('I attempt to get the profile for user {string}', async function (this: CustomWorld, userKey: string) {
  await attemptAsync(this, async () => { await getUserProfile(this, userKey); });
});

Then('the returned profile should be limited', async function (this: CustomWorld) {
  const profile = this.getStateReturn("getUserProfile") as Record<string, unknown> | undefined;
  expect(profile).toBeDefined();
  expect(profile?.displayName).toBeDefined();
  expect(profile?.id).toBeUndefined();
});

Then('the returned profile should be complete', async function (this: CustomWorld) {
  const profile = this.getStateReturn("getUserProfile") as Record<string, unknown> | undefined;
  expect(profile).toBeDefined();
  expect(profile?.displayName).toBeDefined();
  expect(profile?.id).toBeDefined();
});

When('I authenticate as user {string}', async function (this: CustomWorld, userKey: string) {
  const user = getStoreUser(this, userKey) as { id: number };
  const system = getSystemPersona(this);
  const fullUser = await system.getUserById(user.id as number);
  // Authenticate the user - assume no password since we only have username in the map
  const authenticatedUser = await system.authenticateUser(fullUser?.username as string, '');
  if (!authenticatedUser) {
    throw new Error(`Failed to authenticate as user "${userKey}"`);
  }
  setStoreUser(this, authenticatedUser, userKey);
  system.runAsUser(authenticatedUser.id as number);
});

async function getUsersWithPermissions(world: CustomWorld, permissions: string) {
  world.setStateReturn(undefined, "getUsersWithPermissions");
  const system = getSystemPersona(world);
  const permissionList = permissions.split(',').map((p) => p.trim()).filter(Boolean);
  const users = await system.getUsersWithPermissions(permissionList);
  world.setStateReturn(users, "getUsersWithPermissions");
  return users;
}

When('I request users with the permissions {string}', async function (this: CustomWorld, permissions: string) {
  await getUsersWithPermissions(this, permissions);
});

When('I attempt to request users with the permissions {string}', async function (this: CustomWorld, permissions: string) {
  await attemptAsync(this, async () => { await getUsersWithPermissions(this, permissions); });
});

async function assignRoleToUser(world: CustomWorld, userKey: string) {
  const user = getStoreUser(world, userKey) as { id: number };
  const role = getStoreRole(world);

  const system = getSystemPersona(world);
  await system.assignRoleToUser(user.id as number, role.id);
}

Given('the role has been assigned to user {string}', async function (this: CustomWorld, userKey: string) {
  await assignRoleToUser(this, userKey);
});

When('I assign the role to user {string}', async function (this: CustomWorld, userKey: string) {
  await assignRoleToUser(this, userKey);
});

Then('the user profile should be returned', function (this: CustomWorld) {
  const profile = this.getStateReturn("getUserProfile") as Record<string, unknown> | undefined;
  expect(profile).toBeDefined();
  expect(profile).not.toBeNull();
});

Then('I should receive a list containing the user {string}', function (this: CustomWorld, userKey: string) {
  const usersWithPermissions = (this.getStateReturn("getUsersWithPermissions") as Array<Record<string, unknown>> | undefined) ?? [];
  expect(usersWithPermissions).toBeDefined();
  const expectedUser = getStoreUser(this, userKey) as Record<string, unknown>;
  const found = usersWithPermissions?.some((u) => u.username === expectedUser.username);
  expect(found).toBe(true);
});