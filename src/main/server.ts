/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import fs from 'fs';
import path from 'path';
import express, { type Express, type Request, type Response } from 'express';
import RateLimit from 'express-rate-limit';
import { app } from 'electron';
import { registerHttpRoutes } from './api-server';

const isDevMode = !app.isPackaged;
const rootDir = app.getAppPath();
const publicPath = path.join(rootDir, 'dist', 'renderer');

export function startServer(app: Express, port: number): ReturnType<Express['listen']> {

  // set up rate limiter: maximum of five requests per minute
  var limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100, // max 100 requests per windowMs
  });

  app.use(limiter);

  // reject any request where the incoming Host header isn't localhost or 127.0.0.1
  app.use((req, res, next) => {
    const hostHeader = req.headers.host;
    const hostname = typeof hostHeader === 'string' ? hostHeader.split(':')[0] : '';
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      res.status(403).send('Forbidden');
      return;
    }
    next();
  });

  app.get('/', (_req: Request, res: Response) => {
    const indexPath = path.join(publicPath, 'index.html');
    try {
      let html = fs.readFileSync(indexPath, 'utf-8');
      if (isDevMode) {
        html = html.replace(
          '</head>',
          '<script>window.isDevMode = true;</script></head>'
        );
      }
      res.send(html);
    } catch (err) {
      console.error('Failed to read index.html', err);
      res.status(500).send('Internal Server Error');
    }
  });

  // register HTTP routes powered by service layer
  registerHttpRoutes(app);

  app.use(express.static(publicPath));

  const server = app.listen(port, 'localhost', () => {
    console.info(`Web server listening on http://localhost:${port}`);
  });

  return server;
}
