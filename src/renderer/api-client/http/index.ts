import { ApiClient } from '../types';
import { HttpMovieApi } from './movies';
import { HttpSettingsApi } from './settings';
import { HttpBackgroundTaskApi } from './background-tasks';
import { HttpAppApi } from './app';

export function createHttpApiClient(): ApiClient {
  return {
    app:new HttpAppApi(),
    movies: new HttpMovieApi(),
    settings: new HttpSettingsApi(),
    backgroundTasks: new HttpBackgroundTaskApi()
  } as ApiClient;
}
