/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain, app } from 'electron';
import SettingsManager from './settings-manager';
import { MovieService, SettingsService, BackgroundTaskService } from './services';
import * as db from './database';
import { createSettingsWindow } from './window-manager';

const settingsManager = new SettingsManager();
const movieService = new MovieService();
const settingsService = new SettingsService(settingsManager);
const backgroundTaskService = new BackgroundTaskService();

export function registerIpcHandlers(): void {
  // App handlers
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('get-server-port', () => (settingsManager.get('webPort') as number) || 3000);
  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
  });

  // Settings handlers
  ipcMain.handle('load-settings', () => {
    try {
      const settings = settingsService.load();
      return { success: true, data: settings };
    } catch (error) {
      console.error('Error loading settings:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('save-settings', async (_event, settings: Record<string, unknown>) => {
    try {
      settingsService.save(settings);
      console.info('Settings saved:', settings);
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  // Background task handlers
  ipcMain.handle('enqueue-background-task', (_event, taskType: string, args: Record<string, unknown>) =>
    backgroundTaskService.enqueue(taskType as import('./tasks/task-registry').TaskRegistryType, args ?? {})
  );
  ipcMain.handle('get-background-tasks', () => backgroundTaskService.getState());
  ipcMain.handle('cancel-active-background-task', () => backgroundTaskService.cancelActive());
  ipcMain.handle('remove-queued-background-task', (_event, taskId: string) =>
    backgroundTaskService.removeQueued(taskId)
  );

  // Movie handlers
  ipcMain.handle('movies-create', (_event, movieData: unknown) => {
    try {
      const id = movieService.create(movieData);
      return { success: true, data: id };
    } catch (error) {
      console.error('Error creating movie:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-get-by-id', (_event, id: number) => {
    try {
      const movie = movieService.getById(id);
      return { success: true, data: movie };
    } catch (error) {
      console.error('Error getting movie by ID:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-get-by-watchdog-id', (_event, watchdogId: string) => {
    try {
      const movie = movieService.getByWatchmodeId(watchdogId);
      return { success: true, data: movie };
    } catch (error) {
      console.error('Error getting movie by Watchdog ID:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-get-by-tmdb-id', (_event, tmdbId: string) => {
    try {
      const movie = movieService.getByTmdbId(tmdbId);
      return { success: true, data: movie };
    } catch (error) {
      console.error('Error getting movie by TMDB ID:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-get-all', () => {
    try {
      const movies = movieService.getAll();
      return { success: true, data: movies };
    } catch (error) {
      console.error('Error getting all movies:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-update', (_event, id: number, movieData: unknown) => {
    try {
      const success = movieService.update(id, movieData);
      return { success };
    } catch (error) {
      console.error('Error updating movie:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-delete', (_event, id: number) => {
    try {
      const success = movieService.delete(id);
      return { success };
    } catch (error) {
      console.error('Error deleting movie:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('movies-search-by-title', (_event, searchTerm: string) => {
    try {
      const movies = movieService.searchByTitle(searchTerm);
      return { success: true, data: movies };
    } catch (error) {
      console.error('Error searching movies by title:', (error as Error).message);
      return { success: false, error: (error as Error).message };
    }
  });

  // Test handlers (only in test mode)
  if (process.env.NODE_ENV === 'test') {
    ipcMain.handle('test:get-db-status', async () => db.getStatus());
  }
}

export function getServiceInstances() {
  return {
    settingsManager,
    movieService,
    settingsService,
    backgroundTaskService
  };
}
