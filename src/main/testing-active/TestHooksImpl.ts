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
import { executeServiceMethod } from '../utils/error-serialization';

const movieService = new MovieService();
const settingsService = new SettingsService();
const backgroundTaskService = new BackgroundTaskService();
const userService = new UserService();
const roleService = new RoleService();

// Track the actively running mock task instance for test control
let activeTestTask: InstanceType<typeof MockBackgroundTask> | null = null;

/**
 * Deserialize a buffer that was JSON-serialized across the Electron boundary.
 * When buffers cross app.evaluate(), they're converted to Uint8Array and then to object form.
 */
function deserializeBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) {
    return value;
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, any>;
    // Handle standard { type: 'Buffer', data: [...] } format
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return Buffer.from(obj.data);
    }
    // Handle Uint8Array serialized as object with numeric string keys: { "0": 137, "1": 80, ... }
    // Convert the object's values back to an array
    const keys = Object.keys(obj);
    if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
      const bytes = keys.map((k) => obj[k]);
      return Buffer.from(bytes);
    }
  }
  throw new TypeError(`Expected a Buffer, Uint8Array, or serialized Buffer object, got: ${typeof value}`);
}

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
    getById: (id: number, authContext?: AuthContextPayload) => Promise<import('../db/models/Movies').Movie | null>;
    getByTmdbId: (tmdbId: string, authContext?: AuthContextPayload) => Promise<import('../db/models/Movies').Movie | null>;
    getByWatchmodeId: (watchmodeId: string, authContext?: AuthContextPayload) => Promise<import('../db/models/Movies').Movie | null>;
    searchByTitle: (searchTerm: string, authContext?: AuthContextPayload) => Promise<import('../db/models/Movies').Movie[]>;
  };
  settings: {
    initializeMockSettings: (testSettings?: Record<string, unknown>) => Promise<void>;
    get: (key: string, authContext?: AuthContextPayload) => Promise<unknown>;
    set: (key: string, value: unknown, authContext?: AuthContextPayload) => Promise<void>;
    load: (authContext?: AuthContextPayload) => Promise<Record<string, unknown>>;
    save: (settings: Record<string, unknown>, authContext?: AuthContextPayload) => Promise<void>;
  };
  backgroundTasks: {
    enqueue: (taskType: string, args?: Record<string, unknown>, authContext?: AuthContextPayload) => Promise<unknown>;
    getState: (authContext?: AuthContextPayload) => Promise<{ active: unknown; queue: unknown[] }>;
    cancelActive: (authContext?: AuthContextPayload) => Promise<unknown>;
    removeQueued: (taskId: string, authContext?: AuthContextPayload) => Promise<unknown>;
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
    authenticateTestUser: (username: string, password: string, authContext?: AuthContextPayload) => Promise<import('../services/UserService').AuthenticatedUser | null>;
    getTestUserById: (id: number, authContext?: AuthContextPayload) => Promise<import('../services/UserService').AuthenticatedUser | import('../services/UserService').BasicUserInfo | null>;
    getUsersWithPermissions: (permissions: string[], authContext?: AuthContextPayload) => Promise<import('../services/UserService').BasicUserInfo[]>;
    updateTestUserProfile: (id: number, profileData: { displayName?: string | null; profileImagePath?: string | null }, authContext?: AuthContextPayload) => Promise<void>;
    saveProfileImage: (userId: number, imageBuffer: Buffer, mimeType: string, authContext?: AuthContextPayload) => Promise<string>;
    deleteProfileImage: (userId: number, authContext?: AuthContextPayload) => Promise<void>;
    changePassword: (userId: number, newPassword: string, authContext?: AuthContextPayload) => Promise<void>;
    assignRoleToUser: (userId: number, roleId: number, authContext?: AuthContextPayload) => Promise<void>;
    removeRoleFromUser: (userId: number, roleId: number, authContext?: AuthContextPayload) => Promise<void>;
    getRolesForUser: (userId: number, authContext?: AuthContextPayload) => Promise<number[]>;
    getUserPermissions: (userId: number, authContext?: AuthContextPayload) => Promise<string[]>;
  };
  roles: {
    createTestRole: (name: string, permissionStubs: string[], authContext?: AuthContextPayload) => Promise<import('../db/models/Roles').Role>;
    getTestRoleById: (id: number, authContext?: AuthContextPayload) => Promise<import('../db/models/Roles').Role | null>;
    getTestRoleByStub: (stub: string, authContext?: AuthContextPayload) => Promise<import('../db/models/Roles').Role | null>;
    getAllRoles: (authContext?: AuthContextPayload) => Promise<import('../db/models/Roles').Role[]>;
    setRolePermissions: (roleId: number, permissionStubs: string[], authContext?: AuthContextPayload) => Promise<void>;
    getRolePermissions: (roleId: number, authContext?: AuthContextPayload) => Promise<string[]>;
    getAllPermissions: (authContext?: AuthContextPayload) => Promise<string[]>;
    updateRole: (id: number, data: Partial<import('../db/models/Roles').RoleData>, authContext?: AuthContextPayload) => Promise<void>;
    updateRoleDisplayName: (id: number, displayName: string, authContext?: AuthContextPayload) => Promise<void>;
    updateRoleHiddenStatus: (id: number, isHidden: boolean, authContext?: AuthContextPayload) => Promise<void>;
    deleteRole: (id: number, authContext?: AuthContextPayload) => Promise<void>;
    duplicateRole: (sourceRoleId: number, authContext?: AuthContextPayload) => Promise<number>;
    getUsersWithRole: (roleId: number, authContext?: AuthContextPayload) => number[];
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
      getById: async (id: number, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(movieService.getById(id, ctx)));
      },
      getByTmdbId: async (tmdbId: string, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(movieService.getByTmdbId(tmdbId, ctx)));
      },
      getByWatchmodeId: async (watchmodeId: string, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(movieService.getByWatchmodeId(watchmodeId, ctx)));
      },
      searchByTitle: async (searchTerm: string, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(movieService.searchByTitle(searchTerm, ctx)));
      }
    },
    settings: {
      initializeMockSettings: async (testSettings?: Record<string, unknown>) => {
        const store = createMockElectronStore(testSettings);
        return settingsService.initialize(store);
      },
      get: async (key: string, authContext?: AuthContextPayload | undefined) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(settingsService.get(key, ctx)));
      },
      set: async (key: string, value: unknown, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(settingsService.set(key, value, ctx)));
      },
      load: async (authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(settingsService.load(ctx)));
      },
      save: async (settings: Record<string, unknown>, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(settingsService.save(settings, ctx)));
      }
    },
    backgroundTasks: {
      enqueue: async (taskType: string, args?: Record<string, unknown>, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(backgroundTaskService.enqueue(taskType as any, args ?? {}, ctx)));
      },
      getState: async (authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(backgroundTaskService.getState(ctx)));
      },
      cancelActive: async (authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(backgroundTaskService.cancelActive(ctx)));
      },
      removeQueued: async (taskId: string, authContext?: AuthContextPayload) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(backgroundTaskService.removeQueued(taskId, ctx)));
      }
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
      createTestUser: async (data, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => userService.createUser(data, ctx));
      },
      authenticateTestUser: async (username, password, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => userService.authenticateUser(username, password, ctx));
      },
      getTestUserById: async (id, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(userService.getUserById(id, ctx)));
      },
      getUsersWithPermissions: async (permissions, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(userService.getUsersWithPermissions(permissions as any, ctx)));
      },
      updateTestUserProfile: async (id, profileData, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => userService.updateUserProfile(id, profileData, ctx));
      },
      saveProfileImage: async (userId, imageBuffer, mimeType, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        const deserializedBuffer = deserializeBuffer(imageBuffer);
        return executeServiceMethod(() => userService.saveProfileImage(userId, deserializedBuffer, mimeType, ctx));
      },
      deleteProfileImage: async (userId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => userService.deleteProfileImage(userId, ctx));
      },
      changePassword: async (userId, newPassword, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => userService.changePassword(userId, newPassword, ctx));
      },
      assignRoleToUser: async (userId, roleId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(userService.assignRoleToUser(userId, roleId, ctx)));
      },
      removeRoleFromUser: async (userId, roleId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(userService.removeRoleFromUser(userId, roleId, ctx)));
      },
      getRolesForUser: async (userId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(userService.getRolesForUser(userId, ctx)));
      },
      getUserPermissions: async (userId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        const permissions = await executeServiceMethod(() => Promise.resolve(userService.getUserPermissions(userId, ctx)));
        return permissions.map(p => p.stub);
      }
    },
    roles: {
      createTestRole: async (name, permissionStubs, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        const roleId = await executeServiceMethod(() => Promise.resolve(roleService.createRole({ displayName: name, systemStub: null, isHidden: false }, ctx)));
        if (permissionStubs.length > 0) {
          await executeServiceMethod(() => Promise.resolve(roleService.setPermissionsForRole(roleId, permissionStubs as any, ctx)));
        }
        const role = await executeServiceMethod(() => Promise.resolve(roleService.getRoleById(roleId, ctx)));
        if (!role) throw new Error('Failed to retrieve created role');
        return role;
      },
      getTestRoleById: (id, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.getRoleById(id, ctx)));
      },
      getTestRoleByStub: (stub, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.getRoleBySystemStub(stub, ctx)));
      },
      getAllRoles: (authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.getAllRoles(ctx)));
      },
      setRolePermissions: async (roleId, permissionStubs, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.setPermissionsForRole(roleId, permissionStubs as any, ctx)));
      },
      getRolePermissions: async (roleId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        const permissions = await executeServiceMethod(() => Promise.resolve(roleService.getPermissionsForRole(roleId, ctx)));
        return permissions.map(p => p.stub);
      },
      getAllPermissions: async (authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        const permissions = await executeServiceMethod(() => Promise.resolve(roleService.getAllPermissions(ctx)));
        return permissions.map(p => p.stub);
      },
      updateRole: async (id, data, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.updateRole(id, data, ctx)));
      },
      updateRoleDisplayName: async (id, displayName, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.updateRole(id, { displayName }, ctx)));
      },
      updateRoleHiddenStatus: async (id, isHidden, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.updateRole(id, { isHidden }, ctx)));
      },
      deleteRole: async (id, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.deleteRole(id, ctx)));
      },
      duplicateRole: async (sourceRoleId, authContext) => {
        const ctx = authContext ? createAuthContext(authContext.userId, authContext.permissions) : undefined;
        return executeServiceMethod(() => Promise.resolve(roleService.duplicateRole(sourceRoleId, ctx)));
      },
      getUsersWithRole: (roleId) => {
        // This is used only for testing. This isn't something the service layer exposes.
        const models = db.getModels();
        return models.userRoles.getUsersByRoleId(roleId);
      }
    }
  };
}




