import { ApiClient } from '../types';
import { IpcMovieApi } from './movies';
import { IpcSettingsApi } from './settings';
import { IpcBackgroundTaskApi } from './background-tasks';
import { IpcAppApi } from './app';

export function createIpcApiClient(ipc: any): ApiClient {
  return {
    ...new IpcAppApi(ipc),
    movies: new IpcMovieApi(ipc),
    ...new IpcSettingsApi(ipc),
    ...new IpcBackgroundTaskApi(ipc)
  } as ApiClient;
}
