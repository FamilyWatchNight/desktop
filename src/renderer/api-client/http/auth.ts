/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { AuthApi, AuthSession } from '../types';

import { callApi, setAuthToken } from './utils';

export class HttpAuthApi implements AuthApi {
  async login(username: string, password: string): Promise<AuthSession> {
    const session = (await callApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })) as AuthSession;
    setAuthToken(session.token);
    return session;
  }

  async getSession(): Promise<AuthSession> {
    return (await callApi('/api/auth/session')) as AuthSession;
  }

  async logout(): Promise<void> {
    try {
      await callApi('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  }
}
