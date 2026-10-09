/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
*/

import { ipcMain } from 'electron';

import { createAuthContext } from '../../auth/auth-context';
import { AuthenticationError } from '../../auth/errors';
import { ValidationError } from '../../security';
import type { FirstAdminUserData } from '../../services/UserService';

import { sessionManager, userService } from './instances';

function getSessionAuthContext(token: unknown) {
  if (typeof token !== 'string') {
    throw new AuthenticationError('Authentication required');
  }

  const session = sessionManager.getSession(token);
  return createAuthContext(session.userId, session.permissions);
}

function getProfileUpdate(data: unknown): { displayName?: string | null } {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Invalid profile update');
  }

  const update = data as Record<string, unknown>;
  if (
    Object.keys(update).some((key) => key !== 'displayName') ||
    (Object.prototype.hasOwnProperty.call(update, 'displayName') &&
      update.displayName !== null &&
      typeof update.displayName !== 'string')
  ) {
    throw new ValidationError('Invalid profile update');
  }

  if (!Object.prototype.hasOwnProperty.call(update, 'displayName')) return {};
  if (update.displayName === null) return { displayName: null };
  if (typeof update.displayName === 'string') return { displayName: update.displayName };
  throw new ValidationError('Invalid profile update');
}

function getProfileImageData(imageData: unknown): Buffer {
  if (!(imageData instanceof Uint8Array)) {
    throw new ValidationError('Invalid profile image data');
  }
  return Buffer.from(imageData);
}

export function registerUserIpcHandlers(): void {
  ipcMain.handle('users-has-users', () => userService.hasUsers());
  ipcMain.handle('users-login-roster', () => userService.getLoginRoster());
  ipcMain.handle('users-create-first-admin', (_event, data: FirstAdminUserData) =>
    userService.createFirstAdmin(data),
  );
  ipcMain.handle('users-current-details', (_event, token: unknown) =>
    userService.getCurrentUserDetails(getSessionAuthContext(token)),
  );
  ipcMain.handle(
    'users-update-current-profile',
    (_event, token: unknown, data: unknown) =>
      userService.updateCurrentUserProfile(getProfileUpdate(data), getSessionAuthContext(token)),
  );
  ipcMain.handle(
    'users-change-current-password',
    (_event, token: unknown, password: unknown) => {
      if (typeof password !== 'string') throw new ValidationError('Invalid password');
      return userService.changeCurrentUserPassword(password, getSessionAuthContext(token));
    },
  );
  ipcMain.handle('users-remove-current-password', (_event, token: unknown) =>
    userService.removeCurrentUserPassword(getSessionAuthContext(token)),
  );
  ipcMain.handle(
    'users-save-current-profile-image',
    (_event, token: unknown, imageData: unknown, mimeType: unknown) => {
      if (typeof mimeType !== 'string') throw new ValidationError('Invalid image type');
      return userService.saveCurrentUserProfileImage(
        getProfileImageData(imageData),
        mimeType,
        getSessionAuthContext(token),
      );
    },
  );
  ipcMain.handle('users-delete-current-profile-image', (_event, token: unknown) =>
    userService.deleteCurrentUserProfileImage(getSessionAuthContext(token)),
  );
}
