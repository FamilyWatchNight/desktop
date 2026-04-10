/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as db from '../database';
import type { Movie } from '../db/models/Movies';
import i18n from '../i18n';
import { AuthContext } from '../auth/context-manager';
import { AuthenticationError } from '../auth/errors';

export class MovieService {
  private t = i18n.getFixedT(null, 'auth');

  private validateReadOnlyAuthContext(authContext?: AuthContext): void {
    if (!authContext) {
      throw new AuthenticationError(this.t('errors.authenticationRequired'));
    }
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

  searchByTitle(searchTerm: string, authContext?: AuthContext): Movie[] {
    this.validateReadOnlyAuthContext(authContext);
    const models = db.getModels();
    return models.movies.searchByTitle(searchTerm);
  }
}
