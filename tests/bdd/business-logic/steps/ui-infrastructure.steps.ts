/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'playwright/test';

import { UnauthenticatedUserPersona } from '../../business-flow/personas/UnauthenticatedUserPersona';
import {
  TIMEOUT as UI_TIMEOUT,
  verifyPageIsVisible,
} from '../../technical/infrastructure/ui-utils';
import { CustomWorld } from '../../technical/infrastructure/world';
import { BasePage, SettingsPage } from '../../technical/page-objects';

import { assert } from './user-service.steps';

Given('I open the app window as an unauthenticated user', async function (this: CustomWorld) {
  this.currentUserPersona = new UnauthenticatedUserPersona(this);
  await this.currentUserPersona.openWindow();
});

When('the user navigates to the Settings page', async function (this: CustomWorld) {
  if (!this.currentUserPersona) {
    throw new Error('No active user persona is set for the scenario');
  }
  await this.currentUserPersona.navigateToSettings();
});

Then('the Settings page is visible', async function (this: CustomWorld) {
  await verifyPageIsVisible(this, 'settings');
});

Then(
  'the Settings page should display the following settings:',
  async function (this: CustomWorld, expectedSettingsJson: string) {
    const expectedSettings = JSON.parse(expectedSettingsJson);
    const settingsPage = new SettingsPage(this);
    for (const [key, expectedValue] of Object.entries(expectedSettings)) {
      const actualValue = await settingsPage.getTextForSetting(
        key as 'webPort' | 'watchmodeApiKey' | 'tmdbApiKey',
      );
      await assert(() => {
        expect(actualValue).toBe(String(expectedValue));
      }, `Expected value of ${key} input field to be "${expectedValue}", but got "${actualValue}".`);
    }
  },
);

Given(
  'the {string} input field has the value {string}',
  async function (this: CustomWorld, name: string, value: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.setInputText(name, value);
  },
);

Given(
  'the {string} input field has the value {int}',
  async function (this: CustomWorld, name: string, value: number) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.setInputNumber(name, value);
  },
);

When(
  'I enter {string} into the {string} input',
  async function (this: CustomWorld, value: string, name: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.setInputText(name, value);
  },
);

When(
  'I enter {int} into the {string} input',
  async function (this: CustomWorld, value: number, name: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.setInputNumber(name, value);
  },
);

Given(
  'the {string} radio group has {string} selected',
  async function (this: CustomWorld, optionKeyOrValue: string, groupSelectorName: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.selectRadioByKeyOrValue(groupSelectorName, optionKeyOrValue);
  },
);

Given(
  'the {string} select has {string} chosen',
  async function (this: CustomWorld, optionKeyOrValue: string, selectSelectorName: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.chooseOptionByKeyOrValue(selectSelectorName, optionKeyOrValue);
  },
);

When(
  'I select {string} for the {string} radio group',
  async function (this: CustomWorld, optionKeyOrValue: string, groupSelectorName: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.selectRadioByKeyOrValue(groupSelectorName, optionKeyOrValue);
  },
);

When(
  'I choose {string} from the {string} select',
  async function (this: CustomWorld, optionKeyOrValue: string, selectSelectorName: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.chooseOptionByKeyOrValue(selectSelectorName, optionKeyOrValue);
  },
);

Then(
  'the {string} element should say {string}',
  async function (this: CustomWorld, name: string, expectedValue: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    const actualValue = await pageObject.getText(name);
    expect(actualValue).toBe(expectedValue);
  },
);

Then(
  'the {string} element should say {int}',
  async function (this: CustomWorld, name: string, expectedCount: number) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    const actualCount = await pageObject.getNumber(name);
    expect(actualCount).toBe(expectedCount);
  },
);

Given('the {string} checkbox is checked', async function (this: CustomWorld, name: string) {
  const pageObject = this.getStateObject('pageObject') as BasePage;
  await pageObject.check(name);
});

When('I check the {string} checkbox', async function (this: CustomWorld, name: string) {
  const pageObject = this.getStateObject('pageObject') as BasePage;
  await pageObject.check(name);
});

Then(
  'the {string} fieldset should have the legend {string}',
  { timeout: UI_TIMEOUT },
  async function (this: CustomWorld, name: string, expectedLegend: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    const actualLegend = await pageObject.getFieldsetLegendText(name);
    expect(actualLegend).toBe(expectedLegend);
  },
);

Then(
  'the {string} element should have aria-label {string}',
  { timeout: UI_TIMEOUT },
  async function (this: CustomWorld, name: string, expectedAriaLabel: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    const actualAriaLabel = await pageObject.getAriaLabel(name);
    expect(actualAriaLabel).toBe(expectedAriaLabel);
  },
);

Then(
  'the {string} input should be visible without a visible label element',
  { timeout: UI_TIMEOUT },
  async function (this: CustomWorld, name: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;

    const isVisible = await pageObject.isVisible(name);
    expect(isVisible).toBe(true);

    const locator = await pageObject.getLocator(name);
    const parentTagName = await locator.evaluate((el) => el.parentElement?.tagName);
    const normalizedParentTagName = parentTagName?.toLowerCase() ?? null;
    expect(normalizedParentTagName).not.toBe('label');
  },
);

Then(
  'the {string} element should have id {string}',
  { timeout: UI_TIMEOUT },
  async function (this: CustomWorld, name: string, expectedId: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    const actualId = await pageObject.getId(name);
    expect(actualId).toBe(expectedId);
  },
);
