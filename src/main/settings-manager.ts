/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

const DEFAULT_SETTINGS: Record<string, unknown> = {
  webPort: 3000,
  watchmodeApiKey: '',
  tmdbApiKey: ''
};

export type StoreLike = {
  has: (key: string) => boolean;
  get: (key: string, defaultValue?: unknown) => unknown;
  set: (key: string, value: unknown) => void;
};

export default class SettingsManager {
  private store?: StoreLike;

  async initialize(store?: StoreLike): Promise<void> {
    if (store !== undefined) {
      this.store = store;
    }
    else {
      const { default: Store } = await import('electron-store');
      this.store = new Store() as unknown as StoreLike;
    }
  }

  private getStore(): StoreLike {
    if (!this.store) {
      throw new Error('SettingsManager not initialized');
    }
    return this.store;
  } 

  get(key: string): unknown {
    const settings = this.getStore().get('settings', {}) as Record<string, unknown>;
    if (key in settings) {
      return settings[key];
    }
    return DEFAULT_SETTINGS[key];
  }

  set(key: string, value: unknown): void {
    const settings = this.getStore().get('settings', {}) as Record<string, unknown>;
    settings[key] = value;
    this.getStore().set('settings', settings);
  }

  getAll(): Record<string, unknown> {
    return this.getStore().get('settings', {}) as Record<string, unknown>;
  }

  load(): Record<string, unknown> {
    const persisted = this.getAll();
    return { ...DEFAULT_SETTINGS, ...persisted };
  }

  setAll(settings: Record<string, unknown>): void {
    const s = this.getStore();
    const currentSettings = s.get('settings', {}) as Record<string, unknown>;
    const merged = { ...currentSettings, ...settings };
    s.set('settings', merged);
  }

  clear(): void {
    this.getStore().set('settings', {});
  }
}
