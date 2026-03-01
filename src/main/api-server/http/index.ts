/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express } from 'express';
import { registerSettingsRoutes } from './settings';
import { registerMovieRoutes } from './movies';
import { registerBackgroundTaskRoutes } from './background-tasks';

export function registerHttpRoutes(app: Express): void {
  registerSettingsRoutes(app);
  registerMovieRoutes(app);
  registerBackgroundTaskRoutes(app);
}
