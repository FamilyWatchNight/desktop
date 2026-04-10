/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as db from '../database';
import type { Movie, MovieData } from '../db/models/Movies';
import i18n from '../i18n';
import { AuthContext } from '../auth/context-manager';
import { AuthenticationError, AuthorizationError } from '../auth/errors';

export class MovieService {
  private t = i18n.getFixedT(null, 'auth');

  private validateReadOnlyAuthContext(authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
  }

  private validateWriteAuthContext(authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
    if (!authContext.hasPermission('can-admin')) {
      throw new AuthorizationError(this.t('errors.insufficientPermissions'));
    }
  }

  create(movieData: unknown, authContext?: AuthContext): number {
    this.validateWriteAuthContext(authContext);
    const models = db.getModels();
    return models.movies.create(movieData as MovieData);
  }

  getById(id: number, authContext?: AuthContext): Movie | null {
    this.validateReadOnlyAuthContext(authContext);
    const models = db.getModels();
    return models.movies.getById(id);
  }

  getByWatchmodeId(watchmodeId: string, authContext?: AuthContext): Movie | null {
    this.validateReadOnlyAuthContext(authContext);
    const models = db.getModels();
    return models.movies.getByWatchmodeId(watchmodeId);
  }

  getByTmdbId(tmdbId: string, authContext?: AuthContext): Movie | null {
    this.validateReadOnlyAuthContext(authContext);
    const models = db.getModels();
    return models.movies.getByTmdbId(tmdbId);
  }

  getAll(authContext?: AuthContext): Movie[] {
    this.validateReadOnlyAuthContext(authContext);
    const models = db.getModels();
    return models.movies.getAll();
  }

  update(id: number, movieData: unknown, authContext?: AuthContext): boolean {
    this.validateWriteAuthContext(authContext);
    const models = db.getModels();
    return models.movies.update(id, movieData as MovieData);
  }

  delete(id: number, authContext?: AuthContext): boolean {
    this.validateWriteAuthContext(authContext);
    const models = db.getModels();
    return models.movies.delete(id);
  }

  searchByTitle(searchTerm: string, authContext?: AuthContext): Movie[] {
    this.validateReadOnlyAuthContext(authContext);
    const models = db.getModels();
    return models.movies.searchByTitle(searchTerm);
  }
}
