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
import { EventNotifications } from '../domains/event-notifications';
import { BackgroundTasks } from '../domains/background-tasks';
import { Users } from '../domains/users';

export class CustomWorld extends World {
  app!: ElectronApplication;
  dataApi!: TestData;
  dbApi!: Database;
  moviesApi!: Movies;
  settingsApi!: Settings;
  eventNotificationsApi!: EventNotifications;
  backgroundTasksApi!: BackgroundTasks;
  usersApi!: Users;
  
  // Per-scenario state that supports feature-local stores
  scenarioState: Record<string, Record<string, unknown>> = {};
  
  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Get or create a named state store for the current scenario.
   */
  getStateStore(storeName: string): Record<string, unknown> {
    if (!this.scenarioState[storeName]) {
      this.scenarioState[storeName] = {};
    }
    return this.scenarioState[storeName];
  }

  clearStateStore(storeName: string): void {
    delete this.scenarioState[storeName];
  }

  clearAllStateStores(): void {
    this.scenarioState = {};
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
    this.eventNotificationsApi = new EventNotifications(this.app);
    this.backgroundTasksApi = new BackgroundTasks(this.app);
    this.usersApi = new Users(this.app);

    // Initialize test task type registration
    await this.backgroundTasksApi.setupTestTaskType();

    // Set up event recording for testing
    await this.eventNotificationsApi.setupEventRecording();
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}

setWorldConstructor(CustomWorld);
