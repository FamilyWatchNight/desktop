/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { backgroundTaskService } from './instances';
import { TaskRegistryType, isTaskRegistryType } from '../../tasks/task-registry';

export function registerBackgroundTaskIpcHandlers() {
  ipcMain.handle('enqueue-background-task', (_event, taskType: string, args: Record<string, unknown>) => {
    if (!isTaskRegistryType(taskType)) {
      throw new Error(`Invalid task type: ${taskType}`);
    }
    return backgroundTaskService.enqueue(taskType as TaskRegistryType, args ?? {})
  });
  ipcMain.handle('get-background-tasks', () => backgroundTaskService.getState());
  ipcMain.handle('cancel-active-background-task', () => backgroundTaskService.cancelActive());
  ipcMain.handle('remove-queued-background-task', (_event, taskId: string) =>
    backgroundTaskService.removeQueued(taskId)
  );
}
