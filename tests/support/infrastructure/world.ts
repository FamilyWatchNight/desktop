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

export class CustomWorld extends World {
  app!: ElectronApplication;
  dataApi!: TestData;
  dbApi!: Database;
  moviesApi!: Movies;
  settingsApi!: Settings;
  eventNotificationsApi!: EventNotifications;
  backgroundTasksApi!: BackgroundTasks;
  
  // Map task reference names to their enqueued task IDs
  private taskReferenceMap = new Map<string, string>();

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Store mapping between a reference name and a task ID
   */
  storeTaskReference(refName: string, taskId: string): void {
    this.taskReferenceMap.set(refName, taskId);
  }

  /**
   * Get the task ID for a given reference name
   */
  getTaskId(refName: string): string | undefined {
    return this.taskReferenceMap.get(refName);
  }

  /**
   * Find the reference name for a given task ID
   */
  getTaskRefName(taskId: string): string | undefined {
    for (const [refName, id] of this.taskReferenceMap.entries()) {
      if (id === taskId) {
        return refName;
      }
    }
    return undefined;
  }

  /**
   * Clear all task references
   */
  clearTaskReferences(): void {
    this.taskReferenceMap.clear();
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

    // Clear task references for clean slate
    this.clearTaskReferences();

    // Initialize test task type registration
    await this.backgroundTasksApi.setupTestTaskType();

    // Set up event recording for testing
    await this.eventNotificationsApi.setupEventRecording();
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
    this.clearTaskReferences();
  }
}

setWorldConstructor(CustomWorld);
