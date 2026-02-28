/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express, Request } from 'express';
import { BackgroundTaskService } from '../services';
import { route } from './utils';

const backgroundTaskService = new BackgroundTaskService();

export function registerBackgroundTaskRoutes(app: Express): void {
  app.post('/api/background-tasks/enqueue',
    route((req: Request) => {
      const { type, args } = req.body || {};
      return backgroundTaskService.enqueue(type, args);
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
