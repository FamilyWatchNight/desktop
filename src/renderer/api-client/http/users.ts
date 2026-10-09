/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import {
  CurrentUserProfileUpdate,
  FirstAdminUserData,
  LoginRosterUser,
  UserApi,
  UserDetails,
} from '../types';

import { callApi } from './utils';

export class HttpUserApi implements UserApi {
  hasUsers(): Promise<boolean> {
    return callApi('/api/users/has-users');
  }

  getLoginRoster(): Promise<LoginRosterUser[]> {
    return callApi('/api/users/login-roster');
  }

  getCurrentDetails(): Promise<UserDetails | null> {
    return callApi<UserDetails | null>('/api/users/me');
  }

  updateCurrentProfile(data: CurrentUserProfileUpdate): Promise<void> {
    return callApi('/api/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  changeCurrentPassword(password: string): Promise<void> {
    return callApi('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  }

  removeCurrentPassword(): Promise<void> {
    return callApi('/api/users/me/password', { method: 'DELETE' });
  }

  async saveCurrentProfileImage(imageData: Uint8Array, mimeType: string): Promise<string> {
    const body = new ArrayBuffer(imageData.byteLength);
    new Uint8Array(body).set(imageData);

    return callApi<string>('/api/users/me/profile-image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Profile-Image-Type': mimeType,
      },
      body,
    });
  }

  deleteCurrentProfileImage(): Promise<void> {
    return callApi('/api/users/me/profile-image', { method: 'DELETE' });
  }

  createFirstAdmin(data: FirstAdminUserData) {
    return callApi('/api/users/bootstrap-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
