import { Given, When, Then } from '@cucumber/cucumber';
import { verifyPageIsVisible } from '../../technical/infrastructure/ui-utils';
import { UnauthenticatedUserPersona } from '../../business-flow/personas/UnauthenticatedUserPersona';
import { CustomWorld } from '../../technical/infrastructure/world';
import { TIMEOUT as UI_TIMEOUT } from '../../technical/infrastructure/ui-utils';
import { expect } from 'playwright/test';
import { assert } from './user-service.steps';
import { SettingsPage } from '../../technical/page-objects/SettingsPage';


const STEP_TIMEOUT = UI_TIMEOUT + 1000;

Given('I open the app window as an unauthenticated user', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  this.currentUserPersona = new UnauthenticatedUserPersona(this);
  await this.currentUserPersona.openWindow();
});

When('the user navigates to the Settings page', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  if (!this.currentUserPersona) {
    throw new Error('No active user persona is set for the scenario');
  }
  await this.currentUserPersona.navigateToSettings();
});

Then('the Settings page is visible', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await verifyPageIsVisible(this, 'settings');
});

Then('the Settings page should display the following settings:', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld, expectedSettingsJson: string) {
  const expectedSettings = JSON.parse(expectedSettingsJson);
  const settingsPage = new SettingsPage(this);
  for (const [key, expectedValue] of Object.entries(expectedSettings)) {
    const actualValue = await settingsPage.getTextForSetting(key as 'webPort' | 'watchmodeApiKey' | 'tmdbApiKey');
    await assert(() => { expect(actualValue).toBe(String(expectedValue)); }, `Expected value of ${key} input field to be "${expectedValue}", but got "${actualValue}".`);
  }
});