import { createHttpApiClient } from './http';
import { ApiClient } from './types';

interface ElectronWindow extends Window {
  electron?: ApiClient;
}

export function createApiClient(): ApiClient {
  if (typeof window !== 'undefined') {
    const win = window as ElectronWindow;
    if (win.electron) {
      return win.electron;
    }
  }

  return createHttpApiClient();
}

export * from './types';
export * from './http';
