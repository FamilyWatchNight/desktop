/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/infrastructure/world';

// Store the current user being examined
let createdUser: any = null;

When('I create a user with username {string} and no password', async function (this: CustomWorld, username: string) {
  createdUser = await this.usersApi.createUser({ username });
});

When('I create a user with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  createdUser = await this.usersApi.createUser({ username, password });
});

Then('the user should be created successfully', function () {
  expect(createdUser).toBeDefined();
  expect(createdUser.id).toBeDefined();
  expect(createdUser.username).toBeDefined();
});

Given('a user exists with username {string} and no password', async function (this: CustomWorld, username: string) {
  createdUser = await this.usersApi.createUser({ username });
});

Given('a user exists with username {string}', async function (this: CustomWorld, username: string) {
  createdUser = await this.usersApi.createUser({ username });
});

Given('a user exists with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  createdUser = await this.usersApi.createUser({ username, password });
});

When('I authenticate with username {string} and no password', async function (this: CustomWorld, username: string) {
  const result = await this.usersApi.authenticateUser(username, '');
  this.authResult = result;
});

When('I authenticate with username {string} and password {string}', async function (this: CustomWorld, username: string, password: string) {
  const result = await this.usersApi.authenticateUser(username, password);
  this.authResult = result;
});

Then('authentication should succeed', function () {
  expect(this.authResult).toBeDefined();
  expect(this.authResult.id).toBeDefined();
});

Then('authentication should fail', function () {
  expect(this.authResult).toBeNull();
});

When('I update the user\'s display name to {string}', async function (this: CustomWorld, displayName: string) {
  await this.usersApi.updateUserProfile(createdUser.id, { displayName });
});

Then('the user\'s display name should be {string}', async function (this: CustomWorld, expectedDisplayName: string) {
  const updated = await this.usersApi.getUserById(createdUser.id);
  expect(updated?.profile?.displayName).toBe(expectedDisplayName);
});