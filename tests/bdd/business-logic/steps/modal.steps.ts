/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License
as published by the Free Software Foundation, version 3.
*/

import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { TesterPersona } from '../../business-flow/personas/TesterPersona';
import { CustomWorld } from '../../technical/infrastructure/world';
import { ModalTestPage } from '../../technical/page-objects/ModalTestPage';

const STEP_TIMEOUT = 10000;

async function prepareToTestPage(world: CustomWorld): Promise<ModalTestPage> {
  if (!(world.currentUserPersona instanceof TesterPersona)) {
    world.currentUserPersona = new TesterPersona(world);
  }
  if (!world.browser) {
    await world.currentUserPersona.openWindow();
  }

  const pageObject = new ModalTestPage(world);
  world.setStateObject('pageObject', pageObject);
  await pageObject.navigateToPage();
  return pageObject;
}

function getPageObject(world: CustomWorld): ModalTestPage {
  return world.getStateObject('pageObject') as ModalTestPage;
}

Given(
  'the Modal test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await prepareToTestPage(this);
  },
);

When('I open the generic modal', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).openModal();
});

When(
  'I open the destructive confirmation',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).openConfirmation();
  },
);

When('I press Escape in the modal', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).pressEscape();
});

When('I click the modal backdrop', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).clickBackdrop();
});

When(
  'I resize the viewport to {int} by {int}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, width: number, height: number) {
    await getPageObject(this).resizeViewport(width, height);
  },
);

When(
  'I scroll the modal content to the end',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).scrollModalContentToEnd();
  },
);

When(
  'I choose the destructive action',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).clickConfirmationAction();
  },
);

When('I cancel the confirmation', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).clickConfirmationCancel();
});

When(
  'I move spatial focus to the destructive action',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).pressArrowRight();
  },
);

When(
  'I activate the focused destructive action',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).pressEnter();
  },
);

Then(
  'the confirmation dialog should be named {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedName: string) {
    const page = await this.page;
    await expect(page.getByRole('dialog', { name: expectedName })).toBeVisible();
  },
);

Then(
  'the confirmation actions should be ordered {string} then {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, first: string, second: string) {
    const actions = await getPageObject(this).getConfirmationActionOrder();
    expect(actions.map((action) => action.trim())).toEqual([first, second]);
  },
);

Then(
  'the confirmation action buttons should fit inside the dialog',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).areConfirmationActionsInsideDialog()).toBe(true);
  },
);

Then(
  'the confirmation Cancel action should have focus',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const page = await this.page;
    await expect(page.getByTestId('destructive-confirmation-cancel')).toBeFocused();
  },
);

Then(
  'the confirmation action should be recorded',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).getOutcome()).toBe('Confirmation action selected');
  },
);

Then(
  'the confirmation cancellation should be recorded',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).getOutcome()).toBe('Confirmation canceled');
  },
);

Then(
  'the confirmation dialog should remain open',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).isDialogVisible()).toBe(true);
  },
);

Then(
  'the confirmation dialog should be closed',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).isDialogVisible()).toBe(false);
  },
);

Then(
  'the generic modal should be closed',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).isDialogVisible()).toBe(false);
  },
);

Then(
  'the generic modal actions should fit inside the dialog',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).areModalActionsInsideDialog()).toBe(true);
  },
);

Then(
  'the end of modal content should be visible',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).isModalContentEndInViewport()).toBe(true);
  },
);

Then(
  'the destructive action should have spatial focus',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    expect(await getPageObject(this).isConfirmationActionSpatiallyFocused()).toBe(true);
  },
);
