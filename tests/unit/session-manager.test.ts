/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { describe, expect, jest, test } from '@jest/globals';

import { SessionError } from '../../src/main/auth/errors';
import { SESSION_TTL_MS, SessionManager } from '../../src/main/auth/session-manager';
import type { AuthenticatedUser, UserService } from '../../src/main/services/UserService';

function thrownBy(action: () => void): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  throw new Error('Expected action to throw');
}

function createUser(): AuthenticatedUser {
  return {
    id: 7,
    username: 'host-user',
    email: null,
    lastLoginAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    profile: null,
  };
}

describe('SessionManager', () => {
  test('creates a session with an opaque token and session metadata', async () => {
    const user = createUser();
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => [3]),
      getUserPermissions: jest.fn(() => [
        { stub: 'can-host', displayName: 'Can Host Watch Night' },
      ]),
    } as unknown as UserService;
    const manager = new SessionManager(userService);

    const session = await manager.createSession(user);

    expect(session.token).toMatch(/^[a-f0-9]{64}$/);
    expect(session.userId).toBe(user.id);
    expect(session.username).toBe(user.username);
    expect(session.roles).toEqual([3]);
    expect(session.permissions).toEqual(['can-host']);
    expect(session.expiresAt - session.createdAt).toBe(SESSION_TTL_MS);
  });

  test('refreshes roles and permissions for every session lookup', async () => {
    const user = createUser();
    let permissions: Array<{ stub: 'can-host' | 'can-admin'; displayName: string }> = [
      { stub: 'can-host', displayName: 'Can Host Watch Night' },
    ];
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => [3]),
      getUserPermissions: jest.fn(() => permissions),
    } as unknown as UserService;
    const manager = new SessionManager(userService);
    const session = await manager.createSession(user);

    permissions = [{ stub: 'can-admin', displayName: 'Can Administrate Application' }];
    const refreshed = manager.getSession(session.token);

    expect(refreshed.permissions).toEqual(['can-admin']);
    expect(userService.getUserPermissions).toHaveBeenCalledTimes(2);
  });

  test('rejects invalid, unknown, and expired sessions', async () => {
    let now = 1_000;
    const user = createUser();
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => []),
      getUserPermissions: jest.fn(() => []),
    } as unknown as UserService;
    const manager = new SessionManager(userService, () => now);
    const session = await manager.createSession(user);

    expect(() => manager.getSession('invalid-token')).toThrow(SessionError);
    expect(() => manager.getSession('a'.repeat(64))).toThrow(SessionError);

    now += SESSION_TTL_MS;
    expect(thrownBy(() => manager.getSession(session.token))).toMatchObject({
      name: 'SessionError',
      code: 'session-expired',
    });
  });

  test('destroying a session makes its token invalid and is idempotent', async () => {
    const user = createUser();
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => []),
      getUserPermissions: jest.fn(() => []),
    } as unknown as UserService;
    const manager = new SessionManager(userService);
    const session = await manager.createSession(user);

    // Do once to make sure that's enough to invalidate the session
    manager.destroySession(session.token);
    expect(() => manager.getSession(session.token)).toThrow(SessionError);

    // Do again for idempotency
    manager.destroySession(session.token);
    expect(() => manager.getSession(session.token)).toThrow(SessionError);
  });

  test('invalidates a session when its user no longer exists', async () => {
    let user: AuthenticatedUser | null = createUser();
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => []),
      getUserPermissions: jest.fn(() => []),
    } as unknown as UserService;
    const manager = new SessionManager(userService);
    const session = await manager.createSession(user);

    user = null; // Simulate user deletion

    expect(thrownBy(() => manager.getSession(session.token))).toMatchObject({
      name: 'SessionError',
      code: 'invalid-session',
    });
  });

  test('rejects new sessions when the global capacity is reached', async () => {
    const user = createUser();
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => []),
      getUserPermissions: jest.fn(() => []),
    } as unknown as UserService;
    const manager = new SessionManager(userService, Date.now, {
      maxSessions: 1,
      maxSessionsPerUser: 5,
    });

    // Create a session to reach the global capacity
    await manager.createSession(user);

    // Attempt to create another session should fail due to global capacity limit
    await expect(manager.createSession(user)).rejects.toMatchObject({
      name: 'SessionError',
      code: 'session-limit',
    });
  });

  test('rejects new sessions when a user reaches their per-user capacity', async () => {
    const user = createUser();
    const userService = {
      getUserById: jest.fn(() => user),
      getRolesForUser: jest.fn(() => []),
      getUserPermissions: jest.fn(() => []),
    } as unknown as UserService;
    const manager = new SessionManager(userService, Date.now, {
      maxSessions: 5,
      maxSessionsPerUser: 1,
    });

    // Create a session to reach the per-user capacity
    await manager.createSession(user);

    // Attempt to create another session for the same user should fail due to per-user capacity limit
    await expect(manager.createSession(user)).rejects.toMatchObject({
      name: 'SessionError',
      code: 'session-limit',
    });
  });

  test('removes expired sessions before applying capacity limits', async () => {
    let now = 1_000;
    const firstUser = createUser();
    const secondUser = { ...firstUser, id: 8, username: 'second-user' };
    const userService = {
      getUserById: jest.fn((id: number) => (id === firstUser.id ? firstUser : secondUser)),
      getRolesForUser: jest.fn(() => []),
      getUserPermissions: jest.fn(() => []),
    } as unknown as UserService;
    const manager = new SessionManager(userService, () => now, {
      maxSessions: 1,
      maxSessionsPerUser: 1,
    });

    // Create a session for the first user to reach the global capacity
    await manager.createSession(firstUser);
    // Advance time to expire the first user's session
    now += SESSION_TTL_MS;

    // Attempt to create a session for the second user should succeed because the first user's session has expired
    await expect(manager.createSession(secondUser)).resolves.toMatchObject({
      userId: secondUser.id,
    });
  });
});
