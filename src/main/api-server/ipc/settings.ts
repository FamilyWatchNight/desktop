/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { settingsService } from './instances';

export function registerSettingsIpcHandlers() {
  ipcMain.handle('load-settings', async () => settingsService.load());
  ipcMain.handle('save-settings', async (_event, settings: Record<string, unknown>) => settingsService.save(settings));
}
