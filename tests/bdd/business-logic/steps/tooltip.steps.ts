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
import { TooltipTestPage } from '../../technical/page-objects/TooltipTestPage';

const STEP_TIMEOUT = 10000;

async function prepareToTestPage(world: CustomWorld): Promise<void> {
  if (!(world.currentUserPersona instanceof TesterPersona)) {
    world.currentUserPersona = new TesterPersona(world);
  }
  if (!world.browser) {
    await world.currentUserPersona.openWindow();
  }

  const pageObject = new TooltipTestPage(world);
  world.setStateObject('pageObject', pageObject);
  await pageObject.navigateToPage();
}

Given(
  'the Tooltip test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await prepareToTestPage(this);
  },
);

Given(
  'the reason is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, reason: string) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    await pageObject.setReason(reason);
  },
);

Given(
  'the preview controls are disabled',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    await pageObject.setEnabled(false);
  },
);

When(
  'I hover the basic tooltip trigger',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    await pageObject.hover('basicTrigger');
  },
);

When(
  'I move the pointer away from the basic tooltip trigger',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    await pageObject.movePointerAway();
  },
);

When(
  'I focus the basic tooltip trigger',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    await pageObject.focus('basicTrigger');
  },
);

When(
  'I blur the basic tooltip trigger',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    await pageObject.blur('basicTrigger');
    await pageObject.focus('disabledButton'); // Move the focus (and Norigin) somewhere else to finish the blur
  },
);

Then(
  'the basic tooltip should be visible',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    expect(await pageObject.isTooltipOpen('basicTooltip')).toBe(true);
  },
);

Then(
  'the basic tooltip should be hidden',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    expect(await pageObject.isTooltipOpen('basicTooltip')).toBe(false);
  },
);

Then(
  'the disabled button should be marked unavailable',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    expect(await pageObject.isControlAriaDisabled('disabledButton')).toBe(true);
  },
);

Then(
  'the disabled button should remain focusable',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    expect(await pageObject.isControlFocusable('disabledButton')).toBe(true);
  },
);

Then(
  'the disabled button should have an accessible reason {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedReason: string) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    const text = await pageObject.getDescriptionText('disabledButton');
    expect(text).toBe(expectedReason);
  },
);

Then(
  'the disabled menu item should be marked unavailable',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    expect(await pageObject.isControlAriaDisabled('disabledMenuItem')).toBe(true);
  },
);

Then(
  'the disabled menu item should have an accessible reason {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedReason: string) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    const text = await pageObject.getDescriptionText('disabledMenuItem');
    expect(text).toBe(expectedReason);
  },
);

When('I click the disabled button', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
  await pageObject.forceClick('disabledButton');
});

Then(
  'the disabled button should still be marked unavailable',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as TooltipTestPage;
    expect(await pageObject.isControlAriaDisabled('disabledButton')).toBe(true);
  },
);
