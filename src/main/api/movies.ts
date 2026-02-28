/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Express, Request } from 'express';
import { MovieService } from '../services';
import { route } from './utils';

const movieService = new MovieService();

export function registerMovieRoutes(app: Express): void {
  app.post('/api/movies',
    route((req: Request) => movieService.create(req.body))
  );

  app.get('/api/movies/:id',
    route((req: Request) => movieService.getById(Number(req.params.id)))
  );

  app.get('/api/movies/watchmode/:id',
    route((req: Request) => movieService.getByWatchmodeId(String(req.params.id)))
  );

  app.get('/api/movies/tmdb/:id',
    route((req: Request) => movieService.getByTmdbId(String(req.params.id)))
  );

  app.get('/api/movies',
    route((req: Request) => {
      if (req.query.searchTerm) {
        return movieService.searchByTitle(String(req.query.searchTerm));
      }
      return movieService.getAll();
    })
  );

  app.put('/api/movies/:id',
    route((req: Request) => {
      const success = movieService.update(Number(req.params.id), req.body);
      return { success };
    })
  );

  app.delete('/api/movies/:id',
    route((req: Request) => {
      const success = movieService.delete(Number(req.params.id));
      return { success };
    })
  );
}
