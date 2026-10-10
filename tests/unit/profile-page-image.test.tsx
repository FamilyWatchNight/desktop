/* @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License,
version 3.
*/

import { afterEach, expect, jest, test } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';

import type { ApiClient, AuthSession } from '../../src/renderer/api-client';
import ProfilePage from '../../src/renderer/components/pages/ProfilePage';
import { AuthProvider } from '../../src/renderer/contexts/AuthContext';

const session: AuthSession = {
  token: 'profile-test-token',
  userId: 1,
  username: 'profile-user',
  roles: [],
  permissions: ['can-update-profile'],
  createdAt: 1,
  expiresAt: 2,
};

function renderProfilePage(): void {
  const apiClient = {
    auth: {
      getSession: jest.fn(async () => session),
      login: jest.fn(async () => session),
      logout: jest.fn(async () => undefined),
    },
  } as unknown as ApiClient;

  render(
    <AuthProvider apiClient={apiClient}>
      <ProfilePage />
    </AuthProvider>,
  );
}

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, 'fetch');

afterEach(() => {
  jest.restoreAllMocks();
  if (originalCreateObjectURL) {
    Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
  } else {
    Reflect.deleteProperty(URL, 'createObjectURL');
  }
  if (originalRevokeObjectURL) {
    Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
  } else {
    Reflect.deleteProperty(URL, 'revokeObjectURL');
  }
  if (originalFetch) {
    Object.defineProperty(globalThis, 'fetch', originalFetch);
  } else {
    Reflect.deleteProperty(globalThis, 'fetch');
  }
});

test('renders saved profile images using a validated raster Blob URL', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          account: { username: 'profile-user', hasPassword: true },
          profile: null,
        },
      }),
    })
    .mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { mimeType: 'image/png', data: 'iVBORw0KGgo=' },
      }),
    });
  Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });

  const createObjectURL = jest.fn(() => 'blob:profile-image');
  const revokeObjectURL = jest.fn();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

  renderProfilePage();

  const image = await screen.findByTestId('profile-image-preview');
  await waitFor(() => expect(image).toHaveAttribute('src', 'blob:profile-image'));
  expect(createObjectURL).toHaveBeenCalledTimes(1);
  expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'image/png' }));
  expect(image.getAttribute('src')).not.toMatch(/^data:/i);
});

test('rejects a saved image response with a non-raster MIME type', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          account: { username: 'profile-user', hasPassword: true },
          profile: null,
        },
      }),
    })
    .mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { mimeType: 'image/svg+xml', data: 'PHN2Zz4=' },
      }),
    });
  Object.defineProperty(globalThis, 'fetch', { configurable: true, value: fetchMock });

  const createObjectURL = jest.fn(() => 'blob:profile-image');
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });

  renderProfilePage();

  expect(await screen.findByTestId('profile-status-message')).toHaveTextContent(
    'errors.imageTypeError',
  );
  expect(createObjectURL).not.toHaveBeenCalled();
  expect(screen.queryByTestId('profile-image-preview')).not.toBeInTheDocument();
});
