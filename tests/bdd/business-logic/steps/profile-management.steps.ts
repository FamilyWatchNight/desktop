/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License,
version 3.
*/

import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ProfileManagementPersona } from '../../business-flow/personas/ProfileManagementPersona';
import { TIMEOUT as UI_TIMEOUT } from '../../technical/infrastructure/ui-utils';
import type { CustomWorld } from '../../technical/infrastructure/world';

function getProfilePersona(world: CustomWorld): ProfileManagementPersona {
  const state = world.getStateStore('personas');
  if (!state.profileManagement) {
    state.profileManagement = new ProfileManagementPersona(world);
  }
  return state.profileManagement as ProfileManagementPersona;
}

When(
  'I open my profile management page',
  { timeout: 3 * UI_TIMEOUT },
  async function (this: CustomWorld) {
    await getProfilePersona(this).openProfile();
  },
);

Then('profile management is available in the menu', async function (this: CustomWorld) {
  expect(await getProfilePersona(this).profileIsAvailable()).toBe(true);
});

Then('profile management is unavailable in the menu', async function (this: CustomWorld) {
  expect(await getProfilePersona(this).profileIsAvailable()).toBe(false);
});

When('I navigate directly to profile management', async function (this: CustomWorld) {
  await getProfilePersona(this).navigateDirectlyToProfile();
});

Then('profile access is denied', async function (this: CustomWorld) {
  expect(await getProfilePersona(this).hasAccessDeniedMessage()).toBe(true);
});

When(
  'I update my display name to {string}',
  async function (this: CustomWorld, displayName: string) {
    await getProfilePersona(this).updateDisplayName(displayName);
    await getProfilePersona(this).showStatusMessage();
  },
);

Then('my saved display name is {string}', async function (this: CustomWorld, displayName: string) {
  const user = this.getStateObject('users') as { username: string };
  const details = await getProfilePersona(this).getSavedUserDetails(user.username);
  expect(details?.profile?.displayName).toBe(displayName);
});

When('I select a valid PNG profile picture', async function (this: CustomWorld) {
  await getProfilePersona(this).selectGeneratedPng();
});

When('I save my selected profile picture', async function (this: CustomWorld) {
  await getProfilePersona(this).saveImage();
  await getProfilePersona(this).showStatusMessage();
});

Then('my profile picture is saved', async function (this: CustomWorld) {
  const user = this.getStateObject('users') as { username: string };
  const details = await getProfilePersona(this).getSavedUserDetails(user.username);
  expect(details?.profile?.profileImagePath).toBeTruthy();
});

When('I return to my profile page', async function (this: CustomWorld) {
  await getProfilePersona(this).leaveAndReturnToProfile();
});

Then(
  'the profile page shows the display name {string}',
  async function (this: CustomWorld, displayName: string) {
    expect(await getProfilePersona(this).getDisplayName()).toBe(displayName);
  },
);

Then('the profile picture preview is visible', async function (this: CustomWorld) {
  expect(await getProfilePersona(this).hasImagePreview()).toBe(true);
});

When('I remove my profile picture', async function (this: CustomWorld) {
  await getProfilePersona(this).removeImage();
  await getProfilePersona(this).showStatusMessage();
});

Then('my profile picture removal is saved', async function (this: CustomWorld) {
  const user = this.getStateObject('users') as { username: string };
  const details = await getProfilePersona(this).getSavedUserDetails(user.username);
  expect(details?.profile?.profileImagePath).toBeNull();
});

Then('the profile picture placeholder is displayed', async function (this: CustomWorld) {
  expect(await getProfilePersona(this).hasImagePlaceholder()).toBe(true);
});

When(
  'I submit profile passwords {string} and {string}',
  { timeout: 3 * UI_TIMEOUT },
  async function (this: CustomWorld, password: string, confirmation: string) {
    await getProfilePersona(this).changePassword(password, confirmation);
    await getProfilePersona(this).showStatusMessage();
  },
);

Then(
  'the profile page shows the validation error {string}',
  async function (this: CustomWorld, message: string) {
    expect(await getProfilePersona(this).statusMessage()).toContain(message);
  },
);

Then('the profile password is saved', async function (this: CustomWorld) {
  expect(await getProfilePersona(this).statusMessage()).toContain('Password saved');
});

When('I remove my password', async function (this: CustomWorld) {
  await getProfilePersona(this).removePassword();
  await getProfilePersona(this).showStatusMessage();
});

Then('the password removal is saved', async function (this: CustomWorld) {
  const user = this.getStateObject('users') as { username: string };
  const details = await getProfilePersona(this).getSavedUserDetails(user.username);
  expect(details?.account.hasPassword).toBe(false);
});

When('I select a GIF profile picture', async function (this: CustomWorld) {
  await getProfilePersona(this).selectGeneratedGif();
  await getProfilePersona(this).showStatusMessage();
});

When(
  'I select an oversized PNG profile picture',
  { timeout: 3 * UI_TIMEOUT },
  async function (this: CustomWorld) {
    await getProfilePersona(this).selectOversizedPng();
    await getProfilePersona(this).showStatusMessage();
  },
);

Then(
  'no profile picture is saved for {string}',
  async function (this: CustomWorld, username: string) {
    const details = await getProfilePersona(this).getSavedUserDetails(username);
    expect(details).not.toBeNull();
    expect(details?.profile).not.toBeUndefined();
    expect(details?.profile === null || details?.profile?.profileImagePath === null).toBe(true);
  },
);
