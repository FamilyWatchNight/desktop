/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { app, Menu, Tray, ipcMain } from 'electron';
import { registerIpcHandlers } from './ipc-handlers';
import { createAppWindow } from './window-manager';
import path from 'path';
import express from 'express';
import * as server from './server';
import * as db from './database';
import SettingsManager from './settings-manager';
import type { TestHooks } from './testing/TestHooksImpl';
import { getTestHooks } from './testing/TestHooksImpl';

let tray: Tray | null = null;
const webServer = express();
const settingsManager = new SettingsManager();

if (process.env.NODE_ENV === 'development') {
  require('electron-reloader')(module, {
    watchRenderer: false
  })
}


function createTray(): void {
  const iconPath = path.join(__dirname, '../../assets/icon.png');
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open App',
      click: () => {
        // use createAppWindow which focuses if already open
        createAppWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Family Watch Night');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    createAppWindow();
  });

  tray.on('double-click', () => {
    createAppWindow();
  });
}

app.on('ready', () => {
  db.initDatabase();
  settingsManager.initialize();
  createTray();
  createAppWindow();
  registerIpcHandlers();

  try {
    const port = (settingsManager.get('webPort') as number) || 3000;
    server.startServer(webServer, port);
  } catch (error) {
    console.error('Failed to load settings, using default port:', (error as Error).message);
    server.startServer(webServer, 3000);
  }
});

app.on('window-all-closed', () => {});

app.on('activate', () => {
  if (process.platform === 'darwin') {
    createAppWindow();
  }
});


if (process.env.NODE_ENV === 'test') {

  // If NODE_ENV is set to 'test', register the hooks used for integration testing.
  // Node that build:main populates the testing directory with no-op implementations,
  // and build:main:for-integration-testing populates it with the active implementations,
  // so this code only runs when the testing-active scripts have been used.

  const appWithTestHooks = app as typeof app & {
    testHooks?: TestHooks;
  };

  appWithTestHooks.testHooks = getTestHooks();

  // TODO: Consider replacing the ipcMain handlers below with direct calls to the testHooks methods.

  ipcMain.handle('test:get-db-status', async () => db.getStatus());

  (global as unknown as { __testCallbacks: { createTaskContext: () => import('./tasks/BackgroundTask').TaskContext } }).__testCallbacks = {
    createTaskContext: () => ({
      abortSignal: null as unknown as AbortSignal,
      reportProgress: () => {},
      isCancelled: () => false
    })
  };
}

app.on('before-quit', () => {
  db.closeDatabase();
});
