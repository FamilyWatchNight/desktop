/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class MenuItemTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_MENU_ITEM_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="page-menuitem-test"]',
    labelInput: '[data-testid="menuitem-label-input"]',
    badgeInput: '[data-testid="menuitem-badge-input"]',
    activeInput: '[data-testid="menuitem-active-input"]',
    menuItemPreview: '[data-testid="menu-item-preview"]',
    menuItemPreviewLabel: '[data-testid="menu-item-preview"] .menu-item__label',
    menuItemPreviewBadge: '[data-testid="menu-item-preview"] .menu-badge',
  } as Record<string, string>;

  async setMenuItemLabel(label: string): Promise<void> {
    await this.setInputText('labelInput', label);
  }

  async setMenuItemBadge(value: number): Promise<void> {
    await this.setInputNumber('badgeInput', value);
  }

  async setMenuItemActive(active: boolean): Promise<void> {
    const isChecked = await this.isChecked('activeInput');
    if (isChecked !== active) {
      await this.click('activeInput');
    }
  }

  async getMenuItemLabel(): Promise<string | null> {
    return this.getText('menuItemPreviewLabel');
  }

  async getMenuItemBadgeCount(): Promise<number | null> {
    const text = await this.getText('menuItemPreviewBadge');
    if (text === null) {
      return null;
    }
    return Number(text.trim());
  }

  async isMenuItemActive(): Promise<boolean> {
    const element = await this.getLocator('menuItemPreview');
    const ariaCurrent = await element.getAttribute('aria-current');
    return ariaCurrent === 'page';
  }
}
