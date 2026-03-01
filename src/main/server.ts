/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import path from 'path';
import express, { type Express, type Request, type Response } from 'express';
import RateLimit from 'express-rate-limit';
import { app } from 'electron';
import { registerHttpRoutes, registerAppRoutes } from './api-server';

const rootDir = app.getAppPath();
const distPath = path.join(rootDir, 'dist');
const publicPath = path.join(rootDir, 'public');

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

  // register HTTP routes powered by service layer
  registerHttpRoutes(app);
  registerAppRoutes(app);

  app.use('/dist', express.static(distPath));
  app.use(express.static(publicPath));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  const server = app.listen(port, 'localhost', () => {
    console.info(`Web server listening on http://localhost:${port}`);
  });

  return server;
}
