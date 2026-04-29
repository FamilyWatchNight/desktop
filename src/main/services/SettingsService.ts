/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as settingsManager from '../settings-manager';
import i18n from '../i18n';
import { AuthContext } from '../auth/context-manager';
import { AuthenticationError, AuthorizationError } from '../auth/errors';

export class SettingsService {
  private t = i18n.getFixedT(null, 'auth');

  private validateAuthContext(authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    if (!authContext.hasPermission('can-admin')) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  get(key: string, authContext?: AuthContext): unknown {
    this.validateAuthContext(authContext);
    return settingsManager.get(key);
  }

  set(key: string, value: unknown, authContext?: AuthContext): void {
    this.validateAuthContext(authContext);
    settingsManager.set(key, value);
  }

  load(authContext?: AuthContext): Record<string, unknown> {
    this.validateAuthContext(authContext);
    return settingsManager.load();
  }

  save(settings: Record<string, unknown>, authContext?: AuthContext): void {
    this.validateAuthContext(authContext);
    settingsManager.setAll(settings);
  }
}




