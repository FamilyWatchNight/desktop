/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';

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
  async enqueue(taskType: string, args?: Record<string, unknown>): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, taskType, args) => {
      return hooks.backgroundTasks.enqueue(taskType, args);
    }, taskType, args);
  }

  /**
   * Get the current background task state
   */
  async getState(): Promise<{ active: unknown; queue: unknown[] }> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.backgroundTasks.getState();
    });
  }

  /**
   * Cancel the active background task
   */
  async cancelActive(): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.backgroundTasks.cancelActive();
    });
  }

  /**
   * Remove a queued background task
   */
  async removeQueued(taskId: string): Promise<unknown> {
    return await withTestHooks(this.app, async (hooks, taskId) => {
      return hooks.backgroundTasks.removeQueued(taskId);
    }, taskId);
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
