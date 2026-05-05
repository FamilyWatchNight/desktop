/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import log from 'electron-log/main';

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

let store: StoreLike | null = null;

export async function initialize(settingsStore?: StoreLike): Promise<void> {
  if (store) {
    log.info('Settings already initialized. Skipping initialization.');
    return;
  }

  if (settingsStore !== undefined) {
    store = settingsStore;
  } else {
    const { default: Store } = await import('electron-store');
    store = new Store() as unknown as StoreLike;
  }
}

export async function getStatus(): Promise<{ initialized: boolean }> {
  return { initialized: store !== null };
}

function getStore(): StoreLike {
  if (!store) {
    throw new Error('SettingsManager not initialized');
  }
  return store;
}

export function get(key: string): unknown {
  const settings = getStore().get('settings', {}) as Record<string, unknown>;
  if (key in settings) {
    return settings[key];
  }
  return DEFAULT_SETTINGS[key];
}

export function set(key: string, value: unknown): void {
  const settings = getStore().get('settings', {}) as Record<string, unknown>;
  settings[key] = value;
  getStore().set('settings', settings);
}

export function getAll(): Record<string, unknown> {
  return getStore().get('settings', {}) as Record<string, unknown>;
}

export function load(): Record<string, unknown> {
  const persisted = getAll();
  return { ...DEFAULT_SETTINGS, ...persisted };
}

export function setAll(settings: Record<string, unknown>): void {
  const s = getStore();
  const currentSettings = s.get('settings', {}) as Record<string, unknown>;
  const merged = { ...currentSettings, ...settings };
  s.set('settings', merged);
}

export function clear(): void {
  getStore().set('settings', {});
}
