/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import log from 'electron-log/renderer';

import { SettingsApi } from '../types';

import { callApi } from './utils';

export class HttpSettingsApi implements SettingsApi {
  loadSettings() {
    return callApi('/api/settings');
  }
  saveSettings(settings: Record<string, unknown>) {
    return callApi('/api/settings', { method: 'POST', body: JSON.stringify(settings) });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSettingsSaved(_callback: () => void) {
    log.warn('onSettingsSaved not supported over HTTP');
    return () => {};
  }
}
