/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as backgroundTaskManager from '../background-task-manager';
import type { TaskRegistryType } from '../tasks/task-registry';
import i18n from '../i18n';
import { AuthContext } from '../auth/context-manager';
import { AuthenticationError, AuthorizationError } from '../auth/errors';

export class BackgroundTaskService {
  private t = i18n.getFixedT(null, 'auth');

  private validateAuthContext(authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    if (!authContext.hasPermission('can-admin')) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  enqueue(taskType: TaskRegistryType, args: Record<string, unknown> = {}, authContext?: AuthContext): { success: boolean; taskId?: string; error?: string } {
    this.validateAuthContext(authContext);
    return backgroundTaskManager.enqueue(taskType, args);
  }

  getState(authContext?: AuthContext): { active: unknown; queue: unknown[] } {
    this.validateAuthContext(authContext);
    return backgroundTaskManager.getState();
  }

  cancelActive(authContext?: AuthContext): { success: boolean; error?: string } {
    this.validateAuthContext(authContext);
    return backgroundTaskManager.cancelActive();
  }

  removeQueued(taskId: string, authContext?: AuthContext): { success: boolean; error?: string } {
    this.validateAuthContext(authContext);
    return backgroundTaskManager.removeQueued(taskId);
  }

  setNotifyFn(fn: (state: { active: unknown; queue: unknown[] }) => void): void {
    backgroundTaskManager.setNotifyFn(fn);
  }

  clearNotifyFn(fn: (state: { active: unknown; queue: unknown[] }) => void): void {
    backgroundTaskManager.clearNotifyFn(fn);
  }
}




