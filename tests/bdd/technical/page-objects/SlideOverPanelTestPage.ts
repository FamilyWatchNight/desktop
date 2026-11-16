/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License
as published by the Free Software Foundation, version 3.
*/

import { expect } from '@playwright/test';

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

  async assertPanelNamed(accessibleName: string): Promise<void> {
    const page = await this.getPage();
    await expect(page.getByRole('region', { name: accessibleName })).toBeVisible();
  }

  async assertMainContentBlocked(shouldBeBlocked: boolean): Promise<void> {
    const page = await this.getPage();
    const mainContent = page.locator(this.getSelector('mainContent'));

    if (shouldBeBlocked) {
      await expect(mainContent).toHaveAttribute('inert', '');
    } else {
      await expect(mainContent).not.toHaveAttribute('inert', '');
    }
  }

  async assertPanelOpen(shouldBeOpen: boolean): Promise<void> {
    const page = await this.getPage();
    const panel = page.locator(this.getSelector('panel'));

    if (shouldBeOpen) {
      await expect(panel).toHaveClass(/slide-over-panel--open/);
    } else {
      await expect(panel).not.toHaveClass(/slide-over-panel--open/);
    }
  }

  async assertOutcomeIs(expectedOutcome: string): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('outcome'))).toHaveText(expectedOutcome);
  }

  async assertBackdropVisible(shouldBeVisible: boolean): Promise<void> {
    const page = await this.getPage();
    const backdrop = page.locator(this.getSelector('backdrop'));

    if (shouldBeVisible) {
      await expect(backdrop).toBeVisible();
    } else {
      await expect(backdrop).not.toBeVisible();
    }
  }

  async assertPanelOnRight(): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('panel'))).toHaveClass(/slide-over-panel--right/);
  }

  async clickBackdrop(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('backdrop')).click();
  }

  async resizeViewport(width: number, height: number): Promise<void> {
    const page = await this.getPage();
    await page.setViewportSize({ width, height });
  }

  async assertPanelFitsViewport(): Promise<void> {
    const page = await this.getPage();
    const viewport = page.viewportSize();
    if (!viewport) {
      throw new Error('Viewport size is not available');
    }

    const panel = page.locator(this.getSelector('panel'));
    await expect(panel).toBeInViewport({ ratio: 1 });
    if (viewport.width <= 600) {
      await expect(panel).toHaveCSS('width', `${viewport.width}px`);
    }
  }

  async scrollPanelToEnd(): Promise<void> {
    const panel = await this.getLocator('panel');
    await panel.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
  }

  async assertBottomSlotVisible(): Promise<void> {
    await expect
      .poll(async () => {
        const bounds = await this.getPanelSlotBounds('bottomSlot');
        return (
          bounds !== null &&
          bounds.slot.y >= bounds.panel.y &&
          bounds.slot.y + bounds.slot.height <= bounds.panel.y + bounds.panel.height
        );
      })
      .toBe(true);
  }

  async assertTopStartOutsidePanelViewport(): Promise<void> {
    await expect
      .poll(async () => {
        const bounds = await this.getPanelSlotBounds('topStart');
        return (
          bounds !== null &&
          (bounds.slot.y + bounds.slot.height <= bounds.panel.y ||
            bounds.slot.y >= bounds.panel.y + bounds.panel.height)
        );
      })
      .toBe(true);
  }

  private async getPanelSlotBounds(slotName: 'bottomSlot' | 'topStart') {
    const page = await this.getPage();
    const panel = await page.locator(this.getSelector('panel')).boundingBox();
    const slot = await page.locator(this.getSelector(slotName)).boundingBox();
    return panel && slot ? { panel, slot } : null;
  }
}
