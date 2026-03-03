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

  // helper that executes a callback inside the electron app with access to test hooks.
  // all of the repeated casting/validation logic lives here so callers can remain concise.
  async withTestHooks<T, A extends unknown[]>(
    fn: (hooks: TestHooks, ...args: A) => Promise<T> | T,
    ...args: A
  ): Promise<T> {
    const fnString = fn.toString();

    return this.app.evaluate(
      async (
        { app },
        payload: { fnSource: string; fnArgs: unknown[] }
      ) => {
        const { fnSource, fnArgs } = payload;

        const appWithTestHooks = app as typeof app & {
          testHooks?: TestHooks;
        };

        if (!appWithTestHooks.testHooks) {
          throw new Error(
            'Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.'
          );
        }

        const hookFn = eval(`(${fnSource})`);

        return hookFn(appWithTestHooks.testHooks, ...fnArgs);
      },
      {
        fnSource: fnString,
        fnArgs: args,
      }
    );
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
    await this.withTestHooks(async (hooks) => {
      return hooks.db.initMockDatabase();
    });
  }

  async closeDatabase(): Promise<void> {
    await this.withTestHooks(async (hooks) => {
      return hooks.db.closeDatabase();
    });
  }

  async loadStubTmdbData(dataSource: string): Promise<void> {
    return await this.withTestHooks(async (hooks, dataSource) => {
      return hooks.data.loadStubTmdbData(dataSource);
    }, dataSource);
  }

  async loadStubWatchmodeData(dataSource: string): Promise<void> {
    return await this.withTestHooks(async (hooks, dataSource) => {
      return hooks.data.loadStubWatchmodeData(dataSource);
    }, dataSource);
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}

setWorldConstructor(CustomWorld);
