/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

import { createAuthContext } from '../../auth/auth-context';
import { AuthenticationError, AuthorizationError } from '../../auth/errors';
import { ValidationError } from '../../security';
import type { FirstAdminUserData } from '../../services/UserService';
import { PROFILE_IMAGE_MAX_BYTES } from '../../services/UserService';
import { userService } from '../ipc/instances';

import { requireAuth, type AuthenticatedRequest } from './auth';
import { envelope, route } from './utils';

function getSessionAuthContext(req: AuthenticatedRequest) {
  if (!req.authSession) {
    throw new AuthenticationError('Authentication required');
  }
  return createAuthContext(req.authSession.userId, req.authSession.permissions);
}

function getProfileUpdate(data: unknown): { displayName?: string | null } {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Invalid profile update');
  }

  const update = data as Record<string, unknown>;
  if (
    Object.keys(update).some((key) => key !== 'displayName') ||
    (Object.prototype.hasOwnProperty.call(update, 'displayName') &&
      update.displayName !== null &&
      typeof update.displayName !== 'string')
  ) {
    throw new ValidationError('Invalid profile update');
  }

  if (!Object.prototype.hasOwnProperty.call(update, 'displayName')) return {};
  if (update.displayName === null) return { displayName: null };
  if (typeof update.displayName === 'string') return { displayName: update.displayName };
  throw new ValidationError('Invalid profile update');
}

function getHttpErrorStatus(error: unknown): number {
  if (error instanceof AuthenticationError) return 401;
  if (error instanceof AuthorizationError) return 403;
  if (error instanceof ValidationError) return 400;
  return 500;
}

function profileRoute(
  handler: (req: AuthenticatedRequest) => unknown | Promise<unknown>,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    try {
      const result = await handler(req as AuthenticatedRequest);
      envelope(res, result);
    } catch (error) {
      res.status(getHttpErrorStatus(error));
      envelope(res, null, error instanceof Error ? error.message : String(error));
    }
  };
}

function handleImageBodyError(error: unknown, res: Response): void {
  const status =
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : 400;
  res.status(status);
  envelope(res, null, error instanceof Error ? error.message : 'Invalid profile image data');
}

const parseProfileImageBody = express.raw({
  type: 'application/octet-stream',
  limit: PROFILE_IMAGE_MAX_BYTES,
});

const parseProfileImage: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  parseProfileImageBody(req, res, (error?: unknown) => {
    if (error) {
      handleImageBodyError(error, res);
      return;
    }
    next();
  });
};

export function registerUserRoutes(app: Express): void {
  app.get(
    '/api/users/has-users',
    route(() => userService.hasUsers()),
  );

  app.get(
    '/api/users/login-roster',
    route(() => userService.getLoginRoster()),
  );

  app.post(
    '/api/users/bootstrap-admin',
    route((req) => userService.createFirstAdmin(req.body as FirstAdminUserData)),
  );

  app.get(
    '/api/users/me',
    requireAuth,
    profileRoute((req) => userService.getCurrentUserDetails(getSessionAuthContext(req))),
  );

  app.get(
    '/api/users/me/profile-image',
    requireAuth,
    profileRoute((req) => userService.getCurrentUserProfileImage(getSessionAuthContext(req))),
  );

  app.patch(
    '/api/users/me/profile',
    requireAuth,
    profileRoute((req) =>
      userService.updateCurrentUserProfile(getProfileUpdate(req.body), getSessionAuthContext(req)),
    ),
  );

  app.put(
    '/api/users/me/password',
    requireAuth,
    profileRoute((req) => {
      const password = req.body?.password;
      if (typeof password !== 'string') {
        throw new ValidationError('Invalid password');
      }
      return userService.changeCurrentUserPassword(password, getSessionAuthContext(req));
    }),
  );

  app.delete(
    '/api/users/me/password',
    requireAuth,
    profileRoute((req) => userService.removeCurrentUserPassword(getSessionAuthContext(req))),
  );

  app.put(
    '/api/users/me/profile-image',
    requireAuth,
    parseProfileImage,
    profileRoute((req) => {
      if (!Buffer.isBuffer(req.body)) {
        throw new ValidationError('Invalid profile image data');
      }
      const mimeType = req.get('X-Profile-Image-Type');
      if (!mimeType) {
        throw new ValidationError('Invalid image type');
      }
      return userService.saveCurrentUserProfileImage(
        req.body,
        mimeType,
        getSessionAuthContext(req),
      );
    }),
  );

  app.delete(
    '/api/users/me/profile-image',
    requireAuth,
    profileRoute((req) => userService.deleteCurrentUserProfileImage(getSessionAuthContext(req))),
  );
}
