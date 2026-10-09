/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { AddressInfo } from 'net';

import { ipcMain } from 'electron';
import express from 'express';

import { registerUserRoutes } from '../../src/main/api-server/http/users';
import { sessionManager, userService } from '../../src/main/api-server/ipc/instances';
import { registerUserIpcHandlers } from '../../src/main/api-server/ipc/users';
import {
  AuthorizationError,
  SessionError,
} from '../../src/main/auth/errors';
import { AuthSession } from '../../src/main/auth/session-manager';
import { ValidationError } from '../../src/main/security/errors';

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
  },
}));

jest.mock('electron-log/main', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../../src/main/api-server/ipc/instances', () => ({
  userService: {
    getCurrentUserDetails: jest.fn(),
    updateCurrentUserProfile: jest.fn(),
    changeCurrentUserPassword: jest.fn(),
    removeCurrentUserPassword: jest.fn(),
    saveCurrentUserProfileImage: jest.fn(),
    deleteCurrentUserProfileImage: jest.fn(),
    hasUsers: jest.fn(),
    getLoginRoster: jest.fn(),
    createFirstAdmin: jest.fn(),
  },
  sessionManager: {
    getSession: jest.fn(),
  },
  authService: {},
}));

const mockedUsers = jest.mocked(userService);
const mockedGetSession = jest.mocked(sessionManager.getSession);
const mockedIpcHandle = jest.mocked(ipcMain.handle);

const testSession: AuthSession = {
  token: 'a'.repeat(64),
  userId: 42,
  username: 'current-user',
  roles: [3],
  permissions: ['can-update-profile'],
  createdAt: 1,
  expiresAt: 3_600_001,
};

const currentDetails = {
  account: {
    id: 42,
    username: 'current-user',
    email: null,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    hasPassword: true,
  },
  profile: null,
};

