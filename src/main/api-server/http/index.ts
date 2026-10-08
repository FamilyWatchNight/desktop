/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express } from 'express';

import { registerAppRoutes } from './app';
import { registerAuthRoutes } from './auth';
import { registerBackgroundTaskRoutes } from './background-tasks';
import { registerMovieRoutes } from './movies';
import { broadcast, initializeWebSocketServer } from './notifications';
import { registerSettingsRoutes } from './settings';
import { registerUserRoutes } from './users';

export { broadcast, initializeWebSocketServer };

export function registerHttpRoutes(app: Express): void {
  registerAppRoutes(app);
  registerAuthRoutes(app);
  registerBackgroundTaskRoutes(app);
  registerMovieRoutes(app);
  registerSettingsRoutes(app);
  registerUserRoutes(app);
}
