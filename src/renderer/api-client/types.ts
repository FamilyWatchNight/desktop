/* API client types */

export interface MovieApi {
  create(movieData: unknown): Promise<unknown>;
  getById(id: number): Promise<unknown>;
  getByWatchdogId(watchdogId: string): Promise<unknown>;
  getByTmdbId(tmdbId: string): Promise<unknown>;
  getAll(): Promise<unknown>;
  update(id: number, movieData: unknown): Promise<unknown>;
  delete(id: number): Promise<unknown>;
  searchByTitle(searchTerm: string): Promise<unknown>;
}

export interface AppApi {
  getAppVersion(): Promise<string>;
  getServerPort(): Promise<number>;
  openSettings(): Promise<void>;
}

export interface SettingsApi {
  loadSettings(): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>;
  saveSettings(settings: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  onSettingsSaved(callback: () => void): () => void;
}

export interface BackgroundTaskApi {
  enqueueBackgroundTask(taskType: string, args?: Record<string, unknown>): Promise<unknown>;
  getBackgroundTasks(): Promise<{ active: unknown; queue: unknown[] }>;
  cancelActiveBackgroundTask(): Promise<unknown>;
  removeQueuedBackgroundTask(taskId: string): Promise<unknown>;
  onBackgroundTaskUpdate(callback: (state: { active: unknown; queue: unknown[] }) => void): () => void;
}

export interface ApiClient extends AppApi, SettingsApi, BackgroundTaskApi {
  movies: MovieApi;
}
