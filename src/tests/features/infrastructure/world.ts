/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { _electron as electron, ElectronApplication } from 'playwright';
import { Movies } from '../domains/movies';
import { withTestHooks } from './utils';

export class CustomWorld extends World {
  app!: ElectronApplication;
  moviesApi!: Movies;

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

    this.moviesApi = new Movies(this.app);
  }

  async initMockDatabase(): Promise<void> {
    await withTestHooks(this.app, async (hooks) => {
      return hooks.db.initMockDatabase();
    });
  }

  async closeDatabase(): Promise<void> {
    await withTestHooks(this.app, async (hooks) => {
      return hooks.db.closeDatabase();
    });
  }

  async loadStubTmdbData(dataSource: string): Promise<void> {
    return await withTestHooks(this.app, async (hooks, dataSource) => {
      return hooks.data.loadStubTmdbData(dataSource);
    }, dataSource);
  }

  async loadStubWatchmodeData(dataSource: string): Promise<void> {
    return await withTestHooks(this.app, async (hooks, dataSource) => {
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
