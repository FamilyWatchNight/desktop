/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { TesterPersona } from '../../business-flow/personas/TesterPersona';
import { CustomWorld } from '../../technical/infrastructure/world';
import { BasePage } from '../../technical/page-objects';
import { PageFrameworkTestPage } from '../../technical/page-objects/PageFrameworkTestPage';

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
  'the Page Framework test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = new PageFrameworkTestPage(this);
    await prepareToTestPage(this, pageObject);
  },
);

Given(
  'the page title is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, title: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    await pageObject.setPageTitle(title);
  },
);

Given('the page is centered', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
  await pageObject.setPageCentered(true);
});

Given('the page is not centered', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
  await pageObject.setPageCentered(false);
});

Given(
  'the page class name is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, className: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    await pageObject.setPageClassName(className);
  },
);

Then(
  'the Page component should display the title {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedTitle: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    const actualTitle = await pageObject.getPageTitle();
    expect(actualTitle).toBe(expectedTitle);
  },
);

Then(
  'the Page component should have the class name {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedClassName: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    const classList = (await pageObject.getPageClassName())?.split(' ') ?? [];
    expect(classList).toContain(expectedClassName);
  },
);

Then(
  'the Page component should be centered',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    expect(await pageObject.isPageCentered()).toBe(true);
  },
);

Given(
  'the section title is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, title: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    await pageObject.setSectionTitle(title);
  },
);

Given(
  'the section class name is set to {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, className: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    await pageObject.setSectionClassName(className);
  },
);

Then(
  'the Section component should display the title {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedTitle: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    const actualTitle = await pageObject.getSectionTitle();
    expect(actualTitle).toBe(expectedTitle);
  },
);

Then(
  'the Section component should have the class name {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedClassName: string) {
    const pageObject = this.getStateObject('pageObject') as PageFrameworkTestPage;
    const classList = (await pageObject.getSectionClassName())?.split(' ') ?? [];
    expect(classList).toContain(expectedClassName);
  },
);
