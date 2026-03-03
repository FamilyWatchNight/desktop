/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type SettingsManager from '../settings-manager';

export class SettingsService {
  constructor(private settingsManager: SettingsManager) {}

  get(key: string): unknown {
    return this.settingsManager.get(key);
  }

  set(key: string, value: unknown): void {
    this.settingsManager.set(key, value);
  }

  load(): Record<string, unknown> {
    return this.settingsManager.getAll();
  }

  save(settings: Record<string, unknown>): void {
    this.settingsManager.setAll(settings);
  }
}
