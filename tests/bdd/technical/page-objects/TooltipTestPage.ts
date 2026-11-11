/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class TooltipTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_TOOLTIP_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="page-tooltip-test"]',
    reasonInput: '[data-testid="tooltip-reason-input"]',
    enabledInput: '[data-testid="tooltip-enabled-input"]',
    basicTooltip: '[data-testid="tooltip-basic"]',
    basicTrigger: '[data-testid="tooltip-basic-trigger"]',
    disabledButton: '[data-testid="disabled-reason-button"]',
    disabledMenuItem: '[data-testid="disabled-reason-menu-item"]',
  } as Record<string, string>;

  async setReason(reason: string): Promise<void> {
    await this.setInputText('reasonInput', reason);
  }

  async setEnabled(enabled: boolean): Promise<void> {
    const current = await this.isChecked('enabledInput');
    if (current !== enabled) {
      await this.click('enabledInput');
    }
  }

  async isTooltipOpen(name: string): Promise<boolean> {
    const overlay = await this.getLocator(name);
    const className = await overlay.getAttribute('class');
    return className?.includes('tooltip__overlay--open') ?? false;
  }

  async getAriaDescribedBy(name: string): Promise<string | null> {
    const locator = await this.getLocator(name);
    return locator.getAttribute('aria-describedby');
  }

  async getDescriptionText(name: string): Promise<string | null> {
    const locator = await this.getLocator(name);
    const describedBy = await locator.getAttribute('aria-describedby');
    if (!describedBy) {
      return null;
    }
    const page = await this.getPage();
    return page.locator(`#${describedBy}`).textContent();
  }

  async isControlAriaDisabled(name: string): Promise<boolean> {
    const locator = await this.getLocator(name);
    return (await locator.getAttribute('aria-disabled')) === 'true';
  }

  async isControlFocusable(name: string): Promise<boolean> {
    const locator = await this.getLocator(name);
    // A focusable (aria-disabled) control must NOT carry the native `disabled`
    // attribute, which would remove it from the tab order.
    return (await locator.getAttribute('disabled')) === null;
  }

  async hover(name: string): Promise<void> {
    const locator = await this.getLocator(name);
    await locator.hover();
  }

  async movePointerAway(): Promise<void> {
    const page = await this.getPage();
    await page.mouse.move(0, 0);
  }

  async focus(name: string): Promise<void> {
    const locator = await this.getLocator(name);
    await locator.focus();
  }

  async blur(name: string): Promise<void> {
    const locator = await this.getLocator(name);
    await locator.blur();
  }

  async forceClick(name: string): Promise<void> {
    const locator = await this.getLocator(name);
    await locator.click({ force: true });
  }
}
