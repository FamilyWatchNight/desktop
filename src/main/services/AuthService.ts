/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { AuthenticationError } from '../auth/errors';
import { LoginRateLimiter } from '../auth/login-rate-limiter';
import { SessionManager } from '../auth/session-manager';
import type { AuthSession } from '../auth/session-manager';
import i18n from '../i18n';

import type { UserService } from './UserService';

const MAX_CREDENTIAL_LENGTH = 256;

export class AuthService {
  private readonly t = i18n.getFixedT(null, 'auth');

  constructor(
    private readonly userService: UserService,
    private readonly sessionManager: SessionManager,
    private readonly loginRateLimiter: LoginRateLimiter,
  ) {}

  async login(username: unknown, password: unknown, clientKey: string): Promise<AuthSession> {
    if (!this.isCredential(username) || !this.isCredential(password)) {
      throw new AuthenticationError(this.t('errors.invalidCredentials'));
    }
    if (!this.loginRateLimiter.allow(clientKey)) {
      throw new AuthenticationError(this.t('errors.loginRateLimited'));
    }

    const user = await this.userService.authenticateUser(username, password);
    if (!user) {
      throw new AuthenticationError(this.t('errors.invalidCredentials'));
    }

    return this.sessionManager.createSession(user);
  }

  getSession(token: unknown): AuthSession {
    return this.sessionManager.getSession(typeof token === 'string' ? token : '');
  }

  logout(token: unknown): void {
    if (typeof token === 'string') {
      this.sessionManager.destroySession(token);
    }
  }

  private isCredential(value: unknown): value is string {
    return typeof value === 'string' && value.length <= MAX_CREDENTIAL_LENGTH;
  }
}
