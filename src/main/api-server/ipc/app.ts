/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { localizationService, settingsService } from './instances';
import { app } from 'electron';

const isDevMode = !app.isPackaged;

export function registerAppIpcHandlers() {
  // application-level handlers
  ipcMain.handle('get-app-version', () => require('electron').app.getVersion());
  ipcMain.handle('get-app-locale', () => { return require('../../i18n').appLanguage; });
  ipcMain.handle('locale-get', (_event, namespace: string, language: string) => localizationService.getLocaleFile(namespace, language) );

  if (isDevMode) {
    ipcMain.handle('locale-missing-key', (_event, namespace: string, language: string, key: string, fallbackValue: string) =>
      localizationService.saveMissingKey(namespace, language, key, fallbackValue)
    );
  }

  ipcMain.handle('get-server-port', () => (settingsService.get('webPort') as number) || 3000);
}