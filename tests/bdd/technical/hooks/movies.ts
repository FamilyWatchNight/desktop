/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { MovieData } from '../../../src/main/db/models/Movies';
import { withTestHooks } from '../infrastructure/utils';

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
  async getAllMovies(): Promise<MovieData[]> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.movies.getAll();
    });
  }

  /**
   * Get a movie by its TMDB ID
   */
  async getMovieByTmdbId(tmdbId: string): Promise<MovieData | undefined> {
    return await withTestHooks(this.app, async (hooks, tmdbId) => {
      return hooks.movies.getByTmdbId(tmdbId);
    }, tmdbId);
  }

  /**
   * Get a movie by its Watchmode ID
   */
  async getMovieByWatchmodeId(watchmodeId: string): Promise<MovieData | undefined> {
    return await withTestHooks(this.app, async (hooks, watchmodeId) => {
      return hooks.movies.getByWatchmodeId(watchmodeId);
    }, watchmodeId);
  }

  /**
   * Search for movies by title
   */
  async searchByTitle(searchTerm: string): Promise<MovieData[]> {
    return await withTestHooks(this.app, async (hooks, searchTerm) => {
      return hooks.movies.searchByTitle(searchTerm);
    }, searchTerm);
  }

  /**
   * Get the count of movies in the database
   */
  async getMovieCount(): Promise<number> {
    const movies = await this.getAllMovies();
    return movies.length;
  }
}
