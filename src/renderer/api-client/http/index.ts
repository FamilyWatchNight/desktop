import { ApiClient } from '../types';
import { HttpMovieApi } from './movies';
import { HttpSettingsApi } from './settings';
import { HttpBackgroundTaskApi } from './background-tasks';
import { HttpAppApi } from './app';

export function createHttpApiClient(): ApiClient {
  return {
    ...new HttpAppApi(),
    movies: new HttpMovieApi(),
    ...new HttpSettingsApi(),
    ...new HttpBackgroundTaskApi()
  } as ApiClient;
}
