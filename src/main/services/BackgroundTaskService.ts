/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as backgroundTaskManager from '../background-task-manager';
import type { TaskRegistryType } from '../tasks/task-registry';

export class BackgroundTaskService {
  enqueue(taskType: TaskRegistryType, args: Record<string, unknown> = {}): { success: boolean; taskId?: string; error?: string } {
    return backgroundTaskManager.enqueue(taskType, args);
  }

  getState(): { active: unknown; queue: unknown[] } {
    return backgroundTaskManager.getState();
  }

  cancelActive(): { success: boolean; error?: string } {
    return backgroundTaskManager.cancelActive();
  }

  removeQueued(taskId: string): { success: boolean; error?: string } {
    return backgroundTaskManager.removeQueued(taskId);
  }

  setNotifyFn(fn: (state: { active: unknown; queue: unknown[] }) => void): void {
    backgroundTaskManager.setNotifyFn(fn);
  }
}
