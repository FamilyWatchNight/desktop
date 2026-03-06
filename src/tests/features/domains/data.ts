/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from "playwright";
import { withTestHooks } from "../infrastructure/utils";

export class TestData {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  async loadStubTmdbData(dataSource: string): Promise<void> {
    return await withTestHooks(
      this.app,
      async (hooks, dataSource) => {
        return hooks.data.loadStubTmdbData(dataSource);
      },
      dataSource,
    );
  }

  async loadStubWatchmodeData(dataSource: string): Promise<void> {
    return await withTestHooks(
      this.app,
      async (hooks, dataSource) => {
        return hooks.data.loadStubWatchmodeData(dataSource);
      },
      dataSource,
    );
  }
}
