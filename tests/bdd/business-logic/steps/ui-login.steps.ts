/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Then, When } from '@cucumber/cucumber';

import { UserPersona } from '../../business-flow/personas/UserPersona';
import { TIMEOUT as UI_TIMEOUT } from '../../technical/infrastructure/ui-utils';
import { CustomWorld } from '../../technical/infrastructure/world';
import { LoginPage } from '../../technical/page-objects';

function getUserPersona(world: CustomWorld): UserPersona {
  if (!world.currentUserPersona) {
    world.currentUserPersona = new UserPersona(world);
  }
  return world.currentUserPersona;
}

function getUserIdForUsername(world: CustomWorld, username: string): number {
  const user = world.getStateObject('users', username) as { id: number } | null;
  if (!user || typeof user.id !== 'number') {
    throw new Error(`No stored user found for username "${username}"`);
  }
  return user.id;
}

function getLoginPage(world: CustomWorld): LoginPage {
  const existingPageObject = world.getStateObject('loginPage') as LoginPage;
  if (existingPageObject) {
    return existingPageObject;
  }

  const newPageObject = new LoginPage(world);
  world.setStateObject('loginPage', newPageObject);
  return newPageObject;
}

Then('the login overlay should be visible', async function (this: CustomWorld) {
  await getLoginPage(this).waitForVisible('pageRoot');
});

Then('the login overlay should be hidden', async function (this: CustomWorld) {
  await getLoginPage(this).waitForDismissal();
});

When(
  'I sign in as {string} with password {string}',
  { timeout: 3 * UI_TIMEOUT },
  async function (this: CustomWorld, username: string, password: string) {
    await getUserPersona(this).signIn(username, password);
  },
);

When('I sign out', { timeout: 2 * UI_TIMEOUT }, async function (this: CustomWorld) {
  await getUserPersona(this).signOut();
});

Then(
  'the login roster should include {string}',
  async function (this: CustomWorld, username: string) {
    const userId = getUserIdForUsername(this, username);
    await getLoginPage(this).waitForUser(userId);
  },
);

Then(
  'the login roster should not include {string}',
  async function (this: CustomWorld, username: string) {
    const userId = getUserIdForUsername(this, username);
    await getLoginPage(this).waitForUserAbsent(userId);
  },
);

When('I click the login user {string}', async function (this: CustomWorld, username: string) {
  const userId = getUserIdForUsername(this, username);
  await getLoginPage(this).clickUser(userId);
});

When('I click the login-cancel-button', async function (this: CustomWorld) {
  await getLoginPage(this).cancelSelection();
});

Then('the login password form should be visible', async function (this: CustomWorld) {
  await getLoginPage(this).waitForPasswordForm();
});

When(
  'I enter {string} into the login password field',
  async function (this: CustomWorld, password: string) {
    await getLoginPage(this).enterPassword(password);
  },
);

When('I submit the login form', async function (this: CustomWorld) {
  await getLoginPage(this).submitPassword();
});
