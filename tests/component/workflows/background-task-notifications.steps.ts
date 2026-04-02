/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/infrastructure/world';

function backgroundTaskState(world: CustomWorld) {
  return world.getStateStore('backgroundTaskNotifications');
}

function storeTaskReference(world: CustomWorld, refName: string, taskId: string): void {
  const state = backgroundTaskState(world);
  if (!state.taskReferences) {
    state.taskReferences = new Map<string, string>();
  }
  (state.taskReferences as Map<string, string>).set(refName, taskId);
}

function getTaskRefName(world: CustomWorld, taskId: string): string | undefined {
  const state = backgroundTaskState(world);
  const taskRefs = state.taskReferences as Map<string, string>;
  if (!taskRefs) return undefined;
  for (const [refName, id] of taskRefs.entries()) {
    if (id === taskId) {
      return refName;
    }
  }
  return undefined;
}

Given('event recording is cleared', async function (this: CustomWorld) {
  await this.eventNotificationsApi.clearRecordedEvents();
});

When('a background task {string} is enqueued', async function (this: CustomWorld, refName: string) {
  await this.dbApi.initMockDatabase();
  
  // Enqueue with the standard test task type
  const result = (await this.backgroundTasksApi.enqueue('test-background-task', {})) as { success: boolean; taskId?: string };
  expect(result.success).toBe(true);
  
  // Store mapping from reference name to task ID
  if (result.taskId) {
    storeTaskReference(this, refName, result.taskId);
  }
});

When('I set the task progress to current={int}, max={int}, description={string}', async function (
  this: CustomWorld,
  current: number,
  max: number,
  description: string
) {
  await this.backgroundTasksApi.setTaskProgress(current, max, description);
  // Small delay to allow event to be recorded
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I set the task description to {string}', async function (this: CustomWorld, description: string) {
  await this.backgroundTasksApi.setTaskDescription(description);
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I set the task current to {int}', async function (this: CustomWorld, current: number) {
  await this.backgroundTasksApi.setTaskCurrent(current);
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I set the task max to {int}', async function (this: CustomWorld, max: number) {
  await this.backgroundTasksApi.setTaskMax(max);
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I complete the task', async function (this: CustomWorld) {
  await this.backgroundTasksApi.completeTask();
  await new Promise((resolve) => setTimeout(resolve, 200));
});

Then('{string} should be the active task', async function (this: CustomWorld, expectedRefName: string) {
  const state = await this.backgroundTasksApi.getState() as { active: { id: string } | null; queue: unknown[] };
  const activeTaskId = state.active?.id;
  
  expect(activeTaskId).toBeDefined();
  
  const actualRefName = getTaskRefName(this, activeTaskId!);
  expect(actualRefName).toBe(expectedRefName);
});

Then('the most recent {string} event should have no active task', async function (
  this: CustomWorld,
  eventType: string
) {
  const events = await this.eventNotificationsApi.filterEventsByType(eventType);
  expect(events.length).toBeGreaterThan(0);

  const lastEvent = events[events.length - 1];
  const eventData = lastEvent.data as Record<string, unknown>;

  expect(eventData).toHaveProperty('active');
  expect(eventData.active).toBeNull();
});

Then('the most recent {string} event should have active task with status={string}, current={int}, max={int}', async function (
  this: CustomWorld,
  eventType: string,
  expectedStatus: string,
  expectedCurrent: number,
  expectedMax: number
) {
  const events = await this.eventNotificationsApi.filterEventsByType(eventType);
  expect(events.length).toBeGreaterThan(0);

  const lastEvent = events[events.length - 1];
  const eventData = lastEvent.data as Record<string, unknown>;
  const activeTask = eventData.active as Record<string, unknown> | null;

  expect(activeTask).not.toBeNull();
  expect(activeTask?.status).toBe(expectedStatus);
  expect(activeTask?.current).toBe(expectedCurrent);
  expect(activeTask?.max).toBe(expectedMax);
});



Then('exactly {int} {string} events should be recorded', async function (
  this: CustomWorld,
  expectedCount: number,
  eventType: string
) {
  const events = await this.eventNotificationsApi.filterEventsByType(eventType);
  expect(events.length).toBe(expectedCount);
});

Then('the most recent {string} event should have {int} queued tasks', async function (
  this: CustomWorld,
  eventType: string,
  expectedQueueCount: number
) {
  const events = await this.eventNotificationsApi.filterEventsByType(eventType);
  expect(events.length).toBeGreaterThan(0);

  const lastEvent = events[events.length - 1];
  const eventData = lastEvent.data as Record<string, unknown>;
  const queue = (eventData.queue as unknown[]) || [];

  expect(queue.length).toBe(expectedQueueCount);
});

