/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { _electron as electron, ElectronApplication } from 'playwright';
import { HomePage } from './pages/home.page';
import type { TestHooks } from '../../../main/testing-active/TestHooksImpl';

export class CustomWorld extends World {
  app!: ElectronApplication;
  homePage!: HomePage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async launchApp(): Promise<void> {
    const debugArgs = (!!process.env.PWDEBUG) ? ['--inspect-brk=9229'] : [];
    const ciArgs = (!!process.env.CI) ? ['--no-sandbox'] : [];

    this.app = await electron.launch({ args: ['.', ...debugArgs, ...ciArgs] });
    
    this.app.on('console', (msg) => {
      console.log('[app]', msg.text());
    });

    this.homePage = new HomePage(this.app);
  }

  async initMockDatabase(): Promise<void> {
    await this.app.evaluate(async ({ app }) => {
      const appWithTestHooks = app as typeof app & { testHooks?: TestHooks; };

      if (!appWithTestHooks.testHooks) {
        throw new Error('Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.');
      }

      appWithTestHooks.testHooks.db.initMockDatabase();
    });
  }

  async closeDatabase(): Promise<void> {
    await this.app.evaluate(async ({ app }) => {
      const appWithTestHooks = app as typeof app & { testHooks?: TestHooks; };

      if (!appWithTestHooks.testHooks) {
        throw new Error('Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.');
      }

      appWithTestHooks.testHooks.db.closeDatabase();
    });
  }

  async loadStubTmdbData(dataSource: string): Promise<void> {

    console.info('Loading stub TMDB data from:', dataSource);
    
    await this.app.evaluate(async ({ app }, dataSource: string) => {
      const appWithTestHooks = app as typeof app & { testHooks?: TestHooks; };

      if (!appWithTestHooks.testHooks) {
        throw new Error('Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.');
      }

      await appWithTestHooks.testHooks.data.loadStubTmdbData(dataSource);
    }, dataSource);
  }

  async loadStubWatchmodeData(dataSource: string): Promise<void> {
    
    console.info('Loading stub Watchmode data from:', dataSource);

    await this.app.evaluate(async ({ app }, dataSource: string) => {
      const appWithTestHooks = app as typeof app & { testHooks?: TestHooks; };

      if (!appWithTestHooks.testHooks) {
        throw new Error('Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.');
      }

      await appWithTestHooks.testHooks.data.loadStubWatchmodeData(dataSource);
    }, dataSource);
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}

setWorldConstructor(CustomWorld);
