/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import SettingsManager from '../../settings-manager';
import { MovieService, SettingsService, BackgroundTaskService } from '../../services';

// shared service instances used by the IPC handlers
export const settingsManager = new SettingsManager();
export const movieService = new MovieService();
export const settingsService = new SettingsService(settingsManager);
export const backgroundTaskService = new BackgroundTaskService();
