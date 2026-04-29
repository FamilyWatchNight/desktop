/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import SettingsManager from '../settings-manager';
import { StoreLike } from '../settings-manager';
import i18n from '../i18n';
import { AuthContext } from '../auth/context-manager';
import { AuthenticationError, AuthorizationError } from '../auth/errors';

export class SettingsService {
  private settingsManager: SettingsManager;
  private t = i18n.getFixedT(null, 'auth');

  constructor() {
    this.settingsManager = new SettingsManager();
  }

  private validateAuthContext(authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    if (!authContext.hasPermission('can-admin')) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  async initialize(store?: StoreLike): Promise<void> {
    await this.settingsManager.initialize(store);
  }

  get(key: string, authContext?: AuthContext): unknown {
    this.validateAuthContext(authContext);
    return this.settingsManager.get(key);
  }

  set(key: string, value: unknown, authContext?: AuthContext): void {
    this.validateAuthContext(authContext);
    this.settingsManager.set(key, value);
  }

  load(authContext?: AuthContext): Record<string, unknown> {
    this.validateAuthContext(authContext);
    
    return this.settingsManager.load();
  }

  save(settings: Record<string, unknown>, authContext?: AuthContext): void {
    this.validateAuthContext(authContext);
    
    this.settingsManager.setAll(settings);
  }
}




