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
import { createAuthContext, type AuthContextPayload } from '../auth/context-manager';
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
    getAll: (authContext?: AuthContextPayload) => import('../db/models/Movies').Movie[];
    getByTmdbId: (tmdbId: string, authContext?: AuthContextPayload) => import('../db/models/Movies').Movie | null;
    getByWatchmodeId: (watchmodeId: string, authContext?: AuthContextPayload) => import('../db/models/Movies').Movie | null;
    searchByTitle: (searchTerm: string, authContext?: AuthContextPayload) => import('../db/models/Movies').Movie[];
  };
  settings: {
    initializeMockSettings: (testSettings?: Record<string, unknown>) => void;
    get: (key: string, authContext?: AuthContextPayload) => unknown;
    set: (key: string, value: unknown, authContext?: AuthContextPayload) => void;
    load: (authContext?: AuthContextPayload) => Record<string, unknown>;
    save: (settings: Record<string, unknown>, authContext?: AuthContextPayload) => void;
  };
  backgroundTasks: {
    enqueue: (taskType: string, args?: Record<string, unknown>, authContext?: AuthContextPayload) => unknown;
    getState: (authContext?: AuthContextPayload) => { active: unknown; queue: unknown[] };
    cancelActive: (authContext?: AuthContextPayload) => unknown;
    removeQueued: (taskId: string, authContext?: AuthContextPayload) => unknown;
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
    createTestUser: (data: { username: string; email?: string; password?: string }, authContext?: AuthContextPayload) => Promise<import('../services/UserService').AuthenticatedUser>;
    authenticateTestUser: (username: string, password: string) => Promise<import('../services/UserService').AuthenticatedUser | null>;
    getTestUserById: (id: number) => import('../services/UserService').AuthenticatedUser | null;
    updateTestUserProfile: (id: number, profileData: { displayName?: string | null; profileImagePath?: string | null }, authContext?: AuthContextPayload) => Promise<void>;
    assignRoleToUser: (userId: number, roleId: number, authContext?: AuthContextPayload) => Promise<void>;
    removeRoleFromUser: (userId: number, roleId: number, authContext?: AuthContextPayload) => Promise<void>;
  };
  roles: {
    createTestRole: (name: string, permissionStubs: string[], authContext?: AuthContextPayload) => Promise<import('../db/models/Roles').Role>;
    getTestRoleById: (id: number) => Promise<import('../db/models/Roles').Role | null>;
    getTestRoleByStub: (stub: string) => Promise<import('../db/models/Roles').Role | null>;
    getRolesForUser: (userId: number) => Promise<number[]>;
    setRolePermissions: (roleId: number, permissionStubs: string[], authContext?: AuthContextPayload) => Promise<void>;
    getRolePermissions: (roleId: number) => Promise<string[]>;
    getUserPermissions: (userId: number) => Promise<string[]>;
    getAllPermissions: () => string[];
    updateRole: (id: number, data: Partial<import('../db/models/Roles').RoleData>, authContext?: AuthContextPayload) => Promise<void>;
    updateRoleDisplayName: (id: number, displayName: string, authContext?: AuthContextPayload) => Promise<void>;
    updateRoleHiddenStatus: (id: number, isHidden: boolean, authContext?: AuthContextPayload) => Promise<void>;
    deleteRole: (id: number, authContext?: AuthContextPayload) => Promise<void>;
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
      getAll: (authContext?: AuthContextPayload) => movieService.getAll(authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      getByTmdbId: (tmdbId: string, authContext?: AuthContextPayload) => movieService.getByTmdbId(tmdbId, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      getByWatchmodeId: (watchmodeId: string, authContext?: AuthContextPayload) => movieService.getByWatchmodeId(watchmodeId, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      searchByTitle: (searchTerm: string, authContext?: AuthContextPayload) => movieService.searchByTitle(searchTerm, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined)
    },
    settings: {
      initializeMockSettings (testSettings?: Record<string, unknown>) {
        const store = createMockElectronStore(testSettings);
        settingsService.initialize(store);
      },
      get: (key: string, authContext?: AuthContextPayload) => settingsService.get(key, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      set: (key: string, value: unknown, authContext?: AuthContextPayload) => settingsService.set(key, value, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      load: (authContext?: AuthContextPayload) => settingsService.load(authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      save: (settings: Record<string, unknown>, authContext?: AuthContextPayload) => settingsService.save(settings, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined)
    },
    backgroundTasks: {
      enqueue: (taskType: string, args?: Record<string, unknown>, authContext?: AuthContextPayload) => backgroundTaskService.enqueue(taskType as any, args ?? {}, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      getState: (authContext?: AuthContextPayload) => backgroundTaskService.getState(authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      cancelActive: (authContext?: AuthContextPayload) => backgroundTaskService.cancelActive(authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined),
      removeQueued: (taskId: string, authContext?: AuthContextPayload) => backgroundTaskService.removeQueued(taskId, authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined)
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
      createTestUser: (data, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return userService.createUser(data, ctx);
      },
      authenticateTestUser: (username, password) => userService.authenticateUser(username, password),
      getTestUserById: (id) => userService.getUserById(id),
      updateTestUserProfile: (id, profileData, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return userService.updateUserProfile(id, profileData, ctx);
      },
      assignRoleToUser: async (userId, roleId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        userService.assignRoleToUser(userId, roleId, ctx);
      },
      removeRoleFromUser: async (userId, roleId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        userService.removeRoleFromUser(userId, roleId, ctx);
      }
    },
    roles: {
      createTestRole: async (name, permissionStubs, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        const roleId = roleService.createRole({ displayName: name, systemStub: null, isHidden: false }, ctx);
        if (permissionStubs.length > 0) {
          roleService.setPermissionsForRole(roleId, permissionStubs as any, ctx);
        }
        const role = roleService.getRoleById(roleId);
        if (!role) throw new Error('Failed to retrieve created role');
        return role;
      },
      getTestRoleById: (id) => Promise.resolve(roleService.getRoleById(id)),
      getTestRoleByStub: (stub) => Promise.resolve(roleService.getRoleBySystemStub(stub)),
      getRolesForUser: async (userId) => {
        return roleService.getRolesForUser(userId);
      },
      setRolePermissions: async (roleId, permissionStubs, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        roleService.setPermissionsForRole(roleId, permissionStubs as any, ctx);
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
      updateRole: async (id, data, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        roleService.updateRole(id, data, ctx);
      },
      updateRoleDisplayName: async (id, displayName, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        roleService.updateRole(id, { displayName }, ctx);
      },
      updateRoleHiddenStatus: async (id, isHidden, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        roleService.updateRole(id, { isHidden }, ctx);
      },
      deleteRole: async (id, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        roleService.deleteRole(id, ctx);
      },
      duplicateRole: async (sourceRoleId) => {
        return roleService.duplicateRole(sourceRoleId);
      },
      getUsersWithRole: (roleId) => roleService.getUsersWithRole(roleId)
    }
  };
}




