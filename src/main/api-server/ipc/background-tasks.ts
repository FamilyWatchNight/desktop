/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ipcMain } from 'electron';
import { backgroundTaskService } from './instances';

export function registerBackgroundTaskIpcHandlers() {
  ipcMain.handle('enqueue-background-task', (_event, taskType: string, args: Record<string, unknown>) =>
    backgroundTaskService.enqueue(taskType as import('../../tasks/task-registry').TaskRegistryType, args ?? {})
  );
  ipcMain.handle('get-background-tasks', () => backgroundTaskService.getState());
  ipcMain.handle('cancel-active-background-task', () => backgroundTaskService.cancelActive());
  ipcMain.handle('remove-queued-background-task', (_event, taskId: string) =>
    backgroundTaskService.removeQueued(taskId)
  );
}
