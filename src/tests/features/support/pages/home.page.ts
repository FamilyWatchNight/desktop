/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication, Page } from 'playwright';
import { MovieData } from '../../../../main/db/models/Movies';
import type { TestHooks } from '../../../../main/testing-active/TestHooksImpl';

/**
 * Page Object for the Home/Movies page
 * Provides methods to interact with the movie list and movie data
 */
export class HomePage {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  // helper that executes a callback inside the electron app with access to test hooks.
  // all of the repeated casting/validation logic lives here so callers can remain concise.
  async withTestHooks<T, A extends unknown[]>(
    fn: (hooks: TestHooks, ...args: A) => Promise<T> | T,
    ...args: A
  ): Promise<T> {
    const fnString = fn.toString();

    return this.app.evaluate(
      async (
        { app },
        payload: { fnSource: string; fnArgs: unknown[] }
      ) => {
        const { fnSource, fnArgs } = payload;

        const appWithTestHooks = app as typeof app & {
          testHooks?: TestHooks;
        };

        if (!appWithTestHooks.testHooks) {
          throw new Error(
            'Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.'
          );
        }

        const hookFn = eval(`(${fnSource})`);

        return hookFn(appWithTestHooks.testHooks, ...fnArgs);
      },
      {
        fnSource: fnString,
        fnArgs: args,
      }
    );
  }

  /**
   * Get the first window of the application
   */
  async getWindow(): Promise<Page> {
    return await this.app.firstWindow();
  }

  /**
   * Get all movies from the database via the electron API
   */
  async getAllMovies(): Promise<MovieData[]> {
    return await this.withTestHooks(async (hooks) => {
      return hooks.movies.getAll();
    });
  }

  /**
   * Get a movie by its TMDB ID
   */
  async getMovieByTmdbId(tmdbId: string): Promise<MovieData | undefined> {
    return await this.withTestHooks(async (hooks, tmdbId) => {
      return hooks.movies.getByTmdbId(tmdbId);
    }, tmdbId);
  }

  /**
   * Get a movie by its Watchmode ID
   */
  async getMovieByWatchmodeId(watchmodeId: string): Promise<MovieData | undefined> {
    return await this.withTestHooks(async (hooks, watchmodeId) => {
      return hooks.movies.getByWatchmodeId(watchmodeId);
    }, watchmodeId);
  }

  /**
   * Get the count of movies in the database
   */
  async getMovieCount(): Promise<number> {
    const movies = await this.getAllMovies();
    return movies.length;
  }
}
