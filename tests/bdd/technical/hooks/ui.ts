/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication, Page, Browser } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';

export class UI {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  async openMainWindow(): Promise<{ page: Page; browser?: Browser }> {
    if (process.env.RENDER_LOCATION === 'browser') {
      const { chromium } = await import('playwright');
      const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
      const page = await browser.newPage();

      const webPort = await withTestHooks(this.app, async (hooks) => {
        return await hooks.settings.get("webPort") || 3000;
      });

      await page.goto(`http://localhost:${webPort}`);
      return { page, browser };
    }
    else {
      await withTestHooks(this.app, async (hooks) => {
        await hooks.ui.openMainWindow();
      });
      return { page: await this.app.waitForEvent('window') };
    }
  }
}
