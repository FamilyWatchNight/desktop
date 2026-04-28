/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { movieService } from './instances';

export function registerMovieIpcHandlers() {
  ipcMain.handle('movies-get-by-id', (_event, id: number) => movieService.getById(id));
  ipcMain.handle('movies-get-by-watchmode-id', (_event, watchmodeId: string) => movieService.getByWatchmodeId(watchmodeId));
  ipcMain.handle('movies-get-by-tmdb-id', (_event, tmdbId: string) => movieService.getByTmdbId(tmdbId));
  ipcMain.handle('movies-search-by-title', (_event, searchTerm: string) => movieService.searchByTitle(searchTerm));
}
