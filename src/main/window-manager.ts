/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { app, BrowserWindow } from 'electron';
import path from 'path';
import * as backgroundTaskManager from './background-task-manager';

let mainWindow: BrowserWindow | null = null;

function handleBackgroundTaskUpdate(state: { active: unknown; queue: unknown[] }): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('background-task-update', state);
  }
}

function registerCallbacks(): void {
  backgroundTaskManager.setNotifyFn(handleBackgroundTaskUpdate);
}

function unregisterCallbacks(): void {
  backgroundTaskManager.clearNotifyFn(handleBackgroundTaskUpdate);
} 

export function handleWindowClosed(): void {
  unregisterCallbacks();
  mainWindow = null;
}

export function createAppWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return;
  }
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(app.getAppPath(), 'assets', 'images', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) {
    mainWindow.loadURL(startUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
  mainWindow.on('closed', handleWindowClosed);

  registerCallbacks();
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function focusMainWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
  }
}
