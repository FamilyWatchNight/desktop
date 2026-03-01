/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import * as db from '../../database';
import { createSettingsWindow } from '../../window-manager';
import { settingsManager } from './instances';
import { registerMovieIpcHandlers } from './movies';
import { registerSettingsIpcHandlers } from './settings';
import { registerBackgroundTaskIpcHandlers } from './background-tasks';

let handlersRegistered = false;

export function registerIpcHandlers(): void {
  const channels = [
    'get-app-version',
    'get-server-port',
    'open-settings',
    'load-settings',
    'save-settings',
    'enqueue-background-task',
    'get-background-tasks',
    'cancel-active-background-task',
    'remove-queued-background-task',
    'movies-create',
    'movies-get-by-id',
    'movies-get-by-watchdog-id',
    'movies-get-by-tmdb-id',
    'movies-get-all',
    'movies-update',
    'movies-delete',
    'movies-search-by-title',
    'test:get-db-status'
  ];

  channels.forEach((ch) => {
    try {
      ipcMain.removeHandler(ch);
    } catch {
      // ignore if not present
    }
  });

  if (handlersRegistered) {
    return;
  }
  handlersRegistered = true;

  // application-level handlers
  ipcMain.handle('get-app-version', () => require('electron').app.getVersion());
  ipcMain.handle('get-server-port', () => (settingsManager.get('webPort') as number) || 3000);
  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
  });

  // delegate domain handlers
  registerSettingsIpcHandlers();
  registerBackgroundTaskIpcHandlers();
  registerMovieIpcHandlers();

  if (process.env.NODE_ENV === 'test') {
    if (ipcMain.listenerCount('test:get-db-status') === 0) {
      ipcMain.handle('test:get-db-status', async () => db.getStatus());
    }
  }
}
