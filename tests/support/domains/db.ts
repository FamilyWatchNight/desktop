/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';

export class Database {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
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

    async getStatus(): Promise<{ dbInitialized: boolean; dbConnected: boolean }> {
      return await withTestHooks(this.app, async (hooks) => {
        return hooks.db.getStatus();
      });
    }
  }