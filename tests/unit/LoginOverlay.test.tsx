/* @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { ApiClient, AuthSession, LoginRosterUser } from '../../src/renderer/api-client';
import LoginOverlay, {
  getAvatarColorVariable,
  getAvatarInitial,
} from '../../src/renderer/components/LoginOverlay';
import { AuthProvider } from '../../src/renderer/contexts/AuthContext';

jest.mock('../../src/renderer/styles/components/LoginOverlay.scss', () => ({}));

const session: AuthSession = {
  token: 'token',
  userId: 1,
  username: 'admin',
  roles: [1],
  permissions: ['can-admin'],
  createdAt: 1,
  expiresAt: 2,
};

function createApiClient(users: LoginRosterUser[]): ApiClient {
  return {
    auth: {
      getSession: jest.fn(async () => Promise.reject(new Error('not logged in'))),
      login: jest.fn(async () => session),
      logout: jest.fn(async () => undefined),
    },
    users: {
      hasUsers: jest.fn(async () => true),
      getLoginRoster: jest.fn(async () => users),
      createFirstAdmin: jest.fn(),
    },
  } as unknown as ApiClient;
}

function renderOverlay(
  users: LoginRosterUser[],
  login: (username: string, password: string) => Promise<AuthSession> = jest.fn(
    async () => session,
  ),
): void {
  const apiClient = createApiClient(users);
  apiClient.auth.login = login;
  render(
    <AuthProvider apiClient={apiClient}>
      <LoginOverlay apiClient={apiClient} />
    </AuthProvider>,
  );
}

async function completeSelectionAnimation(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
  act(() => {
    fireEvent.transitionEnd(screen.getByTestId('login-selection-ghost'));
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('LoginOverlay', () => {
  test('renders display names and falls back to usernames', async () => {
    renderOverlay([
      { id: 1, username: 'admin', hasPassword: true, profile: { displayName: 'Admin' } },
      { id: 2, username: 'host', hasPassword: false, profile: null },
    ]);

    await waitFor(() => expect(screen.getByTestId('login-user-grid')).toBeInTheDocument());
    expect(screen.getByTestId('login-user-1')).toHaveTextContent('Admin');
    expect(screen.getByTestId('login-user-2')).toHaveTextContent('host');
  });

  test('uses deterministic initial avatar content and color', async () => {
    renderOverlay([{ id: 12, username: 'alice', hasPassword: true, profile: null }]);

    await waitFor(() => expect(screen.getByTestId('login-selected-chip')).toBeInTheDocument());
    expect(screen.getByTestId('login-selected-chip')).toHaveTextContent('A');
    expect(getAvatarInitial(' alice ')).toBe('A');
    expect(getAvatarColorVariable(12)).toBe('--core-red');
  });

  test('auto-selects the only passworded user without requiring a click', async () => {
    renderOverlay([{ id: 1, username: 'admin', hasPassword: true, profile: null }]);

    await waitFor(() => expect(screen.getByTestId('login-selected-chip')).toBeInTheDocument());
    await completeSelectionAnimation();
    expect(screen.getByTestId('login-password-input')).toBeInTheDocument();
    expect(screen.queryByTestId('login-cancel-button')).not.toBeInTheDocument();
    expect(screen.queryByText('login.title')).not.toBeInTheDocument();
    expect(screen.queryByText('login.description')).not.toBeInTheDocument();
  });

  test('shows the profile selection labels when multiple accounts are available', async () => {
    renderOverlay([
      { id: 1, username: 'admin', hasPassword: true, profile: null },
      { id: 2, username: 'host', hasPassword: true, profile: null },
    ]);

    fireEvent.click(await waitFor(() => screen.getByTestId('login-user-1')));
    await completeSelectionAnimation();

    expect(screen.getByTestId('login-cancel-button')).toBeInTheDocument();
    expect(screen.getByText('login.title')).toBeInTheDocument();
    expect(screen.getByText('login.description')).toBeInTheDocument();
  });

  test('logs in passwordless users immediately when selected from a roster', async () => {
    const login = jest.fn(async () => session);
    renderOverlay(
      [
        { id: 1, username: 'admin', hasPassword: true, profile: null },
        { id: 2, username: 'host', hasPassword: false, profile: null },
      ],
      login,
    );

    fireEvent.click(await waitFor(() => screen.getByTestId('login-user-2')));

    await waitFor(() => expect(login).toHaveBeenCalledWith('host', ''));
  });

  test('auto-logs in the only passwordless user without showing the roster', async () => {
    const login = jest.fn(async () => session);
    renderOverlay([{ id: 2, username: 'host', hasPassword: false, profile: null }], login);

    await waitFor(() => expect(login).toHaveBeenCalledWith('host', ''));
    expect(screen.queryByRole('button', { name: /host/i })).not.toBeInTheDocument();
  });

  test('submits a password and leaves the translated error visible when login fails', async () => {
    const login = jest.fn(async () =>
      Promise.reject(
        new Error(
          "Error invoking remote method 'auth-login': AuthenticationError: ___Invalid username or password___",
        ),
      ),
    );
    renderOverlay([{ id: 1, username: 'admin', hasPassword: true, profile: null }], login);

    fireEvent.click(await waitFor(() => screen.getByTestId('login-user-1')));
    await completeSelectionAnimation();
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: { value: 'wrong' },
    });
    fireEvent.submit(screen.getByTestId('login-password-form'));

    await waitFor(() => expect(login).toHaveBeenCalledWith('admin', 'wrong'));
    const errorMessage = await screen.findByTestId('login-error-message');
    expect(errorMessage).toHaveTextContent('___Invalid username or password___');
    expect(errorMessage).not.toHaveTextContent("Error invoking remote method 'auth-login'");
    expect(errorMessage).toBeInTheDocument();
    expect(screen.getByTestId('login-password-form')).toContainElement(errorMessage);
    expect(screen.getByTestId('login-selected-chip')).not.toContainElement(errorMessage);
    expect(screen.queryByTestId('login-cancel-button')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByTestId('login-password-input'));
  });

  test('submits the password when Enter is pressed in the password field', async () => {
    const login = jest.fn(async () => session);
    renderOverlay([{ id: 1, username: 'admin', hasPassword: true, profile: null }], login);

    fireEvent.click(await waitFor(() => screen.getByTestId('login-user-1')));
    await completeSelectionAnimation();
    fireEvent.change(screen.getByTestId('login-password-input'), {
      target: { value: 'password' },
    });
    fireEvent.keyDown(screen.getByTestId('login-password-input'), { key: 'Enter' });

    await waitFor(() => expect(login).toHaveBeenCalledWith('admin', 'password'));
  });
});
