import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

import pageRegistry, { PageRegistry } from '../components/pageRegistry';

const PageRegistryContext = createContext<PageRegistry | undefined>(undefined);

export function PageRegistryProvider({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <PageRegistryContext.Provider value={pageRegistry}>{children}</PageRegistryContext.Provider>
  );
}

export function usePageRegistry(): PageRegistry {
  const context = useContext(PageRegistryContext);
  if (!context) {
    throw new Error('usePageRegistry must be used within a PageRegistryProvider');
  }

  return context;
}
