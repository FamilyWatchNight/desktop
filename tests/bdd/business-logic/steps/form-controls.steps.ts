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

Given('the Form Controls test page is open for testing', async function (this: CustomWorld) {
  const pageObject = new FormControlsTestPage(this);
  await prepareToTestPage(this, pageObject);
});

When('I submit the controlled form', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.submitControlledForm();
});

When('I submit the uncontrolled form', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.submitUncontrolledForm();
});

When('I request the uncontrolled form values', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.click('uncontrolledGetValuesButton');
});

Then(
  'the uncontrolled form values should equal:',
  async function (this: CustomWorld, expectedJson: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const actualJson = await pageObject.getText('uncontrolledValuesJson');
    expect(actualJson).not.toBeNull();
    const actualValue = JSON.parse(actualJson ?? '{}');
    const expectedValue = JSON.parse(expectedJson);
    expect(actualValue).toStrictEqual(expectedValue);
  },
);
