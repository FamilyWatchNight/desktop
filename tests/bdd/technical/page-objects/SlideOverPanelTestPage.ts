/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License
as published by the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class SlideOverPanelTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_SLIDE_OVER_PANEL_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="page-slide-over-panel-test"]',
    openPanel: '[data-testid="slide-over-open"]',
    rightSide: '[data-testid="slide-over-right"]',
    blocksContent: '[data-testid="slide-over-blocks-content"]',
    oversizedWidth: '[data-testid="slide-over-oversized-width"]',
    pageInteraction: '[data-testid="slide-over-page-interaction"]',
    outcome: '[data-testid="slide-over-outcome"]',
    panel: '[data-testid="slide-over-panel"]',
    backdrop: '[data-testid="slide-over-panel__backdrop"]',
    bottomSlot: '[data-testid="slide-over-bottom-content"]',
    topStart: '[data-testid="slide-over-top-start"]',
    mainContent: '[data-testid="main-content"]',
  };

  async openPanel(): Promise<void> {
    await this.click('openPanel');
  }

  async chooseRightSide(): Promise<void> {
    await this.click('rightSide');
  }

  async allowPageInteraction(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('blocksContent')).uncheck();
  }

  async enableOversizedWidth(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('oversizedWidth')).check();
  }

  async activatePageInteraction(): Promise<void> {
    await this.click('pageInteraction');
  }

  async pressEscape(): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press('Escape');
  }

  async isPanelOpen(): Promise<boolean> {
    const panel = await this.getLocator('panel');
    return panel.evaluate((element) => element.classList.contains('slide-over-panel--open'));
  }

  async isMainContentBlocked(): Promise<boolean> {
    const content = await this.getLocator('mainContent');
    return content.evaluate((element) => element.hasAttribute('inert'));
  }

  async isBackdropVisible(): Promise<boolean> {
    const page = await this.getPage();
    return page
      .locator(this.getSelector('backdrop'))
      .isVisible()
      .catch(() => false);
  }

  async isPanelOnRight(): Promise<boolean> {
    const panel = await this.getLocator('panel');
    return panel.evaluate((element) => element.classList.contains('slide-over-panel--right'));
  }

  async clickBackdrop(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('backdrop')).click();
  }

  async resizeViewport(width: number, height: number): Promise<void> {
    const page = await this.getPage();
    await page.setViewportSize({ width, height });
  }

  async doesPanelFitViewport(): Promise<boolean> {
    const panel = await this.getLocator('panel');
    const page = await this.getPage();
    const viewport = page.viewportSize();
    await page.waitForFunction((selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 0 && bounds.right <= document.documentElement.clientWidth;
    }, this.getSelector('panel'));
    const bounds = await panel.boundingBox();
    if (!viewport || !bounds) return false;
    return (
      bounds.x >= 0 &&
      bounds.x + bounds.width <= viewport.width &&
      (viewport.width > 600 || Math.abs(bounds.width - viewport.width) <= 1)
    );
  }

  async scrollPanelToEnd(): Promise<void> {
    const panel = await this.getLocator('panel');
    await panel.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
  }

  async isBottomSlotVisible(): Promise<boolean> {
    const panel = await this.getLocator('panel');
    return panel.evaluate((panelElement, bottomSelector) => {
      const bottomElement = panelElement.querySelector(bottomSelector);
      if (!bottomElement) return false;
      const panelBounds = panelElement.getBoundingClientRect();
      const bottomBounds = bottomElement.getBoundingClientRect();
      return bottomBounds.top >= panelBounds.top && bottomBounds.bottom <= panelBounds.bottom;
    }, this.getSelector('bottomSlot'));
  }

  async isTopStartOutsidePanelViewport(): Promise<boolean> {
    const panel = await this.getLocator('panel');
    return panel.evaluate((panelElement, topStartSelector) => {
      const topStartElement = panelElement.querySelector(topStartSelector);
      if (!topStartElement) return false;
      const panelBounds = panelElement.getBoundingClientRect();
      const topStartBounds = topStartElement.getBoundingClientRect();
      return topStartBounds.bottom <= panelBounds.top || topStartBounds.top >= panelBounds.bottom;
    }, this.getSelector('topStart'));
  }

  async getOutcome(): Promise<string | null> {
    return this.getText('outcome');
  }
}
