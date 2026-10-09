/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { describe, expect, jest, test } from '@jest/globals';

import { AuthenticationError } from '../../src/main/auth/errors';
import { LoginRateLimiter } from '../../src/main/auth/login-rate-limiter';
import { SessionManager } from '../../src/main/auth/session-manager';
import { AuthService } from '../../src/main/services/AuthService';
import type { AuthenticatedUser, UserService } from '../../src/main/services/UserService';

function createUser(): AuthenticatedUser {
  return {
    account: {
      id: 7,
      username: 'host-user',
      email: null,
      hasPassword: true,
      lastLoginAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    profile: null,
  };
}

describe('AuthService', () => {
  test('validates credentials, authenticates the user, and creates a session', async () => {
    const user = createUser();
    const session = { token: 'token' };
    const userService = {
      authenticateUser: jest.fn(async () => user),
    } as unknown as UserService;
    const sessionManager = {
      createSession: jest.fn(async () => session),
    } as unknown as SessionManager;
    const limiter = { allow: jest.fn(() => true) } as unknown as LoginRateLimiter;
    const service = new AuthService(userService, sessionManager, limiter);

    await expect(service.login('host-user', 'password', 'client-a')).resolves.toBe(session);
    expect(limiter.allow).toHaveBeenCalledWith('client-a');
    expect(userService.authenticateUser).toHaveBeenCalledWith('host-user', 'password');
    expect(sessionManager.createSession).toHaveBeenCalledWith(user);
  });

  test('rejects malformed credentials before rate limiting or authentication', async () => {
    const userService = {
      authenticateUser: jest.fn(),
    } as unknown as UserService;
    const sessionManager = {} as SessionManager;
    const limiter = { allow: jest.fn() } as unknown as LoginRateLimiter;
    const service = new AuthService(userService, sessionManager, limiter);

    await expect(service.login(undefined, 'password', 'client-a')).rejects.toBeInstanceOf(
      AuthenticationError,
    );
    expect(limiter.allow).not.toHaveBeenCalled();
    expect(userService.authenticateUser).not.toHaveBeenCalled();
  });

  test('rejects rate-limited login attempts', async () => {
    const userService = {
      authenticateUser: jest.fn(),
    } as unknown as UserService;
    const sessionManager = {} as SessionManager;
    const limiter = { allow: jest.fn(() => false) } as unknown as LoginRateLimiter;
    const service = new AuthService(userService, sessionManager, limiter);

    await expect(service.login('host-user', 'password', 'client-a')).rejects.toBeInstanceOf(
      AuthenticationError,
    );
    expect(userService.authenticateUser).not.toHaveBeenCalled();
  });

  test('maps unknown users to an authentication error', async () => {
    const userService = {
      authenticateUser: jest.fn(async () => null),
    } as unknown as UserService;
    const sessionManager = {} as SessionManager;
    const limiter = { allow: jest.fn(() => true) } as unknown as LoginRateLimiter;
    const service = new AuthService(userService, sessionManager, limiter);

    await expect(service.login('unknown', 'password', 'client-a')).rejects.toBeInstanceOf(
      AuthenticationError,
    );
  });

  test('delegates session lookup and logout', () => {
    const session = { token: 'token' };
    const sessionManager = {
      getSession: jest.fn(() => session),
      destroySession: jest.fn(),
    } as unknown as SessionManager;
    const service = new AuthService({} as UserService, sessionManager, {} as LoginRateLimiter);

    expect(service.getSession('token')).toBe(session);
    service.logout('token');

    expect(sessionManager.getSession).toHaveBeenCalledWith('token');
    expect(sessionManager.destroySession).toHaveBeenCalledWith('token');
  });
});
