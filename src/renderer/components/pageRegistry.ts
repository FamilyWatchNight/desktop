import type React from 'react';

export interface PageRegistry {
  registerPage(route: string, component: React.ComponentType, label?: string): void;
  getPage(route: string): React.ComponentType | undefined;
  getPages(): Array<{ route: string; label?: string }>;
}

interface PageEntry {
  component: React.ComponentType;
  label?: string;
}

class PageRegistryImpl implements PageRegistry {
  private pages = new Map<string, PageEntry>();

  registerPage(route: string, component: React.ComponentType, label?: string): void {
    this.pages.set(route, { component, label });
  }

  getPage(route: string): React.ComponentType | undefined {
    return this.pages.get(route)?.component;
  }

  getPages(): Array<{ route: string; label?: string }> {
    return Array.from(this.pages.entries()).map(([route, entry]) => ({
      route,
      label: entry.label,
    }));
  }
}

const pageRegistry = new PageRegistryImpl();
export default pageRegistry;
