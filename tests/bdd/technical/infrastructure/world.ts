/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import { _electron as electron, ElectronApplication, Page, Browser } from 'playwright';
import { TestData } from '../hooks/data';
import { Database } from '../hooks/db';
import { Movies } from '../hooks/movies';
import { Settings } from '../hooks/settings';
import { EventNotifications } from '../hooks/event-notifications';
import { BackgroundTasks } from '../hooks/background-tasks';
import { Users } from '../hooks/users';
import { Roles } from '../hooks/roles';
import { UI } from '../hooks/ui'
import { findRegisteredStep } from './step-helpers';
import type { UserPersona } from '../../business-flow/personas/UserPersona';

export class CustomWorld extends World {
  app!: ElectronApplication;
  dataApi!: TestData;
  dbApi!: Database;
  moviesApi!: Movies;
  settingsApi!: Settings;
  eventNotificationsApi!: EventNotifications;
  backgroundTasksApi!: BackgroundTasks;
  usersApi!: Users;
  rolesApi!: Roles;
  uiApi!: UI;
  renderLocation: 'electron' | 'browser';
  currentUserPersona?: UserPersona;
  browser?: Browser;
  page?: Page;
  
  // Per-scenario state that supports feature-local stores
  scenarioState: Record<string, Record<string, unknown>> = {};

  // PreInit step management
  private preInitSteps: Array<{ id?: symbol; fn: Function; args: any[] }> = [];
  private executedPreInitStepIds: Set<symbol> = new Set();
  
  constructor(options: IWorldOptions) {
    super(options);
    this.renderLocation = process.env.RENDER_LOCATION === 'browser' ? 'browser' : 'electron';
  }

  /**
   * Get or create a named state store for the current scenario.
   */
  getStateStore(storeName: string): Record<string, unknown> {
    if (!this.scenarioState[storeName]) {
      this.scenarioState[storeName] = {
        latest: null,
        all: new Map<string, unknown>()
      };
    }
    return this.scenarioState[storeName];
  }

  clearStateStore(storeName: string): void {
    delete this.scenarioState[storeName];
  }

  clearAllStateStores(): void {
    this.scenarioState = {};
    this.preInitSteps = [];
    this.executedPreInitStepIds.clear();
  }

  setLastError(error?: Error | unknown, errorMessage?: string): void {
    const state = this.getStateStore('lastError');
    state.error = error;
    state.errorMessage = errorMessage;
  }

  clearLastError(): void {
    this.clearStateStore('lastError');
  }

  getLastError(): { error?: Error | unknown; errorMessage?: string } {
    const state = this.getStateStore('lastError');
    return {
      error: state.error as Error | unknown |undefined,
      errorMessage: state.errorMessage as string | undefined
    };
  }

  getStateObjectStore(objectType: string): unknown {
    const stateObjectStore = this.getStateStore("objects");

    // Object stores can be indexed by both object type and a key to a specific object. Introduce another level of nesting.  
    if (!stateObjectStore[objectType]) {
      stateObjectStore[objectType] = {
        latest: null,
        all: new Map<string, unknown>()
      };
    }
    return stateObjectStore[objectType];
  }

  setStateObject(objectType: string, value: unknown, key?: string): void {
    const objectStore = this.getStateObjectStore(objectType) as { latest: unknown; all: Map<string, unknown> };
    if (key) {
      objectStore.all.set(key, value);
    }
    objectStore.latest = value;
  }
  
  getStateObject(objectType: string, key?: string): unknown | null {
    const objectStore = this.getStateObjectStore(objectType) as { latest: unknown; all: Map<string, unknown> };

    if (key) {
      const object = objectStore.all.get(key);
      if (object === undefined) {
        throw new Error(`No object found in store for type "${objectType}" with key "${key}"`);
      }
      return object;
    } else {
      const object = objectStore.latest;
      if (object === undefined) {
        throw new Error(`No latest object found in store for type "${objectType}"`);
      }
      return objectStore.latest ?? null;
    }
  }

  getStateReturnStore(): unknown {
    return this.getStateStore("returnValues");
  }

  setStateReturn(value: unknown, callType?: string): void {
    const returnStore = this.getStateReturnStore() as { latest: unknown; all: Map<string, unknown> };
    if (callType) {
      returnStore.all.set(callType, value);
    }
    returnStore.latest = value;
  }
  
  getStateReturn(callType?: string): unknown | null {
    const returnStore = this.getStateReturnStore() as { latest: unknown; all: Map<string, unknown> };

    if (callType) {
      const returnValue = returnStore.all.get(callType);
      if (returnValue === undefined) {
        throw new Error(`No return value found in store for type "${callType}"`);
      }
      return returnValue;
    } else {
      return returnStore.latest ?? null;
    }
  }

  /**
   * Collect { preInit: true } steps from the current scenario.
   * This should be called before launching the app.
   */
  collectPreInitSteps(scenario: any): void {
    this.preInitSteps = [];
    this.executedPreInitStepIds.clear();

    for (const step of scenario.pickle?.steps || []) {
      const stepText = step.text;
      const registered = findRegisteredStep(stepText);
      if (!registered) {
        continue;
      }

      if (!registered.step.options.preInit) {
        continue;
      }

      const args = [...registered.args];
      if (step.argument?.docString?.content !== undefined) {
        args.push(step.argument.docString.content);
      } else if (step.argument?.dataTable?.rows) {
        const rows = step.argument.dataTable.rows.map((row: any) =>
          row.cells.map((cell: any) => cell.value)
        );
        args.push(rows);
      }

      this.addPreInitStep(registered.step.id, registered.step.fn, args);
    }
  }

  async executePreInitSteps(): Promise<void> {
    for (const step of this.preInitSteps) {
      await step.fn.apply(this, step.args);
      if (step.id) {
        this.markPreInitStepExecuted(step.id);
      }
    }
    this.preInitSteps = [];
  }

  addPreInitStep(stepId: symbol | undefined, fn: Function, args: any[] = []): void {
    this.preInitSteps.push({ id: stepId, fn, args });
  }

  markPreInitStepExecuted(stepId: symbol): void {
    this.executedPreInitStepIds.add(stepId);
  }

  hasExecutedPreInitStep(stepId: symbol): boolean {
    return this.executedPreInitStepIds.has(stepId);
  }

  /**
   * Wait for the app to be fully ready after preInit steps complete.
   * This is now handled directly via test hooks in the Before hook.
   */
  async waitForAppReady(): Promise<void> {
    // Implementation moved to hooks.ts for direct hook access
    return Promise.resolve();
  }

  async launchApp(): Promise<ElectronApplication> {
    const debugArgs = (!!process.env.PWDEBUG) ? ['--inspect-brk=9229'] : [];
    const ciArgs = (!!process.env.CI) ? ['--no-sandbox'] : [];

    this.app = await electron.launch({
      args: ['.', ...debugArgs, ...ciArgs],
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'test'
      }
    });

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
    this.rolesApi = new Roles(this.app);
    this.uiApi = new UI(this.app);

    // Initialize test task type registration
    await this.backgroundTasksApi.setupTestTaskType();

    // Set up event recording for testing
    await this.eventNotificationsApi.setupEventRecording();

    return this.app;
  }

  async closeApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}

setWorldConstructor(CustomWorld);
