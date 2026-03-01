/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { movieService } from './instances';

// each handler returns a success envelope, mirroring the HTTP api
function wrap(fn: (...args: any[]) => unknown) {
  return async (_event: any, ...args: any[]) => {
    try {
      const data = await Promise.resolve(fn(...args));
      return { success: true, data };
    } catch (err) {
      console.error('IPC movie handler error:', (err as Error).message);
      return { success: false, error: (err as Error).message };
    }
  };
}

export function registerMovieIpcHandlers() {
  ipcMain.handle('movies-create', wrap((movieData: unknown) => movieService.create(movieData)));
  ipcMain.handle('movies-get-by-id', wrap((id: number) => movieService.getById(id)));
  ipcMain.handle('movies-get-by-watchdog-id', wrap((watchdogId: string) => movieService.getByWatchmodeId(watchdogId)));
  ipcMain.handle('movies-get-by-tmdb-id', wrap((tmdbId: string) => movieService.getByTmdbId(tmdbId)));
  ipcMain.handle('movies-get-all', wrap(() => movieService.getAll()));
  ipcMain.handle('movies-update', wrap((id: number, movieData: unknown) => {
    const success = movieService.update(id, movieData);
    return { success };
  }));
  ipcMain.handle('movies-delete', wrap((id: number) => {
    const success = movieService.delete(id);
    return { success };
  }));
  ipcMain.handle('movies-search-by-title', wrap((searchTerm: string) => movieService.searchByTitle(searchTerm)));
}
