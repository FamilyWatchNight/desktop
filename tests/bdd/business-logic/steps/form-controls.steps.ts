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

Given('the uncontrolled form is ready with no initial values', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.setUncontrolledFormReady(true, {});
});

Given(
  'the uncontrolled form is ready with initial values:',
  async function (this: CustomWorld, jsonString: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const initialValues = JSON.parse(jsonString);
    await pageObject.setUncontrolledFormReady(true, initialValues);
  },
);

Given('the uncontrolled form is initially not ready', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.setUncontrolledFormReady(false, null);
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

When('I validate the controlled form', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.click('controlledValidateButton');
});

When('I reset the controlled form', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.click('controlledResetButton');
});

When('I validate the uncontrolled form', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.click('uncontrolledValidateButton');
});

When('I reset the uncontrolled form', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.click('uncontrolledResetButton');
});

When(
  'the uncontrolled form becomes ready with initial values:',
  async function (this: CustomWorld, jsonString: string) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const initialValues = JSON.parse(jsonString);
    await pageObject.setUncontrolledFormReady(true, initialValues);
  },
);

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

Then(
  'the uncontrolled form fields should display default values',
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    await pageObject.verifyUncontrolledFieldsAreDefault();
  },
);

Then(
  'the uncontrolled form fields should be populated from the provided initial values',
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
    const initialValues = this.getStateObject('uncontrolledInitialValues') as Record<
      string,
      unknown
    >;
    await pageObject.verifyUncontrolledFieldsMatchValues(initialValues);
  },
);

Then('the uncontrolled form fields should be disabled', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.verifyUncontrolledFieldsDisabled(true);
});

Then('the uncontrolled form fields should be enabled', async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as FormControlsTestPage;
  await pageObject.verifyUncontrolledFieldsDisabled(false);
});
