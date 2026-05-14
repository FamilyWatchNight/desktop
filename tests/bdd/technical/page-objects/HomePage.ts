/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { BasePage } from './BasePage';
import { SettingsPage } from './SettingsPage';

export class HomePage extends BasePage {
  readonly selectors = {
    pageRoot: '[data-testid="page-home"]',
    settingsButton: '[data-testid="menu-settings"]',
    homeMenuButton: '[data-testid="menu-home"]',
  };

  async openSettings(): Promise<SettingsPage> {
    await this.click('settingsButton');
    return new SettingsPage(this.world);
  }
}
