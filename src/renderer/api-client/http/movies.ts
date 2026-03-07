import { MovieApi } from '../types';
import { callApi } from './utils';

export class HttpMovieApi implements MovieApi {
  create(movieData: unknown) { return callApi('/api/movies', { method: 'POST', body: JSON.stringify(movieData) }); }
  getById(id: number) { return callApi(`/api/movies/${id}`); }
  getByWatchdogId(watchdogId: string) { return callApi(`/api/movies/watchmode/${watchdogId}`); }
  getByTmdbId(tmdbId: string) { return callApi(`/api/movies/tmdb/${tmdbId}`); }
  getAll() { return callApi('/api/movies'); }
  update(id: number, movieData: unknown) { return callApi(`/api/movies/${id}`, { method: 'PUT', body: JSON.stringify(movieData) }); }
  delete(id: number) { return callApi(`/api/movies/${id}`, { method: 'DELETE' }); }
  searchByTitle(searchTerm: string) { return callApi(`/api/movies?searchTerm=${encodeURIComponent(searchTerm)}`); }
}
