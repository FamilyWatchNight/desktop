/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type BackgroundTask from '../../../tasks/BackgroundTask';
import { TASK_REGISTRY } from '../../../tasks/task-registry';

/**
 * Test-specific extensions for the task registry
 * These methods are only available during testing
 */
export function registerTask(type: string, TaskCtor: new () => BackgroundTask): void {
  TASK_REGISTRY[type] = TaskCtor;
}

export function unregisterTask(type: string): void {
  if (TASK_REGISTRY[type]) {
    delete TASK_REGISTRY[type];
  }
}