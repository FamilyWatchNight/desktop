/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { Express, NextFunction, Request, Response } from 'express';

import { AuthenticationError, SessionError } from '../../auth/errors';
import { authService, sessionManager } from '../ipc/instances';

import { envelope } from './utils';

export interface AuthenticatedRequest extends Request {
  authSession?: ReturnType<typeof sessionManager.getSession>;
}

function getBearerToken(req: Request): string {
  const header = req.headers.authorization;
  return typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length).trim()
    : '';
}

function errorStatus(error: unknown): number {
  if (error instanceof SessionError) return error.code === 'session-limit' ? 429 : 401;
  if (error instanceof AuthenticationError) return 401;
  return 500;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    req.authSession = sessionManager.getSession(getBearerToken(req));
    next();
  } catch (error) {
    res.status(errorStatus(error));
    envelope(res, null, error instanceof Error ? error.message : String(error));
  }
}

export function registerAuthRoutes(app: Express): void {
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body ?? {};
      const clientKey = `http:${req.ip || req.socket.remoteAddress || 'unknown'}`;
      envelope(res, await authService.login(username, password, clientKey));
    } catch (error) {
      res.status(errorStatus(error));
      envelope(res, null, error instanceof Error ? error.message : String(error));
    }
  });

  app.get('/api/auth/session', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    envelope(res, req.authSession);
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    authService.logout(getBearerToken(req));
    envelope(res, null);
  });
}
