/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/infrastructure/world';

function settingsState(world: CustomWorld) {
  return world.getStateStore('settingsManagement');
}

Given('the application is running with default settings', async function (this: CustomWorld) {
  // Initialize mock settings to ensure we start with a clean slate
  await this.settingsApi.initializeMockSettings();
});

When('I save the following settings:', async function (this: CustomWorld, settingsJson: string) {
  const settings = JSON.parse(settingsJson);
  for (const key in settings) {
    await this.settingsApi.setSetting(key, settings[key]);
  }
});

When('I set the {string} setting to {int}', async function (this: CustomWorld, key: string, value: number) {
  await this.settingsApi.setSetting(key, value);
});
When('I set the {string} setting to {string}', async function (this: CustomWorld, key: string, value: string) {
  await this.settingsApi.setSetting(key, value);
});

When('I request all settings', async function (this: CustomWorld) {
  const state = settingsState(this);
  state.currentSettings = await this.settingsApi.loadSettings();
});

When('I request the {string} setting', async function (this: CustomWorld, key: string) {
  const state = settingsState(this);
  const currentSettings = (state.currentSettings as Record<string, unknown> | undefined) ?? {};
  currentSettings[key] = await this.settingsApi.getSetting(key);
  state.currentSettings = currentSettings;
});

Then('I should receive settings that include the following:', async function (this: CustomWorld, expectedSettingsJson: string) {
  const state = settingsState(this);
  const currentSettings = state.currentSettings as Record<string, unknown> | undefined;
  expect(currentSettings).toBeDefined();

  const current = currentSettings as Record<string, unknown>;
  const expectedSettings = JSON.parse(expectedSettingsJson);
  for (const key in expectedSettings) {
    expect(current).toHaveProperty(key);
    expect(current[key]).toEqual(expectedSettings[key]);
  }
});

Then('I should receive a {string} setting with value {int}', async function (this: CustomWorld, key: string, expectedValue: number) {
  const state = settingsState(this);
  const currentSettings = state.currentSettings as Record<string, unknown> | undefined;
  expect(currentSettings).toBeDefined();
  expect(currentSettings).toHaveProperty(key);
  expect(currentSettings![key]).toEqual(expectedValue);
});
Then('I should receive a {string} setting with value {string}', async function (this: CustomWorld, key: string, expectedValue: string) {
  const state = settingsState(this);
  const currentSettings = state.currentSettings as Record<string, unknown> | undefined;
  expect(currentSettings).toBeDefined();
  expect(currentSettings).toHaveProperty(key);
  expect(currentSettings![key]).toEqual(expectedValue);
});