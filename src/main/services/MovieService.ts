/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as db from '../database';
import type { Movie, MovieData } from '../db/models/Movies';

export class MovieService {
  create(movieData: unknown): number {
    const models = db.getModels();
    return models.movies.create(movieData as MovieData);
  }

  getById(id: number): Movie | null {
    const models = db.getModels();
    return models.movies.getById(id);
  }

  getByWatchmodeId(watchmodeId: string): Movie | null {
    const models = db.getModels();
    return models.movies.getByWatchmodeId(watchmodeId);
  }

  getByTmdbId(tmdbId: string): Movie | null {
    const models = db.getModels();
    return models.movies.getByTmdbId(tmdbId);
  }

  getAll(): Movie[] {
    const models = db.getModels();
    return models.movies.getAll();
  }

  update(id: number, movieData: unknown): boolean {
    const models = db.getModels();
    return models.movies.update(id, movieData as MovieData);
  }

  delete(id: number): boolean {
    const models = db.getModels();
    return models.movies.delete(id);
  }

  searchByTitle(searchTerm: string): Movie[] {
    const models = db.getModels();
    return models.movies.searchByTitle(searchTerm);
  }
}
