/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express, Request } from 'express';
import { settingsService } from '../ipc/instances';
import { route } from './utils';

export function registerSettingsRoutes(app: Express): void {
  app.get('/api/settings',
    route(() => settingsService.load())
  );

  app.post('/api/settings',
    route((req: Request) => {
      settingsService.save(req.body || {});
      return null;
    })
  );
}
