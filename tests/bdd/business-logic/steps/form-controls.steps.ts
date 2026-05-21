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
import { BasePage } from '../../technical/page-objects';
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
  'I enter {string} into the {string} input',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, value: string, name: string) {
    const pageObject = this.getStateObject('pageObject') as BasePage;
    await pageObject.setInputValue(name, value);
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
  "the {string} input's label should reference its id",
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, name: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const inputId = await pageObject.getId(name);
    const labelFor = await pageObject.getInputLabelForAttribute(name);
    expect(labelFor).toBe(inputId);
  },
);
