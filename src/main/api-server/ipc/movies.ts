/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { movieService } from './instances';

export function registerMovieIpcHandlers() {
  ipcMain.handle('movies-create', (_event, movieData: unknown) => movieService.create(movieData));
  ipcMain.handle('movies-get-by-id', (_event, id: number) => movieService.getById(id));
  ipcMain.handle('movies-get-by-watchdog-id', (_event, watchdogId: string) => movieService.getByWatchmodeId(watchdogId));
  ipcMain.handle('movies-get-by-tmdb-id', (_event, tmdbId: string) => movieService.getByTmdbId(tmdbId));
  ipcMain.handle('movies-get-all', () => movieService.getAll());
  ipcMain.handle('movies-update', (_event, id: number, movieData: unknown) => {
    const success = movieService.update(id, movieData);
    return { success };
  });
  ipcMain.handle('movies-delete', (_event, id: number) => {
    const success = movieService.delete(id);
    return { success };
  });
  ipcMain.handle('movies-search-by-title', (_event, searchTerm: string) => movieService.searchByTitle(searchTerm));
}
