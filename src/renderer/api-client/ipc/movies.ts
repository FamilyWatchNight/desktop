import { MovieApi } from '../types';

export class IpcMovieApi implements MovieApi {
  private ipc: any;
  constructor(ipc: any) { this.ipc = ipc; }
  create(movieData: unknown) { return this.ipc.movies.create(movieData); }
  getById(id: number) { return this.ipc.movies.getById(id); }
  getByWatchdogId(watchdogId: string) { return this.ipc.movies.getByWatchdogId(watchdogId); }
  getByTmdbId(tmdbId: string) { return this.ipc.movies.getByTmdbId(tmdbId); }
  getAll() { return this.ipc.movies.getAll(); }
  update(id: number, movieData: unknown) { return this.ipc.movies.update(id, movieData); }
  delete(id: number) { return this.ipc.movies.delete(id); }
  searchByTitle(searchTerm: string) { return this.ipc.movies.searchByTitle(searchTerm); }
}
