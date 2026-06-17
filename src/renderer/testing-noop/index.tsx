import type React from 'react';

import type { PageRegistry } from '../components/pageRegistry';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerTestPages(_registry: PageRegistry): void {
  // No-op for non-testing builds.
}

export function buildTestingMenu(): React.ReactNode | null {
  return null;
}
