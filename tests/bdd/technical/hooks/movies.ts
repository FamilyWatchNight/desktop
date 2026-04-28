/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { MovieData } from '../../../src/main/db/models/Movies';
import { withTestHooks } from '../infrastructure/utils';
import { AuthContextPayload } from '../../../src/main/auth/context-manager';

/**
 * API layer for exposing movie-related functionality in the electron app to Cucumber tests.
 */
export class Movies {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * Get all movies from the database via the electron API
   */
  async getAllMovies(authContext?: AuthContextPayload): Promise<MovieData[]> {
    return await withTestHooks(this.app, async (hooks, authContext) => {
      return hooks.movies.getAll(authContext);
    }, authContext);
  }

  /**
   * Get a movie by its database ID
   */
  async getMovieById(id: number, authContext?: AuthContextPayload): Promise<MovieData | undefined> {
    return await withTestHooks(this.app, async (hooks, id, authContext) => {
      return hooks.movies.getById(id, authContext);
    }, id, authContext);
  }

  /**
   * Get a movie by its TMDB ID
   */
  async getMovieByTmdbId(tmdbId: string, authContext?: AuthContextPayload): Promise<MovieData | undefined> {
    return await withTestHooks(this.app, async (hooks, tmdbId, authContext) => {
      return hooks.movies.getByTmdbId(tmdbId, authContext);
    }, tmdbId, authContext);
  }

  /**
   * Get a movie by its Watchmode ID
   */
  async getMovieByWatchmodeId(watchmodeId: string, authContext?: AuthContextPayload): Promise<MovieData | undefined> {
    return await withTestHooks(this.app, async (hooks, watchmodeId, authContext) => {
      return hooks.movies.getByWatchmodeId(watchmodeId, authContext);
    }, watchmodeId, authContext);
  }

  /**
   * Search for movies by title
   */
  async searchByTitle(searchTerm: string, authContext?: AuthContextPayload): Promise<MovieData[]> {
    return await withTestHooks(this.app, async (hooks, searchTerm, authContext) => {
      return hooks.movies.searchByTitle(searchTerm, authContext);
    }, searchTerm, authContext);
  }
}
