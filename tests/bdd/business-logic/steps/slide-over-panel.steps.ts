/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License
as published by the Free Software Foundation, version 3.
*/

import { Given, Then, When } from '@cucumber/cucumber';

import { TesterPersona } from '../../business-flow/personas/TesterPersona';
import { CustomWorld } from '../../technical/infrastructure/world';
import { MenuPanel } from '../../technical/page-objects/MenuPanel';
import { SlideOverPanelTestPage } from '../../technical/page-objects/SlideOverPanelTestPage';

const STEP_TIMEOUT = 10000;

async function prepareToTestPage(world: CustomWorld): Promise<SlideOverPanelTestPage> {
  if (!(world.currentUserPersona instanceof TesterPersona)) {
    world.currentUserPersona = new TesterPersona(world);
  }
  if (!world.browser) {
    await world.currentUserPersona.openWindow();
  }

  const pageObject = new SlideOverPanelTestPage(world);
  world.setStateObject('pageObject', pageObject);
  await pageObject.navigateToPage();
  return pageObject;
}

function getPageObject(world: CustomWorld): SlideOverPanelTestPage {
  return world.getStateObject('pageObject') as SlideOverPanelTestPage;
}

Given(
  'the Slide-over Panel test page is open for testing',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await prepareToTestPage(this);
  },
);

When('I open the slide-over panel', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).openPanel();
});

When('I open the navigation menu', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await new MenuPanel(this).ensureMenuIsOpen();
});

When(
  'I press Escape for the navigation menu',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await new MenuPanel(this).pressEscape();
  },
);

When(
  'I click the navigation menu backdrop',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await new MenuPanel(this).clickOverlay();
  },
);

When('I allow page interaction', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).allowPageInteraction();
});

When(
  'I choose the right panel side',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).chooseRightSide();
  },
);

When(
  'I enable oversized panel width',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).enableOversizedWidth();
  },
);

When(
  'I press Escape for the slide-over panel',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).pressEscape();
  },
);

When(
  'I click the slide-over backdrop',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).clickBackdrop();
  },
);

When(
  'I scroll the slide-over panel to its end',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).scrollPanelToEnd();
  },
);

When(
  'I resize the viewport for the slide-over panel to {int} by {int}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, width: number, height: number) {
    await getPageObject(this).resizeViewport(width, height);
  },
);

When('I activate the page control', { timeout: STEP_TIMEOUT }, async function (this: CustomWorld) {
  await getPageObject(this).activatePageInteraction();
});

Then(
  'the slide-over panel should be named {string}',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, accessibleName: string) {
    await getPageObject(this).assertPanelNamed(accessibleName);
  },
);

Then(
  'the navigation menu should be {int} pixels wide',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld, expectedWidth: number) {
    await new MenuPanel(this).assertSideMenuWidth(expectedWidth);
  },
);

Then(
  'the navigation menu should remain open',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await new MenuPanel(this).assertMenuOpen(true);
  },
);

Then(
  'the navigation menu should be closed',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await new MenuPanel(this).assertMenuOpen(false);
  },
);

Then(
  'the main content should be blocked',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertMainContentBlocked(true);
  },
);

Then(
  'the main content should be available',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertMainContentBlocked(false);
  },
);

Then(
  'the slide-over panel should remain open',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertPanelOpen(true);
  },
);

Then(
  'the slide-over panel should be closed',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertPanelOpen(false);
  },
);

Then(
  'the Escape request should be recorded',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertOutcomeIs('Escape requested');
  },
);

Then(
  'the slide-over backdrop should not be shown',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertBackdropVisible(false);
  },
);

Then(
  'the page interaction should be recorded',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertOutcomeIs('Page interaction selected');
  },
);

Then(
  'the slide-over panel should enter from the right',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertPanelOnRight();
  },
);

Then(
  'the right panel should fill the narrow viewport without clipping',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertPanelFitsViewport();
  },
);

Then(
  'the bottom panel slot should be visible',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertBottomSlotVisible();
  },
);

Then(
  'the start of the top panel slot should be outside the panel viewport',
  { timeout: STEP_TIMEOUT },
  async function (this: CustomWorld) {
    await getPageObject(this).assertTopStartOutsidePanelViewport();
  },
);
