/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../technical/infrastructure/world';
import { MovieData } from '../../../../src/main/db/models/Movies';
import { InternalSystemPersona } from '../../business-flow/personas/internal-system';
import { attemptAsync } from '../../technical/infrastructure/utils';

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system as InternalSystemPersona;
}

Given('stub Watchmode data is loaded from {string}', async function (this: CustomWorld, dataSource: string) {
  const system = getSystemPersona(this);
  await system.loadStubWatchmodeData(dataSource);
});
Given('stub Watchmode data is loaded from', async function (this: CustomWorld, dataSource: string) {
  const system = getSystemPersona(this);
  await system.loadStubWatchmodeData(dataSource);
});

Given('stub TMDB data is loaded from {string}', async function (this: CustomWorld, dataSource: string) {
  const system = getSystemPersona(this);
  await system.loadStubTmdbData(dataSource);
});
Given('stub TMDB data is loaded from', async function (this: CustomWorld, dataSource: string) {
  const system = getSystemPersona(this);
  await system.loadStubTmdbData(dataSource);
});

async function getMovieByTmdbId(world: CustomWorld, tmdbId: string) {
  world.setStateReturn(undefined, "getMovie");
  const system = getSystemPersona(world);
  const movie = await system.getMovieByTmdbId(tmdbId);
  world.setStateObject("movie", movie, `tmdb_${tmdbId}`);
  return movie;
}

When('I look up the movie with TMDB ID {string}', async function (this: CustomWorld, tmdbId: string) {
  await getMovieByTmdbId(this, tmdbId);
});

When('I attempt to look up the movie with TMDB ID {string}', async function (this: CustomWorld, tmdbId: string) {
  await attemptAsync(this, async () => { await getMovieByTmdbId(this, tmdbId); });
});

async function getMovieByWatchmodeId(world: CustomWorld, watchmodeId: string) {
  const system = getSystemPersona(world);
  const movie = await system.getMovieByWatchmodeId(watchmodeId);
  world.setStateObject("movie", movie, `watchmode_${watchmodeId}`);
  return movie;
}

When('I look up the movie with Watchmode ID {string}', async function (this: CustomWorld, watchmodeId: string) {
  await getMovieByWatchmodeId(this, watchmodeId);
});

When('I attempt to look up the movie with Watchmode ID {string}', async function (this: CustomWorld, watchmodeId: string) {
  await attemptAsync(this, async () => { await getMovieByWatchmodeId(this, watchmodeId); });
});

Then('the movie should have a null year value', async function (this: CustomWorld) {
  const currentMovie = this.getStateObject("movie") as MovieData | undefined;
  expect(currentMovie).toBeDefined();
  expect(currentMovie!.year).toBeNull();
});

Then('the movie should have a null popularity value', async function (this: CustomWorld) {
  const currentMovie = this.getStateObject("movie") as MovieData | undefined;
  expect(currentMovie).toBeDefined();
  expect(currentMovie!.popularity).toBeNull();
});

Then('the movie should exist', async function (this: CustomWorld) {
  const currentMovie = this.getStateObject("movie") as MovieData | undefined;
  expect(currentMovie).toBeDefined();
});

Then('the original movie title should be {string}', async function (this: CustomWorld, expectedTitle: string) {
  const currentMovie = this.getStateObject("movie") as MovieData | undefined;
  expect(currentMovie).toBeDefined();
  expect(currentMovie!.original_title).toBe(expectedTitle);
});

async function getMovieById(world: CustomWorld, movieId: number) {
  const system = getSystemPersona(world);
  const movie = await system.getMovieById(movieId);
  world.setStateObject("movie", movie, `id_${movieId}`);
  return movie;
}

When('I get movie by ID {int}', async function (this: CustomWorld, movieId: number) {
  await getMovieById(this, movieId);
});

When('I attempt to get movie by ID {int}', async function (this: CustomWorld, movieId: number) {
  await attemptAsync(this, async () => { await getMovieById(this, movieId); });
});

async function searchMoviesByTitle(world: CustomWorld, title: string) {
  world.setStateReturn(undefined, "searchMoviesByTitle");
  const system = getSystemPersona(world);
  const results = await system.searchMoviesByTitle(title);
  world.setStateReturn(results, "searchMoviesByTitle");
  return results;
}

When('I search movies by title {string}', async function (this: CustomWorld, title: string) {
  await searchMoviesByTitle(this, title);
});

When('I attempt to search movies by title {string}', async function (this: CustomWorld, title: string) {
  await attemptAsync(this, async () => { await searchMoviesByTitle(this, title); });
});

Then('I should receive a list of movies', async function (this: CustomWorld) {
  const searchResults = this.getStateReturn("searchMoviesByTitle") as MovieData[] | undefined;
  expect(searchResults).toBeDefined();
  expect(Array.isArray(searchResults)).toBe(true);
});
