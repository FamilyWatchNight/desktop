/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

export function setWindow(window: BrowserWindow): void {
  mainWindow = window;
}

export function broadcast(eventType: string, data: any): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(eventType, data);
  }
}