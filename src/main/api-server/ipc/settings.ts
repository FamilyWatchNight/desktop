/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { settingsService } from './instances';

export function registerSettingsIpcHandlers() {
  
  // Settings-specific
  ipcMain.handle('load-settings', async () => {
    try {
      const settings = settingsService.load();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Error loading settings:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('save-settings', async (_event, settings: Record<string, unknown>) => {
    try {
      settingsService.save(settings);
      console.info('Settings saved:', settings);
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });
}
