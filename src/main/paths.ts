/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import path from 'path';
import os from 'os';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const appInfoJson = require('./app-info.json') as { name: string };

export function getAppDataRoot(): string {
  const appName = appInfoJson.name;

  if (process.platform === 'win32') {
    const appData = process.env.APPDATA;
    if (!appData) throw new Error('APPDATA is not set');
    return path.join(appData, appName);
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', appName);
  }
  return path.join(os.homedir(), '.config', appName);
}