describe('current-user details transport APIs', () => {
  let baseUrl: string;
  let server: ReturnType<ReturnType<typeof express>['listen']>;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    registerUserRoutes(app);
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSession.mockImplementation((token) => {
      if (token === testSession.token) return testSession;
      throw new SessionError('invalid-session', 'Invalid session');
    });
    mockedUsers.getCurrentUserDetails.mockReturnValue(currentDetails);
    mockedUsers.updateCurrentUserProfile.mockResolvedValue(undefined);
    mockedUsers.changeCurrentUserPassword.mockResolvedValue(undefined);
    mockedUsers.removeCurrentUserPassword.mockResolvedValue(undefined);
    mockedUsers.saveCurrentUserProfileImage.mockResolvedValue('profile.png');
    mockedUsers.deleteCurrentUserProfileImage.mockResolvedValue(undefined);
  });

  async function httpRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${testSession.token}`);
    }
    return fetch(`${baseUrl}${path}`, { ...options, headers });
  }

  test('HTTP profile reads require a session and pass the session user and permissions to the service', async () => {
    const unauthenticated = await fetch(`${baseUrl}/api/users/me`);
    expect(unauthenticated.status).toBe(401);

    mockedUsers.getCurrentUserDetails.mockImplementationOnce(() => {
      throw new AuthorizationError('Insufficient permissions');
    });
    const unauthorized = await httpRequest('/api/users/me');
    expect(unauthorized.status).toBe(403);

    const response = await httpRequest('/api/users/me');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        account: {
          id: testSession.userId,
          username: testSession.username,
          hasPassword: true,
        },
        profile: null,
      },
    });
    expect(mockedUsers.getCurrentUserDetails).toHaveBeenCalledWith(
      expect.objectContaining({ userId: testSession.userId, permissions: testSession.permissions }),
    );
  });

  test('HTTP profile updates reject unsupported fields and preserve authorization errors', async () => {
    const invalidResponse = await httpRequest('/api/users/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Updated', userId: 100 }),
    });
    expect(invalidResponse.status).toBe(400);
    expect(mockedUsers.updateCurrentUserProfile).not.toHaveBeenCalled();

    mockedUsers.updateCurrentUserProfile.mockRejectedValueOnce(
      new AuthorizationError('Insufficient permissions'),
    );
    const deniedResponse = await httpRequest('/api/users/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Updated' }),
    });
    expect(deniedResponse.status).toBe(403);
    await expect(deniedResponse.json()).resolves.toMatchObject({
      success: false,
      error: 'Insufficient permissions',
    });

    const successfulResponse = await httpRequest('/api/users/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Updated' }),
    });
    expect(successfulResponse.status).toBe(200);
    expect(mockedUsers.updateCurrentUserProfile).toHaveBeenCalledWith(
      { displayName: 'Updated' },
      expect.objectContaining({ userId: testSession.userId }),
    );
  });

  test('HTTP password and image operations use the current session, binary image bytes, and validation status', async () => {
    const passwordResponse = await httpRequest('/api/users/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'new-password' }),
    });
    expect(passwordResponse.status).toBe(200);
    expect(mockedUsers.changeCurrentUserPassword).toHaveBeenCalledWith(
      'new-password',
      expect.objectContaining({ userId: testSession.userId }),
    );

    mockedUsers.changeCurrentUserPassword.mockRejectedValueOnce(
      new ValidationError('Password must not be empty'),
    );
    const invalidPasswordResponse = await httpRequest('/api/users/me/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: '' }),
    });
    expect(invalidPasswordResponse.status).toBe(400);

    const removeResponse = await httpRequest('/api/users/me/password', { method: 'DELETE' });
    expect(removeResponse.status).toBe(200);
    expect(mockedUsers.removeCurrentUserPassword).toHaveBeenCalledWith(
      expect.objectContaining({ userId: testSession.userId }),
    );

    const imageBytes = Uint8Array.from([1, 2, 3, 4]);
    const imageResponse = await httpRequest('/api/users/me/profile-image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Profile-Image-Type': 'image/png',
      },
      body: new Blob([imageBytes]),
    });
    expect(imageResponse.status).toBe(200);
    expect(mockedUsers.saveCurrentUserProfileImage).toHaveBeenCalledWith(
      Buffer.from(imageBytes),
      'image/png',
      expect.objectContaining({ userId: testSession.userId }),
    );

    const oversizedImageResponse = await httpRequest('/api/users/me/profile-image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Profile-Image-Type': 'image/png',
      },
      body: new Blob([new Uint8Array(5 * 1024 * 1024 + 1)]),
    });
    expect(oversizedImageResponse.status).toBe(413);
    expect(mockedUsers.saveCurrentUserProfileImage).toHaveBeenCalledTimes(1);

    const deleteImageResponse = await httpRequest('/api/users/me/profile-image', {
      method: 'DELETE',
    });
    expect(deleteImageResponse.status).toBe(200);
    expect(mockedUsers.deleteCurrentUserProfileImage).toHaveBeenCalledWith(
      expect.objectContaining({ userId: testSession.userId }),
    );
  });

  test('IPC profile operations resolve the current user from the session token, not a caller-provided ID', async () => {
    registerUserIpcHandlers();
    const registered = new Map<string, (...args: unknown[]) => unknown>();
    for (const [channel, handler] of mockedIpcHandle.mock.calls) {
      registered.set(channel, handler as (...args: unknown[]) => unknown);
    }

    const invoke = (channel: string, ...args: unknown[]) => {
      const handler = registered.get(channel);
      if (!handler) throw new Error(`No IPC handler registered for ${channel}`);
      return handler({}, ...args);
    };

    expect(invoke('users-current-details', testSession.token)).toBe(currentDetails);
    await invoke('users-update-current-profile', testSession.token, { displayName: 'Updated' });
    await invoke('users-change-current-password', testSession.token, 'new-password');
    await invoke('users-remove-current-password', testSession.token);
    const imageBytes = Uint8Array.from([9, 8, 7]);
    await invoke('users-save-current-profile-image', testSession.token, imageBytes, 'image/jpeg');
    await invoke('users-delete-current-profile-image', testSession.token);

    expect(mockedUsers.updateCurrentUserProfile).toHaveBeenCalledWith(
      { displayName: 'Updated' },
      expect.objectContaining({ userId: testSession.userId }),
    );
    expect(mockedUsers.changeCurrentUserPassword).toHaveBeenCalledWith(
      'new-password',
      expect.objectContaining({ userId: testSession.userId }),
    );
    expect(mockedUsers.saveCurrentUserProfileImage).toHaveBeenCalledWith(
      Buffer.from(imageBytes),
      'image/jpeg',
      expect.objectContaining({ userId: testSession.userId }),
    );
  });
});
