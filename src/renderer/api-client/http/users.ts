/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { FirstAdminUserData, LoginRosterUser, UserApi } from '../types';

import { callApi } from './utils';

export class HttpUserApi implements UserApi {
  hasUsers(): Promise<boolean> {
    return callApi('/api/users/has-users');
  }

  getLoginRoster(): Promise<LoginRosterUser[]> {
    return callApi('/api/users/login-roster');
  }

  createFirstAdmin(data: FirstAdminUserData) {
    return callApi('/api/users/bootstrap-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
