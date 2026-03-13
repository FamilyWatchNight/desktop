/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express, Request, Response } from 'express';
import path from 'path';
import { app } from 'electron';
import { LocalizationService } from '../../services';
import { route } from './utils';

const isDevMode = !app.isPackaged;

const localizationService = new LocalizationService();

export function registerAppRoutes(app: Express): void {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/locale', (_req: Request, res: Response) => {
    const { appLanguage } = require('../../i18n');
    res.json({ status: 'ok', locale: appLanguage });
  });

  app.get('/api/locale/get/:language/:namespace',
    route((req: Request) => {
      const namespace = Array.isArray(req.params.namespace) ? req.params.namespace[0] : req.params.namespace;
      const language = Array.isArray(req.params.language) ? req.params.language[0] : req.params.language;
      return localizationService.getLocaleFile(namespace, language);
    })
  );

  if (isDevMode) {
    app.post('/api/locale/missing-key',
      route((req: Request) => {
        const { namespace, language, key, fallbackValue } = req.body;
        return localizationService.saveMissingKey(namespace, language, key, fallbackValue);
      })
    );
  }

  app.get('/api/version', (_req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const appInfoJson = require(path.join(__dirname, '..', 'app-info.json')) as { version: string };
    res.json({ version: appInfoJson.version });
  });
}
