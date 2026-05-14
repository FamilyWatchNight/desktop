/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { BackgroundTaskApi } from '../types';

import { callApi } from './utils';

export class HttpBackgroundTaskApi implements BackgroundTaskApi {
  constructor(
    private client: {
      on(eventType: string, callback: (data: unknown) => void): void;
      off(eventType: string, callback: (data: unknown) => void): void;
    },
  ) {}

  enqueueBackgroundTask(taskType: string, args?: Record<string, unknown>) {
    return callApi('/api/background-tasks/enqueue', {
      method: 'POST',
      body: JSON.stringify({ taskType: taskType, args }),
    });
  }
  getBackgroundTasks() {
    return callApi('/api/background-tasks');
  }
  cancelActiveBackgroundTask() {
    return callApi('/api/background-tasks/cancel-active', { method: 'POST' });
  }
  removeQueuedBackgroundTask(taskId: string) {
    return callApi('/api/background-tasks/remove-queued', {
      method: 'POST',
      body: JSON.stringify({ taskId }),
    });
  }
  onBackgroundTaskUpdate(callback: (state: { active: unknown; queue: unknown[] }) => void) {
    this.client.on('background-task-update', callback);
    return () => this.client.off('background-task-update', callback);
  }
}
