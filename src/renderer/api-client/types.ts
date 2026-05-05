/* API client types */

export interface AppApi {
  getAppVersion(): Promise<string>;
  getAppLocale(): Promise<string>;
  getServerPort(): Promise<number>;
  getLocaleFile(namespace: string, language: string): Promise<Record<string, string>>;
  saveMissingKey?(namespace: string, language: string, key: string, fallbackValue: string): Promise<void>;
}

export interface BackgroundTaskApi {
  enqueueBackgroundTask(taskType: string, args?: Record<string, unknown>): Promise<unknown>;
  getBackgroundTasks(): Promise<{ active: unknown; queue: unknown[] }>;
  cancelActiveBackgroundTask(): Promise<unknown>;
  removeQueuedBackgroundTask(taskId: string): Promise<unknown>;
  onBackgroundTaskUpdate(callback: (state: { active: unknown; queue: unknown[] }) => void): () => void;
}

export interface MovieApi {
  create(movieData: unknown): Promise<unknown>;
  getById(id: number): Promise<unknown>;
  getByWatchmodeId(watchmodeId: string): Promise<unknown>;
  getByTmdbId(tmdbId: string): Promise<unknown>;
  getAll(): Promise<unknown>;
  update(id: number, movieData: unknown): Promise<unknown>;
  delete(id: number): Promise<unknown>;
  searchByTitle(searchTerm: string): Promise<unknown>;
}

export interface SettingsApi {
  loadSettings(): Promise< Record<string, unknown>>;
  saveSettings(settings: Record<string, unknown>): Promise<void>;
  onSettingsSaved(callback: () => void): () => void;
}

export interface ApiClient {
  app: AppApi;
  backgroundTasks: BackgroundTaskApi;
  movies: MovieApi;
  settings: SettingsApi;
}
