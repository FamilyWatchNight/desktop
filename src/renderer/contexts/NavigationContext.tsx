/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface NavigationContextValue {
  currentPage: string;
  navigateTo: (pageId: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [currentPage, setCurrentPage] = useState<string>('home');

  const navigateTo = useCallback((pageId: string) => {
    setCurrentPage(pageId);
  }, []);

  // Expose a stable function on window so tests and other code can call it directly.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).navigateTo = (pageId: string) => navigateTo(pageId);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).navigateTo;
    };
  }, [navigateTo]);

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

export function useOptionalNavigation(): NavigationContextValue | undefined {
  return useContext(NavigationContext);
}
