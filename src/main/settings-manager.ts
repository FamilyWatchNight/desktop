/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import Store from 'electron-store';

const DEFAULT_SETTINGS: Record<string, unknown> = {
  webPort: 3000,
  watchmodeApiKey: '',
  tmdbApiKey: ''
};

type StoreLike = {
  has: (key: string) => boolean;
  get: (key: string, defaultValue?: unknown) => unknown;
  set: (key: string, value: unknown) => void;
};

export default class SettingsManager {
  private store: StoreLike;

  constructor() {
    const isTest = process.env.NODE_ENV === 'test';
    const storeName = isTest ? 'test-settings' : 'config';
    const s = new Store<{ settings: Record<string, unknown> }>({ name: storeName });
    this.store = s as unknown as StoreLike;
    if (isTest) {
      // Clear test settings for isolation
      this.store.set('settings', {});
    } else if (!this.store.has('settings')) {
      this.store.set('settings', {});
    }
  }

  initialize(): void {
    // electron-store automatically loads persisted data
  }

  get(key: string): unknown {
    const settings = this.store.get('settings', {}) as Record<string, unknown>;
    if (key in settings) {
      return settings[key];
    }
    return DEFAULT_SETTINGS[key];
  }

  set(key: string, value: unknown): void {
    const settings = this.store.get('settings', {}) as Record<string, unknown>;
    settings[key] = value;
    this.store.set('settings', settings);
  }

  getAll(): Record<string, unknown> {
    return this.store.get('settings', {}) as Record<string, unknown>;
  }

  load(): Record<string, unknown> {
    const persisted = this.getAll();
    return { ...DEFAULT_SETTINGS, ...persisted };
  }

  setAll(settings: Record<string, unknown>): void {
    const currentSettings = this.store.get('settings', {}) as Record<string, unknown>;
    const merged = { ...currentSettings, ...settings };
    this.store.set('settings', merged);
  }

  clear(): void {
    this.store.set('settings', {});
  }
}
