/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import SettingsManager from '../../settings-manager';
import { MovieService, SettingsService, BackgroundTaskService, LocalizationService } from '../../services';

// shared service instances used by the IPC handlers
export const settingsManager = new SettingsManager();
export const backgroundTaskService = new BackgroundTaskService();
export const localizationService = new LocalizationService();
export const movieService = new MovieService();
export const settingsService = new SettingsService(settingsManager);
