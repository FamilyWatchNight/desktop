/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { PAGE_IDS } from '../../../../src/renderer/pages/PageIds';

import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  static readonly pageId = PAGE_IDS.SETTINGS;
  readonly selectors = {
    pageRoot: '[data-testid="page-settings"]',
    webPortInput: '[data-testid="settings-webport-input"]',
    watchmodeApiKeyInput: '[data-testid="settings-watchmode-api-key-input"]',
    tmdbApiKeyInput: '[data-testid="settings-tmdb-api-key-input"]',
    saveButton: '[data-testid="settings-save-button"]',
    cancelButton: '[data-testid="settings-cancel-button"]',
    importWatchmodeButton: '[data-testid="settings-import-watchmode-button"]',
    importTmdbButton: '[data-testid="settings-import-tmdb-button"]',
    statusMessage: '[data-testid="settings-status-message"]',
    backgroundTaskMessage: '[data-testid="settings-background-task-message"]',
  };

  async getTextForSetting(
    key: 'webPort' | 'watchmodeApiKey' | 'tmdbApiKey',
  ): Promise<string | null> {
    const selectorKey = `${key}Input` as keyof typeof this.selectors;
    const selector = this.selectors[selectorKey];
    if (!selector) {
      throw new Error(`Selector not found for key: ${key}`);
    }
    return this.getText(selectorKey);
  }

  async getWebPort(): Promise<string | null> {
    return this.getText('webPortInput');
  }

  async getWatchmodeApiKey(): Promise<string | null> {
    return this.getText('watchmodeApiKeyInput');
  }

  async getTmdbApiKey(): Promise<string | null> {
    return this.getText('tmdbApiKeyInput');
  }
}
