/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { TesterPersona } from '../../business-flow/personas/TesterPersona';
import { CustomWorld } from '../../technical/infrastructure/world';
import { FormControlsTestPage } from '../../technical/page-objects/FormControlsTestPage';

const STEP_TIMEOUT = 10000;

async function prepareToTestPage(world: CustomWorld, pageObject: FormControlsTestPage) {
  if (!(world.currentUserPersona instanceof TesterPersona)) {
    world.currentUserPersona = new TesterPersona(world);
  }
  if (!world.browser) {
    await world.currentUserPersona.openWindow();
  }

  world.setStateObject('pageObject', pageObject);
  await pageObject.navigateToPage();
}

Given(
  'the Form Controls test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = new FormControlsTestPage(this);
    await prepareToTestPage(this, pageObject);
  },
);

When(
  'I enter {string} into the controlled {string} input',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, value: string, inputName: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    await pageObject.setControlledInputValue(inputName, value);
  },
);

When(
  'I enter {string} into the uncontrolled {string} input',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, value: string, inputName: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    await pageObject.setUncontrolledInputValue(inputName, value);
  },
);

When('I submit the controlled form', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.submitControlledForm();
});

When(
  'I submit the uncontrolled form',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    await pageObject.submitUncontrolledForm();
  },
);

Then(
  'the controlled {string} display should show {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, inputName: string, expectedValue: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const actualValue = await pageObject.getControlledDisplay(inputName);
    expect(actualValue).toBe(expectedValue);
  },
);

Then(
  'the uncontrolled {string} result should show {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, resultField: string, expectedValue: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const actualValue = await pageObject.getUncontrolledResult(resultField);
    expect(actualValue).toBe(expectedValue);
  },
);

Then(
  'the controlled form submission count should be {int}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedCount: number) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const actualCount = await pageObject.getControlledSubmitCount();
    expect(actualCount).toBe(expectedCount);
  },
);

Then(
  'the uncontrolled form submission count should be {int}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedCount: number) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const actualCount = await pageObject.getUncontrolledSubmitCount();
    expect(actualCount).toBe(expectedCount);
  },
);

Then(
  'the {string} fieldset should have the legend {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, fieldsetName: string, expectedLegend: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const normalized = fieldsetName.toLowerCase() as 'personal information' | 'preferences';
    const actualLegend = await pageObject.getFieldsetLegend(normalized);
    expect(actualLegend).toBe(expectedLegend);
  },
);

Then(
  'the hidden label {string} input should have aria-label {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, inputName: string, expectedAriaLabel: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const actualAriaLabel = await pageObject.getHiddenLabelInputAriaLabel(inputName);
    expect(actualAriaLabel).toBe(expectedAriaLabel);
  },
);

Then(
  'the hidden label {string} input should be visible without a visible label element',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, inputName: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const isVisible = await pageObject.isHiddenLabelInputVisible(inputName);
    expect(isVisible).toBe(true);
    const hasLabelParent = await pageObject.doesHiddenLabelInputHaveAVisibleLabelParent(inputName);
    expect(hasLabelParent).toBe(false);
  },
);
