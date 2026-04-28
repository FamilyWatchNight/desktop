/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';
import { type AuthContextPayload } from '../../../src/main/auth/context-manager';

/**
 * API layer for exposing background task functionality in the electron app to Cucumber tests.
 */
export class BackgroundTasks {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * Enqueue a background task
   */
  async enqueue(taskType: string, args?: Record<string, unknown>, authContext?: AuthContextPayload): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, taskType, args, authContext) => {
      return hooks.backgroundTasks.enqueue(taskType, args, authContext);
    }, taskType, args, authContext);
  }

  /**
   * Get the current background task state
   */
  async getState(authContext?: AuthContextPayload): Promise<{ active: unknown; queue: unknown[] }> {
    return await withTestHooks(this.app, async (hooks, authContext) => {
      return hooks.backgroundTasks.getState(authContext);
    }, authContext);
  }

  /**
   * Cancel the active background task
   */
  async cancelActive(authContext?: AuthContextPayload): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, authContext) => {
      return hooks.backgroundTasks.cancelActive(authContext);
    }, authContext);
  }

  /**
   * Remove a queued background task
   */
  async removeQueued(taskId: string, authContext?: AuthContextPayload): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, taskId, authContext) => {
      return hooks.backgroundTasks.removeQueued(taskId, authContext);
    }, taskId, authContext);
  }

  /**
   * Initialize test task type registration
   */
  async setupTestTaskType(): Promise<void> {
    return await withTestHooks(this.app, async (hooks) => {
      hooks.testTasks.setupTestTaskType();
    });
  }

  /**
   * Control active mock task progress
   */
  async setTaskProgress(current: number, max: number, description: string): Promise<void> {
    return await withTestHooks(this.app, async (hooks, current, max, description) => {
      hooks.testTasks.setTaskProgress(current, max, description);
    }, current, max, description);
  }

  async setTaskDescription(description: string): Promise<void> {
    return await withTestHooks(this.app, async (hooks, description) => {
      hooks.testTasks.setTaskDescription(description);
    }, description);
  }

  async setTaskCurrent(current: number): Promise<void> {
    return await withTestHooks(this.app, async (hooks, current) => {
      hooks.testTasks.setTaskCurrent(current);
    }, current);
  }

  async setTaskMax(max: number): Promise<void> {
    return await withTestHooks(this.app, async (hooks, max) => {
      hooks.testTasks.setTaskMax(max);
    }, max);
  }

  async completeTask(): Promise<void> {
    return await withTestHooks(this.app, async (hooks) => {
      hooks.testTasks.completeTask();
    });
  }

}

