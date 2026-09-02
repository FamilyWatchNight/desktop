/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { createContext, useContext, useEffect, useState } from 'react';

import { createApiClient } from '../api-client';
import type { ApiClient, AuthSession } from '../api-client';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  error: unknown;
  login(username: string, password: string): Promise<AuthSession>;
  logout(): Promise<void>;
  clearError(): void;
}

const AuthContext = createContext<AuthState | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  apiClient?: ApiClient;
}

export function AuthProvider({ children, apiClient }: AuthProviderProps): React.ReactElement {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    const client = apiClient ?? createApiClient();

    void client.auth
      .getSession()
      .then((restoredSession) => {
        if (!active) return;
        setSession(restoredSession);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setError(null);
        setStatus('unauthenticated');
      });

    return () => {
      active = false;
    };
  }, [apiClient]);

  const login = async (username: string, password: string): Promise<AuthSession> => {
    setStatus('loading');
    setError(null);

    try {
      const authenticatedSession = await (apiClient ?? createApiClient()).auth.login(
        username,
        password,
      );
      setSession(authenticatedSession);
      setStatus('authenticated');
      return authenticatedSession;
    } catch (loginError) {
      setSession(null);
      setError(loginError);
      setStatus('error');
      throw loginError;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await (apiClient ?? createApiClient()).auth.logout();
      setSession(null);
      setError(null);
      setStatus('unauthenticated');
    } catch (logoutError) {
      setSession(null);
      setError(logoutError);
      setStatus('error');
      throw logoutError;
    }
  };

  const clearError = (): void => {
    setError(null);
    setStatus(session ? 'authenticated' : 'unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ status, session, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
