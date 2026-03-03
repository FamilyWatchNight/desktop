/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express, Request } from 'express';
import { BackgroundTaskService } from '../../services';
import { route } from './utils';
import { TaskRegistryType, isTaskRegistryType } from '../../tasks/task-registry';

const backgroundTaskService = new BackgroundTaskService();

export function registerBackgroundTaskRoutes(app: Express): void {
  app.post('/api/background-tasks/enqueue',
    route((req: Request) => {
      const { taskType, args } = req.body || {};
      if (typeof taskType !== 'string' || !isTaskRegistryType(taskType)) {
        throw new Error(`Invalid task type: ${taskType}`);
      }
      return backgroundTaskService.enqueue(taskType as TaskRegistryType, args);
    })
  );

  app.get('/api/background-tasks',
    route(() => backgroundTaskService.getState())
  );

  app.post('/api/background-tasks/cancel-active',
    route(() => backgroundTaskService.cancelActive())
  );

  app.post('/api/background-tasks/remove-queued',
    route((req: Request) => {
      const { taskId } = req.body || {};
      return backgroundTaskService.removeQueued(taskId);
    })
  );
}
