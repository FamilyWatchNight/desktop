/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';

import { authService } from './instances';

export function registerAuthIpcHandlers(): void {
  ipcMain.handle('auth-login', async (event, username: unknown, password: unknown) => {
    return authService.login(username, password, `ipc:${event.sender.id}`);
  });

  ipcMain.handle('auth-current', (_event, token: unknown) => authService.getSession(token));

  ipcMain.handle('auth-logout', (_event, token: unknown) => {
    authService.logout(token);
  });
}
