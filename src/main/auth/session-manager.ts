/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { randomBytes } from 'crypto';

import i18n from '../i18n';
import type { AuthenticatedUser, UserService } from '../services/UserService';

import { createAuthContext } from './auth-context';
import { SessionError } from './errors';
import type { PermissionStub } from './permissions';

export const SESSION_TTL_MS = 60 * 60 * 1000;
export const DEFAULT_MAX_SESSIONS = 1_000;
export const DEFAULT_MAX_SESSIONS_PER_USER = 200;

export interface SessionManagerOptions {
  maxSessions?: number;
  maxSessionsPerUser?: number;
}

export interface SessionUser {
  userId: number;
  username: string;
  roles: number[];
  permissions: PermissionStub[];
}

export interface AuthSession extends SessionUser {
  token: string;
  createdAt: number;
  expiresAt: number;
}

interface SessionRecord {
  userId: number;
  createdAt: number;
  expiresAt: number;
}

/**
 * Owns authenticated session lifetime independently of HTTP and IPC.
 * Permission data is deliberately refreshed from UserService for every lookup.
 */
export class SessionManager {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly t = i18n.getFixedT(null, 'auth');

  constructor(
    private readonly userService: UserService,
    private readonly now: () => number = Date.now,
    options: SessionManagerOptions = {},
  ) {
    this.maxSessions = options.maxSessions ?? DEFAULT_MAX_SESSIONS;
    this.maxSessionsPerUser = options.maxSessionsPerUser ?? DEFAULT_MAX_SESSIONS_PER_USER;

    if (!Number.isSafeInteger(this.maxSessions) || this.maxSessions < 1) {
      throw new RangeError('maxSessions must be a positive safe integer');
    }
    if (!Number.isSafeInteger(this.maxSessionsPerUser) || this.maxSessionsPerUser < 1) {
      throw new RangeError('maxSessionsPerUser must be a positive safe integer');
    }
  }

  private readonly maxSessions: number;
  private readonly maxSessionsPerUser: number;

  async createSession(user: AuthenticatedUser): Promise<AuthSession> {
    const createdAt = this.now();
    const token = randomBytes(32).toString('hex');
    const record: SessionRecord = {
      userId: user.id,
      createdAt,
      expiresAt: createdAt + SESSION_TTL_MS,
    };

    this.removeExpiredSessions(createdAt);

    if (this.sessions.size >= this.maxSessions) {
      throw new SessionError('session-limit', this.t('errors.sessionLimitReached'));
    }

    const sessionsForUser = Array.from(this.sessions.values()).filter(
      (session) => session.userId === user.id,
    ).length;
    if (sessionsForUser >= this.maxSessionsPerUser) {
      throw new SessionError('session-limit', this.t('errors.sessionLimitReached'));
    }

    const session = this.buildSession(token, record);
    this.sessions.set(token, record);
    return session;
  }

  getSession(token: string): AuthSession {
    const record = this.getRecord(token);
    const timestamp = this.now();

    if (record.expiresAt <= timestamp) {
      this.sessions.delete(token);
      throw new SessionError('session-expired', this.t('errors.sessionExpired'));
    }

    this.removeExpiredSessions(timestamp);
    return this.buildSession(token, record);
  }

  destroySession(token: string): void {
    this.sessions.delete(token);
  }

  clear(): void {
    this.sessions.clear();
  }

  private removeExpiredSessions(timestamp: number): void {
    for (const [token, session] of this.sessions) {
      if (session.expiresAt <= timestamp) {
        this.sessions.delete(token);
      }
    }
  }

  private getRecord(token: string): SessionRecord {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      throw new SessionError('invalid-session', this.t('errors.invalidSession'));
    }

    const record = this.sessions.get(token);
    if (!record) {
      throw new SessionError('invalid-session', this.t('errors.invalidSession'));
    }

    return record;
  }

  private buildSession(token: string, record: SessionRecord): AuthSession {
    const authContext = createAuthContext(record.userId, []);
    const user = this.userService.getUserById(record.userId, authContext);

    if (!user || !('id' in user)) {
      this.sessions.delete(token);
      throw new SessionError('invalid-session', this.t('errors.invalidSession'));
    }

    const roles = this.userService.getRolesForUser(record.userId, authContext);
    const permissions = this.userService
      .getUserPermissions(record.userId, authContext)
      .map((permission) => permission.stub);

    return {
      token,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      userId: user.id,
      username: user.username,
      roles,
      permissions,
    };
  }
}
