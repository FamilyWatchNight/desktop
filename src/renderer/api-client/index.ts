import { ApiClient } from './types';
import { createHttpApiClient } from './http';

export function createApiClient(): ApiClient {
  if (typeof window !== 'undefined' && (window as any).electron) {
    return (window as any).electron;
  }
  return createHttpApiClient();
}

export * from './types';
export * from './http';
