/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { CustomWorld } from '../../technical/infrastructure/world';
import { MenuPanel } from '../../technical/page-objects/MenuPanel';
import { SettingsPage } from '../../technical/page-objects/SettingsPage';

export class UserPersona {
  constructor(protected world: CustomWorld) {}

  async openWindow(): Promise<void> {
    const { page, browser } = await this.world.uiApi.openMainWindow();
    this.world.page = page;
    this.world.browser = browser;
  }

  async navigateToSettings(): Promise<void> {
    const menu = new MenuPanel(this.world);

    await menu.openSettings();

    const settingsPage = new SettingsPage(this.world);
    await settingsPage.waitForVisible('pageRoot', 10000);
  }
}
