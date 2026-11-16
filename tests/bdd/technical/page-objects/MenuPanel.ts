/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { expect } from '@playwright/test';

import { BasePage } from './BasePage';

export class MenuPanel extends BasePage {
  readonly selectors = {
    settingsButton: '[data-testid="menu-settings"]',
    profileButton: '[data-testid="menu-profile"]',
    homeButton: '[data-testid="menu-home"]',
    logoutButton: '[data-testid="menu-logout"]',
    backgroundTasksButton: '[data-testid="menu-background-tasks"]',
    toggleButton: '[data-testid="menu-toggle-button"]',
    sideMenu: '[data-testid="side-menu"]',
    overlay: '[data-testid="side-menu__backdrop"]',
  };

  async isMenuOpen(): Promise<boolean> {
    return this.isVisible('overlay');
  }

  async assertMenuOpen(shouldBeOpen: boolean): Promise<void> {
    const page = await this.getPage();
    const overlay = page.locator(this.getSelector('overlay'));

    if (shouldBeOpen) {
      await expect(overlay).toBeVisible();
    } else {
      await expect(overlay).not.toBeVisible();
    }
  }

  async assertSideMenuWidth(expectedWidth: number): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('sideMenu'))).toHaveCSS(
      'width',
      `${expectedWidth}px`,
    );
  }

  async ensureMenuIsOpen(): Promise<void> {
    if (!(await this.isMenuOpen())) {
      await this.waitForVisible('toggleButton');
      await this.click('toggleButton');
      await this.waitForVisible('sideMenu');
    }
  }

  async openSettings(): Promise<void> {
    await this.ensureMenuIsOpen();
    await this.click('settingsButton');
  }

  async openProfile(): Promise<void> {
    await this.ensureMenuIsOpen();
    await this.click('profileButton');
  }

  async isProfileAvailable(): Promise<boolean> {
    await this.ensureMenuIsOpen();
    return this.isVisible('profileButton');
  }

  async logout(): Promise<void> {
    await this.ensureMenuIsOpen();
    await this.click('logoutButton');
  }

  async pressEscape(): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press('Escape');
  }

  async clickOverlay(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('overlay')).click();
  }
}
