/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { app } from 'electron';
import * as db from '../database';

import { createMockDownloadJsonGzStream, createMockDownloadCsvStream }  from "./support/mocks/import-background-tasks.mocks";
import { createMockElectronStore }  from "./support/mocks/electron-store.mocks";
import ImportTmdbTask from "../tasks/ImportTmdbTask"
import ImportWatchmodeTask from "../tasks/ImportWatchmodeTask";
import { MovieService, SettingsService, BackgroundTaskService } from '../services';

const movieService = new MovieService();
const settingsService = new SettingsService();
const backgroundTaskService = new BackgroundTaskService();

export interface TestHooks {
  app: { getAppPath: () => string; isReady: () => boolean };
  db: {
    getStatus: () => { dbInitialized: boolean; dbConnected: boolean };
    initMockDatabase: (testDb?: unknown) => void;
    closeDatabase: () => void;
  };
  data: {
    loadStubTmdbData: (dataSource: string) => Promise<void>;
    loadStubWatchmodeData: (dataSource: string) => Promise<void>;
  };
  movies: {
    getAll: () => import('../db/models/Movies').Movie[];
    getByTmdbId: (tmdbId: string) => import('../db/models/Movies').Movie | null;
    getByWatchmodeId: (watchmodeId: string) => import('../db/models/Movies').Movie | null;
    searchByTitle: (searchTerm: string) => import('../db/models/Movies').Movie[];
  };
  settings: {
    initializeMockSettings: (testSettings?: Record<string, unknown>) => void;
    get: (key: string) => unknown;
    set: (key: string, value: unknown) => void;
    load: () => Record<string, unknown>;
    save: (settings: Record<string, unknown>) => void;
  };
  backgroundTasks: {
    enqueue: (taskType: string, args?: Record<string, unknown>) => unknown;
    getState: () => { active: unknown; queue: unknown[] };
    cancelActive: () => unknown;
    removeQueued: (taskId: string) => unknown;
  };
}

export function getTestHooks(): TestHooks {

  return {
    app: {
        getAppPath: () => app.getAppPath(),
        isReady: () => app.isReady()
    },
    db: {
      getStatus: () => db.getStatus(),
      initMockDatabase: (testDb?: unknown) => db.initMockDatabase(testDb as InstanceType<typeof import('better-sqlite3')> | null),
      closeDatabase: () => db.closeDatabase()
    },
    data: {
      async loadStubTmdbData (dataSource: string) {
        const tmdbDownloader = createMockDownloadJsonGzStream(dataSource);
        const tmdbTask = new ImportTmdbTask(tmdbDownloader);
        await tmdbTask.runTask({}, (global as unknown as { __testCallbacks: { createTaskContext: () => import('../tasks/BackgroundTask').TaskContext } }).__testCallbacks.createTaskContext());
      },
      async loadStubWatchmodeData (dataSource: string) {
        const watchmodeDownloader = createMockDownloadCsvStream(dataSource);
        const watchmodeTask = new ImportWatchmodeTask(watchmodeDownloader);
        await watchmodeTask.runTask({}, (global as unknown as { __testCallbacks: { createTaskContext: () => import('../tasks/BackgroundTask').TaskContext } }).__testCallbacks.createTaskContext());
      }
    },
    movies: {
      getAll: () => movieService.getAll(),
      getByTmdbId: (tmdbId: string) => movieService.getByTmdbId(tmdbId),
      getByWatchmodeId: (watchmodeId: string) => movieService.getByWatchmodeId(watchmodeId),
      searchByTitle: (searchTerm: string) => movieService.searchByTitle(searchTerm)
    },
    settings: {
      initializeMockSettings (testSettings?: Record<string, unknown>) {
        const store = createMockElectronStore(testSettings);
        settingsService.initialize(store);
      },
      get: (key: string) => settingsService.get(key),
      set: (key: string, value: unknown) => settingsService.set(key, value),
      load: () => settingsService.load(),
      save: (settings: Record<string, unknown>) => settingsService.save(settings)
    },
    backgroundTasks: {
      enqueue: (taskType: string, args?: Record<string, unknown>) => backgroundTaskService.enqueue(taskType as any, args ?? {}),
      getState: () => backgroundTaskService.getState(),
      cancelActive: () => backgroundTaskService.cancelActive(),
      removeQueued: (taskId: string) => backgroundTaskService.removeQueued(taskId)
    }
  };
}
