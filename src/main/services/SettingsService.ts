/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import SettingsManager from '../settings-manager';
import { StoreLike } from '../settings-manager';

export class SettingsService {
  private settingsManager: SettingsManager;

  constructor() {
    this.settingsManager = new SettingsManager();
  }

  initialize(store?: StoreLike): void {
    this.settingsManager.initialize(store);
  }

  get(key: string): unknown {
    return this.settingsManager.get(key);
  }

  set(key: string, value: unknown): void {
    this.settingsManager.set(key, value);
  }

  load(): Record<string, unknown> {
    return this.settingsManager.load();
  }

  save(settings: Record<string, unknown>): void {
    this.settingsManager.setAll(settings);
  }
}
