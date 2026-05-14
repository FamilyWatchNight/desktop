/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { MovieApi } from '../types';

import { callApi } from './utils';

export class HttpMovieApi implements MovieApi {
  create(movieData: unknown) {
    return callApi('/api/movies', { method: 'POST', body: JSON.stringify(movieData) });
  }
  getById(id: number) {
    return callApi(`/api/movies/${id}`);
  }
  getByWatchmodeId(watchmodeId: string) {
    return callApi(`/api/movies/watchmode/${watchmodeId}`);
  }
  getByTmdbId(tmdbId: string) {
    return callApi(`/api/movies/tmdb/${tmdbId}`);
  }
  getAll() {
    return callApi('/api/movies');
  }
  update(id: number, movieData: unknown) {
    return callApi(`/api/movies/${id}`, { method: 'PUT', body: JSON.stringify(movieData) });
  }
  delete(id: number) {
    return callApi(`/api/movies/${id}`, { method: 'DELETE' });
  }
  searchByTitle(searchTerm: string) {
    return callApi(`/api/movies?searchTerm=${encodeURIComponent(searchTerm)}`);
  }
}
