/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type BackgroundTask from './BackgroundTask';
import ImportWatchmodeTask from './ImportWatchmodeTask';
import ImportTmdbTask from './ImportTmdbTask';

export const TASK_REGISTRY_VALUES = [
  'import-watchmode',
  'import-tmdb',
] as const;

export type TaskRegistryType = typeof TASK_REGISTRY_VALUES[number];

export const TASK_REGISTRY: Record<string, new () => BackgroundTask> = {
  'import-watchmode': ImportWatchmodeTask,
  'import-tmdb': ImportTmdbTask
};

export function isTaskRegistryType(value: string): value is TaskRegistryType {
  return (TASK_REGISTRY_VALUES as readonly string[]).includes(value);
}
