/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { BasePage } from './BasePage';

export class MenuPanel extends BasePage {
  readonly selectors = {
    settingsButton: '[data-testid="menu-settings"]',
    homeButton: '[data-testid="menu-home"]',
    backgroundTasksButton: '[data-testid="menu-background-tasks"]',
    toggleButton: '[data-testid="menu-toggle-button"]',
    overlay: '[data-testid="menu-overlay"]',
    sideMenu: '[data-testid="side-menu"]',
  };

  async isMenuOpen(): Promise<boolean> {
    return this.isVisible('overlay');
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
}
