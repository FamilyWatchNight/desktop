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
import { clearRecordedEvents, recordEvent, getRecordedEvents, findEventByType, filterEventsByType }  from "./support/mocks/event-notification.mocks";
import { MockBackgroundTask } from "./support/mocks/background-task.mocks";
import { registerTask } from "./support/extensions/task-registry.extensions";
import ImportTmdbTask from "../tasks/ImportTmdbTask"
import ImportWatchmodeTask from "../tasks/ImportWatchmodeTask";
import { MovieService, SettingsService, BackgroundTaskService, UserService, RoleService } from '../services';

const movieService = new MovieService();
const settingsService = new SettingsService();
const backgroundTaskService = new BackgroundTaskService();
const userService = new UserService();
const roleService = new RoleService();

// Track the actively running mock task instance for test control
let activeTestTask: InstanceType<typeof MockBackgroundTask> | null = null;

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
  eventNotifications: {
    clearRecordedEvents: () => void;
    getRecordedEvents: () => Array<{ type: string; data: unknown; timestamp: number }>;
    findEventByType: (type: string) => { type: string; data: unknown; timestamp: number } | undefined;
    filterEventsByType: (type: string) => Array<{ type: string; data: unknown; timestamp: number }>;
    setupEventRecording: () => void;
  };
  testTasks: {
    setupTestTaskType: () => void;
    setTaskProgress: (current: number, max: number, description: string) => void;
    setTaskDescription: (description: string) => void;
    setTaskCurrent: (current: number) => void;
    setTaskMax: (max: number) => void;
    completeTask: () => void;
  };
  users: {
    createTestUser: (data: { username: string; email?: string; password?: string }) => Promise<import('../services/UserService').AuthenticatedUser>;
    authenticateTestUser: (username: string, password: string) => Promise<import('../services/UserService').AuthenticatedUser | null>;
    getTestUserById: (id: number) => import('../services/UserService').AuthenticatedUser | null;
    updateTestUserProfile: (id: number, profileData: { displayName?: string | null; profileImagePath?: string | null }) => Promise<void>;
  };
  roles: {
    createTestRole: (name: string, permissionStubs: string[]) => Promise<import('../db/models/Roles').Role>;
    getTestRoleById: (id: number) => Promise<import('../db/models/Roles').Role | null>;
    getTestRoleByStub: (stub: string) => Promise<import('../db/models/Roles').Role | null>;
    assignRoleToUser: (userId: number, roleId: number) => Promise<void>;
    getRolesForUser: (userId: number) => Promise<number[]>;
    removeRoleFromUser: (userId: number, roleId: number) => Promise<void>;
    setRolePermissions: (roleId: number, permissionStubs: string[]) => Promise<void>;
    getRolePermissions: (roleId: number) => Promise<string[]>;
    getUserPermissions: (userId: number) => Promise<string[]>;
    getAllPermissions: () => string[];
    updateRole: (id: number, data: Partial<import('../db/models/Roles').RoleData>) => Promise<void>;
    updateRoleDisplayName: (id: number, displayName: string) => Promise<void>;
    updateRoleHiddenStatus: (id: number, isHidden: boolean) => Promise<void>;
    deleteRole: (id: number) => Promise<void>;
    duplicateRole: (sourceRoleId: number) => Promise<number>;
    getUsersWithRole: (roleId: number) => number[];
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
    },
    eventNotifications: {
      clearRecordedEvents,
      getRecordedEvents,
      findEventByType,
      filterEventsByType,
      setupEventRecording: () => {
        backgroundTaskService.setNotifyFn((state) => {
          recordEvent('background-task-update', state);
        });
      }
    },
    testTasks: {
      setupTestTaskType: () => {
        registerTask('test-background-task', class extends MockBackgroundTask {
          constructor() {
            super(false);
            activeTestTask = this;
          }
        });
      },
      setTaskProgress: (current: number, max: number, description: string) => {
        if (activeTestTask) {
          activeTestTask.setProgress(current, max, description);
        }
      },
      setTaskDescription: (description: string) => {
        if (activeTestTask) {
          activeTestTask.setDescription(description);
        }
      },
      setTaskCurrent: (current: number) => {
        if (activeTestTask) {
          activeTestTask.setCurrent(current);
        }
      },
      setTaskMax: (max: number) => {
        if (activeTestTask) {
          activeTestTask.setMax(max);
        }
      },
      completeTask: () => {
        if (activeTestTask) {
          activeTestTask.complete();
        }
      }
    },
    users: {
      createTestUser: (data) => userService.createUser(data),
      authenticateTestUser: (username, password) => userService.authenticateUser(username, password),
      getTestUserById: (id) => userService.getUserById(id),
      updateTestUserProfile: (id, profileData) => userService.updateUserProfile(id, profileData)
    },
    roles: {
      createTestRole: async (name, permissionStubs) => {
        const roleId = roleService.createRole({ displayName: name, systemStub: null, isHidden: false });
        if (permissionStubs.length > 0) {
          roleService.setPermissionsForRole(roleId, permissionStubs as any);
        }
        const role = roleService.getRoleById(roleId);
        if (!role) throw new Error('Failed to retrieve created role');
        return role;
      },
      getTestRoleById: (id) => Promise.resolve(roleService.getRoleById(id)),
      getTestRoleByStub: (stub) => Promise.resolve(roleService.getRoleBySystemStub(stub)),
      assignRoleToUser: async (userId, roleId) => {
        roleService.assignRoleToUser(userId, roleId);
      },
      getRolesForUser: async (userId) => {
        return roleService.getRolesForUser(userId);
      },
      removeRoleFromUser: async (userId, roleId) => {
        roleService.removeRoleFromUser(userId, roleId);
      },
      setRolePermissions: async (roleId, permissionStubs) => {
        roleService.setPermissionsForRole(roleId, permissionStubs as any);
      },
      getRolePermissions: async (roleId) => {
        const permissions = roleService.getPermissionsForRole(roleId);
        return permissions.map(p => p.stub);
      },
      getUserPermissions: async (userId) => {
        const permissionInfos = userService.getUserPermissions(userId);
        return permissionInfos.map(pInfo => pInfo.stub);
      },
      getAllPermissions: () => {
        const permissions = roleService.getAllPermissions();
        return permissions.map(p => p.stub);
      },
      updateRole: async (id, data) => {
        roleService.updateRole(id, data);
      },
      updateRoleDisplayName: async (id, displayName) => {
        roleService.updateRole(id, { displayName });
      },
      updateRoleHiddenStatus: async (id, isHidden) => {
        roleService.updateRole(id, { isHidden });
      },
      deleteRole: async (id) => {
        roleService.deleteRole(id);
      },
      duplicateRole: async (sourceRoleId) => {
        return roleService.duplicateRole(sourceRoleId);
      },
      getUsersWithRole: (roleId) => roleService.getUsersWithRole(roleId)
    }
  };
}
