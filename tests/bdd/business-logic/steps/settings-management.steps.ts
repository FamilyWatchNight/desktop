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

function settingsState(world: CustomWorld) {
  return world.getStateStore('settingsManagement');
}

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system;
}

Given('the application is running with default settings', async function (this: CustomWorld) {
  // Initialize mock settings to ensure we start with a clean slate
  const system = getSystemPersona(this);
  system.initializeSettings();
});

When('I save the following settings:', async function (this: CustomWorld, settingsJson: string) {
  const settings = JSON.parse(settingsJson);
  const system = getSystemPersona(this);
  for (const key in settings) {
    system.setSetting(key, settings[key]);
  }
});

When('I set the {string} setting to {int}', async function (this: CustomWorld, key: string, value: number) {
  const system = getSystemPersona(this);
  system.setSetting(key, value);
});
When('I set the {string} setting to {string}', async function (this: CustomWorld, key: string, value: string) {
  const system = getSystemPersona(this);
  system.setSetting(key, value);
});

When('I request all settings', async function (this: CustomWorld) {
  const state = settingsState(this);
  const system = getSystemPersona(this);
  state.currentSettings = await system.loadSettings();
});

When('I request the {string} setting', async function (this: CustomWorld, key: string) {
  const state = settingsState(this);
  const system = getSystemPersona(this);
  const currentSettings = (state.currentSettings as Record<string, unknown> | undefined) ?? {};
  currentSettings[key] = await system.getSetting(key);
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