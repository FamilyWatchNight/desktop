/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express } from 'express';
import { registerAppRoutes } from './app';
import { registerBackgroundTaskRoutes } from './background-tasks';
import { registerMovieRoutes } from './movies';
import { registerSettingsRoutes } from './settings';

export function registerHttpRoutes(app: Express): void {
  registerAppRoutes(app);
  registerBackgroundTaskRoutes(app);
  registerMovieRoutes(app);
  registerSettingsRoutes(app);
}
