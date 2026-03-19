/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { _electron as electron, ElectronApplication } from 'playwright';
import { TestData } from '../domains/data';
import { Database } from '../domains/db';
import { Movies } from '../domains/movies';
import { Settings } from '../domains/settings';

export class CustomWorld extends World {
  app!: ElectronApplication;
  dataApi!: TestData;
  dbApi!: Database;
  moviesApi!: Movies;
  settingsApi!: Settings;

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

    this.dataApi = new TestData(this.app);
    this.dbApi = new Database(this.app);
    this.moviesApi = new Movies(this.app);
    this.settingsApi = new Settings(this.app);
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}

setWorldConstructor(CustomWorld);
