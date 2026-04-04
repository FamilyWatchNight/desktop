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

function movieState(world: CustomWorld) {
  return world.getStateStore('movieManagement');
}

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system;
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

When('I look up the movie with TMDB ID {string}', async function (this: CustomWorld, tmdbId: string) {
  const state = movieState(this);
  const system = getSystemPersona(this);
  state.currentMovie = await system.getMovieByTmdbId(tmdbId);
});

When('I look up the movie with Watchmode ID {string}', async function (this: CustomWorld, watchmodeId: string) {
  const state = movieState(this);
  const system = getSystemPersona(this);
  state.currentMovie = await system.getMovieByWatchmodeId(watchmodeId);
});

Then('I should see {int} movies in the database', async function (this: CustomWorld, expectedCount: number) {
  const system = getSystemPersona(this);
  const count = await system.getMovieCount();
  expect(count).toBe(expectedCount);
});

Then('the movie should have a null year value', async function (this: CustomWorld) {
  const state = movieState(this);
  const currentMovie = state.currentMovie as MovieData | undefined;
  expect(currentMovie).toBeDefined();
  expect(currentMovie!.year).toBeNull();
});

Then('the movie should have a null popularity value', async function (this: CustomWorld) {
  const state = movieState(this);
  const currentMovie = state.currentMovie as MovieData | undefined;
  expect(currentMovie).toBeDefined();
  expect(currentMovie!.popularity).toBeNull();
});

Then('the movie should exist', async function (this: CustomWorld) {
  const state = movieState(this);
  const currentMovie = state.currentMovie as MovieData | undefined;
  expect(currentMovie).toBeDefined();
});

Then('the original movie title should be {string}', async function (this: CustomWorld, expectedTitle: string) {
  const state = movieState(this);
  const currentMovie = state.currentMovie as MovieData | undefined;
  expect(currentMovie).toBeDefined();
  expect(currentMovie!.original_title).toBe(expectedTitle);
});
