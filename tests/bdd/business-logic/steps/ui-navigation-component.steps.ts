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
import { ButtonTestPage } from '../../technical/page-objects/ButtonTestPage';
import { ExpandableMenuSectionTestPage } from '../../technical/page-objects/ExpandableMenuSectionTestPage';
import { MenuItemTestPage } from '../../technical/page-objects/MenuItemTestPage';

const STEP_TIMEOUT = 10000;

async function prepareToTestPage(world: CustomWorld, pageObject: BasePage) {
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
  'the MenuItem test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = new MenuItemTestPage(this);
    await prepareToTestPage(this, pageObject);
  },
);

Given(
  'the menu item label is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, label: string) {
    const pageObject = this.getStateObject('pageObject') as MenuItemTestPage;
    await pageObject.setMenuItemLabel(label);
  },
);

Given(
  'the menu item badge is set to {int}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, badge: number) {
    const pageObject = this.getStateObject('pageObject') as MenuItemTestPage;
    await pageObject.setMenuItemBadge(badge);
  },
);

Given('the menu item is active', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as MenuItemTestPage;
  await pageObject.setMenuItemActive(true);
});

Then(
  'the menu item preview should display the label {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedLabel: string) {
    const pageObject = this.getStateObject('pageObject') as MenuItemTestPage;
    const actualLabel = await pageObject.getMenuItemLabel();
    expect(actualLabel).toBe(expectedLabel);
  },
);

Then(
  'the menu item preview badge should be {int}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedBadge: number) {
    const pageObject = this.getStateObject('pageObject') as MenuItemTestPage;
    const actualBadge = await pageObject.getMenuItemBadgeCount();
    expect(actualBadge).toBe(expectedBadge);
  },
);

Then(
  'the menu item preview should be active',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as MenuItemTestPage;
    expect(await pageObject.isMenuItemActive()).toBe(true);
  },
);

Given(
  'the Expandable Section test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = new ExpandableMenuSectionTestPage(this);
    await prepareToTestPage(this, pageObject);
  },
);

Given(
  'the expandable section is expanded',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as ExpandableMenuSectionTestPage;
    await pageObject.setExpanded(true);
  },
);

When(
  'I toggle the expandable section',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as ExpandableMenuSectionTestPage;
    await pageObject.toggleSection();
  },
);

Then(
  'the expandable section toggle should have aria-expanded {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedValue: string) {
    const pageObject = this.getStateObject('pageObject') as ExpandableMenuSectionTestPage;
    const isExpanded = await pageObject.isSectionExpanded();
    expect(String(isExpanded)).toBe(expectedValue);
  },
);

Then(
  'the expandable section content should be visible',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as ExpandableMenuSectionTestPage;
    expect(await pageObject.isSectionContentVisible()).toBe(true);
  },
);

Then(
  'the expandable section content should be hidden',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as ExpandableMenuSectionTestPage;
    expect(await pageObject.isSectionContentVisible()).toBe(false);
  },
);

Given(
  'the Button test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = new ButtonTestPage(this);
    await prepareToTestPage(this, pageObject);
  },
);

Given(
  'the button variant is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, variant: string) {
    const pageObject = this.getStateObject('pageObject') as ButtonTestPage;
    await pageObject.setVariant(variant);
  },
);

Given(
  'the button size is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, size: string) {
    const pageObject = this.getStateObject('pageObject') as ButtonTestPage;
    await pageObject.setSize(size);
  },
);

Given('the buttons are disabled', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as ButtonTestPage;
  await pageObject.setDisabled(true);
});

Then(
  'button {int} should have class name {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, buttonNumber: number, expectedClassName: string) {
    const pageObject = this.getStateObject('pageObject') as ButtonTestPage;
    const buttonName = buttonNumber === 1 ? 'button1' : 'button2';
    const classList = await pageObject.getButtonClassList(buttonName as 'button1' | 'button2');
    expect(classList).toContain(expectedClassName);
  },
);

Then(
  'button {int} should be disabled',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, buttonNumber: number) {
    const pageObject = this.getStateObject('pageObject') as ButtonTestPage;
    const buttonName = buttonNumber === 1 ? 'button1' : 'button2';
    expect(await pageObject.isButtonDisabled(buttonName as 'button1' | 'button2')).toBe(true);
  },
);
