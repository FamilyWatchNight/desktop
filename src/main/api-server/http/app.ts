/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express, Request, Response } from 'express';
import path from 'path';

export function registerAppRoutes(app: Express): void {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/version', (_req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const appInfoJson = require(path.join(__dirname, '..', 'app-info.json')) as { version: string };
    res.json({ version: appInfoJson.version });
  });
}
