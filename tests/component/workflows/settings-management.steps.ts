/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/infrastructure/world';

// Store the current settings data being examined
let currentSettings: any = {};

Given('the application is running with default settings', async function (this: CustomWorld) {
  // Initialize mock settings to ensure we start with a clean slate
  await this.settingsApi.initializeMockSettings();
});

When('I request all settings', async function (this: CustomWorld) {
  currentSettings = await this.settingsApi.loadSettings();
});

When('I set the webPort to {int}', async function (this: CustomWorld, port: number) {
  await this.settingsApi.setSetting('webPort', port);
});

When('I request the webPort setting', async function (this: CustomWorld) {
  currentSettings.webPort = await this.settingsApi.getSetting('webPort');
});

When('I save settings with webPort {int} and tmdbApiKey {string}', async function (this: CustomWorld, port: number, apiKey: string) {
  await this.settingsApi.saveSettings({ webPort: port, tmdbApiKey: apiKey });
});

Then('I should receive default settings with webPort {int}', async function (this: CustomWorld, expectedPort: number) {
  expect(currentSettings).toBeDefined();
  expect(currentSettings.webPort).toBe(expectedPort);
});

Then('I should receive {int}', async function (this: CustomWorld, expectedValue: number) {
  expect(currentSettings.webPort).toBe(expectedValue);
});

Then('I should receive settings with webPort {int}', async function (this: CustomWorld, expectedPort: number) {
  expect(currentSettings).toBeDefined();
  expect(currentSettings.webPort).toBe(expectedPort);
});

Then('I should receive settings with webPort {int} and tmdbApiKey {string}', async function (this: CustomWorld, expectedPort: number, expectedApiKey: string) {
  expect(currentSettings).toBeDefined();
  expect(currentSettings.webPort).toBe(expectedPort);
  expect(currentSettings.tmdbApiKey).toBe(expectedApiKey);
});