/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { createSettingsWindow } from '../../window-manager';
import { settingsManager } from './instances';

export function registerAppIpcHandlers() {
  // application-level handlers
  ipcMain.handle('get-app-version', () => require('electron').app.getVersion());
  ipcMain.handle('get-server-port', () => (settingsManager.get('webPort') as number) || 3000);
  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
  });
}