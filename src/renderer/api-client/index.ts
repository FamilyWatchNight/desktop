import { ApiClient } from './types';
import { createIpcApiClient } from './ipc';
import { createHttpApiClient } from './http';

export function createApiClient(): ApiClient {
  if (typeof window !== 'undefined' && (window as any).electron) {
    return createIpcApiClient((window as any).electron);
  }
  return createHttpApiClient();
}

export * from './types';
export * from './ipc';
export * from './http';
