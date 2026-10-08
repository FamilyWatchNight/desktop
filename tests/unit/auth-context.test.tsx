/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { describe, expect, jest, test } from '@jest/globals';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import type { AuthSession } from '../../src/renderer/api-client';
import { AuthProvider, useAuth } from '../../src/renderer/contexts/AuthContext';

const session: AuthSession = {
  token: 'token',
  userId: 7,
  username: 'host-user',
  roles: [3],
  permissions: ['can-host'],
  createdAt: 1_000,
  expiresAt: 3_601_000,
};

function Consumer(): React.ReactElement {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="username">{auth.session?.username ?? ''}</span>
      <span data-testid="error">{auth.error instanceof Error ? auth.error.message : ''}</span>
      <button onClick={() => void auth.login('host-user', 'password').catch(() => undefined)}>
        login
      </button>
      <button onClick={() => void auth.logout().catch(() => undefined)}>logout</button>
    </div>
  );
}

function renderWithAuth(authApi: {
  login: (username: string, password: string) => Promise<AuthSession>;
  getSession: () => Promise<AuthSession>;
  logout: () => Promise<void>;
}): void {
  const apiClient = {
    auth: authApi,
  } as never;
  render(
    <AuthProvider apiClient={apiClient}>
      <Consumer />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  test('restores an existing session on startup', async () => {
    renderWithAuth({
      getSession: jest.fn(async () => session),
      login: jest.fn(),
      logout: jest.fn(),
    });

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    expect(screen.getByTestId('username')).toHaveTextContent('host-user');
  });

  test('treats a failed session restore as unauthenticated', async () => {
    renderWithAuth({
      getSession: jest.fn(async () => Promise.reject(new Error('no active session'))),
      login: jest.fn(),
      logout: jest.fn(),
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  test('updates state after a successful login', async () => {
    const login = jest.fn(async () => session);
    renderWithAuth({
      getSession: jest.fn(async () => Promise.reject(new Error('no active session'))),
      login,
      logout: jest.fn(),
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    await act(async () => screen.getByRole('button', { name: 'login' }).click());

    expect(login).toHaveBeenCalledWith('host-user', 'password');
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('host-user');
  });

  test('exposes login errors and returns to unauthenticated state', async () => {
    const login = jest.fn(async () => Promise.reject(new Error('invalid credentials')));
    renderWithAuth({
      getSession: jest.fn(async () => Promise.reject(new Error('no active session'))),
      login,
      logout: jest.fn(),
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated'));
    await act(async () => {
      screen.getByRole('button', { name: 'login' }).click();
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('error')).toHaveTextContent('invalid credentials');
  });

  test('clears the session after logout', async () => {
    const logout = jest.fn(async () => undefined);
    renderWithAuth({
      getSession: jest.fn(async () => session),
      login: jest.fn(),
      logout,
    });

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('authenticated'));
    await act(async () => screen.getByRole('button', { name: 'logout' }).click());

    expect(logout).toHaveBeenCalled();
    expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('');
  });

  test('requires the provider', () => {
    expect(() => render(<Consumer />)).toThrow('useAuth must be used within an AuthProvider');
  });
});
