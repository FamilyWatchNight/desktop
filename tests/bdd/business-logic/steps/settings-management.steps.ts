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
import { attemptAsync } from '../../technical/infrastructure/utils';
import { defineGiven } from '../../technical/infrastructure/step-helpers';

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system as InternalSystemPersona;
}

defineGiven('the application has the following initial settings:', { preInit: true }, async function (this: CustomWorld, settingsJson: string) {
  const settings = JSON.parse(settingsJson);
  const system = getSystemPersona(this);
  await system.initializeSettings(settings);
});

Given('the application is running with default settings', async function (this: CustomWorld) {
  // Initialize mock settings to ensure we start with a clean slate
  const system = getSystemPersona(this);
  await system.initializeSettings();
});

async function saveSettings(world: CustomWorld, settingsJson: string) {
  const settings = JSON.parse(settingsJson);
  const system = getSystemPersona(world);
  return await system.saveSettings(settings);
}

When('I save the following settings:', async function (this: CustomWorld, settingsJson: string) {
  await saveSettings(this, settingsJson);
});

When('I attempt to save the following settings:', async function (this: CustomWorld, settingsJson: string) {
  await attemptAsync(this, async () => { await saveSettings(this, settingsJson); });
});

async function setSetting(world: CustomWorld, key: string, value: unknown) {
  const system = getSystemPersona(world);
  return await system.setSetting(key, value);
}

When('I set the {string} setting to {int}', async function (this: CustomWorld, key: string, value: number) {
  await setSetting(this, key, value);
});

When('I attempt to set the {string} setting to {int}', async function (this: CustomWorld, key: string, value: number) {
  await attemptAsync(this, async () => { await setSetting(this, key, value); });
});

When('I set the {string} setting to {string}', async function (this: CustomWorld, key: string, value: string) {
  await setSetting(this, key, value);
});

When('I attempt to set the {string} setting to {string}', async function (this: CustomWorld, key: string, value: string) {
  await attemptAsync(this, async () => { await setSetting(this, key, value); });
});

async function loadSettings(world: CustomWorld) {
  world.setStateReturn(undefined, "loadSettings");
  const system = getSystemPersona(world);
  const settings = await system.loadSettings();
  world.setStateObject("settings", settings);
  return settings;
}

When('I request all settings', async function (this: CustomWorld) {
  await loadSettings(this);
});

When('I attempt to request all settings', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await loadSettings(this); });
});

async function getSetting(world: CustomWorld, key: string) {
  const settings = (world.getStateObject("settings") as Record<string, unknown>) ?? {};
  settings[key] = undefined;
  const system = getSystemPersona(world);
  const value = await system.getSetting(key);
  settings[key] = value;
  world.setStateObject("settings", settings);
  return value;
}

When('I request the {string} setting', async function (this: CustomWorld, key: string) {
  await getSetting(this, key);
});

When('I attempt to request the {string} setting', async function (this: CustomWorld, key: string) {
  await attemptAsync(this, async () => { await getSetting(this, key); });
});

Then('I should receive settings that include the following:', async function (this: CustomWorld, expectedSettingsJson: string) {
  const currentSettings = (this.getStateObject("settings") as Record<string, unknown>) ?? {};
  expect(currentSettings).toBeDefined();

  const expectedSettings = JSON.parse(expectedSettingsJson);
  for (const key in expectedSettings) {
    expect(currentSettings).toHaveProperty(key);
    expect(currentSettings[key]).toEqual(expectedSettings[key]);
  }
});

Then('I should receive a {string} setting with value {int}', async function (this: CustomWorld, key: string, expectedValue: number) {
  const currentSettings = (this.getStateObject("settings") as Record<string, unknown>) ?? {};
  expect(currentSettings).toBeDefined();
  expect(currentSettings).toHaveProperty(key);
  expect(currentSettings![key]).toEqual(expectedValue);
});
Then('I should receive a {string} setting with value {string}', async function (this: CustomWorld, key: string, expectedValue: string) {
  const currentSettings = (this.getStateObject("settings") as Record<string, unknown>) ?? {};
  expect(currentSettings).toBeDefined();
  expect(currentSettings).toHaveProperty(key);
  expect(currentSettings![key]).toEqual(expectedValue);
});