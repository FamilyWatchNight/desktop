/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../technical/infrastructure/world';
import { InternalSystemPersona } from '../../business-flow/personas/internal-system';
import { attemptAsync } from '../../technical/infrastructure/utils';

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system as InternalSystemPersona;
}

function setStoreTask(world: CustomWorld, taskId: string | undefined, refName?: string) {
  world.setStateObject('tasks', taskId, refName);
}

function getTaskRefName(world: CustomWorld, taskId: string): string | undefined {
  const objectStore = world.getStateObjectStore('tasks') as { latest: unknown; all: Map<string, unknown> } | undefined;
  if (!objectStore?.all) return undefined;
  for (const [refName, id] of objectStore.all.entries()) {
    if (id === taskId) {
      return refName;
    }
  }
  return undefined;
}

Given('event recording is cleared', async function (this: CustomWorld) {
  const system = getSystemPersona(this);
  system.clearRecordedEvents();
});

async function enqueueTask(world: CustomWorld, refName: string) {
  const system = getSystemPersona(world);
  await system.initDatabase();
  await system.setupTestTaskType();
  const result = await system.enqueueTask('test-background-task', { refName });
  expect((result as { success: boolean; }).success).toBe(true);
  const taskResult = result as { success: boolean; taskId?: string; };
  setStoreTask(world, taskResult.taskId ?? undefined, refName);
  return result;
}

When('a background task {string} is enqueued', async function (this: CustomWorld, refName: string) {
  await enqueueTask(this, refName);
});

When('I attempt to enqueue a background task {string}', async function (this: CustomWorld, refName: string) {
  await attemptAsync(this, async () => { await enqueueTask(this, refName); });
});

When('I set the task progress to current={int}, max={int}, description={string}', async function (
  this: CustomWorld,
  current: number,
  max: number,
  description: string
) {
  const system = getSystemPersona(this);
  await system.setTaskProgress(current, max, description);
  // Small delay to allow event to be recorded
  await new Promise((resolve) => setTimeout(resolve, 200));
});

When('I set the task description to {string}', async function (this: CustomWorld, description: string) {
  const system = getSystemPersona(this);
  system.setTaskDescription(description);
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I set the task current to {int}', async function (this: CustomWorld, current: number) {
  const system = getSystemPersona(this);
  system.setTaskCurrent(current);
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I set the task max to {int}', async function (this: CustomWorld, max: number) {
  const system = getSystemPersona(this);
  system.setTaskMax(max);
  await new Promise((resolve) => setTimeout(resolve, 50));
});

When('I complete the task', async function (this: CustomWorld) {
  const system = getSystemPersona(this);
  await system.completeTask();
  await new Promise((resolve) => setTimeout(resolve, 200));
});

Then('{string} should be the active task', async function (this: CustomWorld, expectedRefName: string) {
  const system = getSystemPersona(this);
  const state = await system.getTaskState() as { active: { id: string } | null; queue: unknown[] };
  const activeTaskId = state.active?.id;
  
  expect(activeTaskId).toBeDefined();
  
  const actualRefName = getTaskRefName(this, activeTaskId!);
  expect(actualRefName).toBe(expectedRefName);
});

Then('the most recent {string} event should have no active task', async function (
  this: CustomWorld,
  eventType: string
) {
  const system = getSystemPersona(this);
  const events = await system.filterEventsByType(eventType);
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
  const system = getSystemPersona(this);
  const events = await system.filterEventsByType(eventType);
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
  const system = getSystemPersona(this);
  const events = await system.filterEventsByType(eventType);
  expect(events.length).toBe(expectedCount);
});

Then('the most recent {string} event should have {int} queued tasks', async function (
  this: CustomWorld,
  eventType: string,
  expectedQueueCount: number
) {
  const system = getSystemPersona(this);
  const events = await system.filterEventsByType(eventType);
  expect(events.length).toBeGreaterThan(0);

  const lastEvent = events[events.length - 1];
  const eventData = lastEvent.data as Record<string, unknown>;
  const queue = (eventData.queue as unknown[]) || [];

  expect(queue.length).toBe(expectedQueueCount);
});

async function getTaskState(world: CustomWorld) {
  world.setStateReturn(undefined, "getTaskState");
  const system = getSystemPersona(world);
  const state = await system.getTaskState();
  world.setStateReturn(state, "getTaskState");
  return state;
}

When('I attempt to get the background task state', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await getTaskState(this); });
});

async function cancelActiveTask(world: CustomWorld) {
  world.setStateReturn(undefined, "cancelActiveTask");
  const system = getSystemPersona(world);
  const result = await system.cancelActiveTask();
  world.setStateReturn(result, "cancelActiveTask");
  return result;
}

When('I cancel the active background task', async function (this: CustomWorld) {
  await cancelActiveTask(this);
});

When('I attempt to cancel the active background task', async function (this: CustomWorld) {
  await attemptAsync(this, async() => { await cancelActiveTask(this); });
});

async function removeQueuedTask(world: CustomWorld) {
  world.setStateReturn(undefined, "removeQueuedTask");
  const system = getSystemPersona(world);
  const taskState = await system.getTaskState();
  const state = taskState as { active: unknown; queue: Array<{ id: string; }>; };
  if (state.queue && state.queue.length > 0) {
    const taskToRemove = state.queue[0];
    const removeResult = await system.removeQueuedTask(taskToRemove.id);
    world.setStateReturn(removeResult, "removeQueuedTask");
    return removeResult;
  }
  throw new Error('No queued tasks to remove');
}

When('I remove the queued background task', async function (this: CustomWorld) {
  await removeQueuedTask(this);
});

When('I attempt to remove the queued background task', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await removeQueuedTask(this); });
});

Then('the background task state should contain the active task', async function (this: CustomWorld) {
  const state = this.getStateReturn("getTaskState");

  expect(state).toBeDefined();
  expect(state).toHaveProperty('active');
  expect(state).toHaveProperty('queue');
});

Then('the active background task should be cancelled', async function (this: CustomWorld) {
  const result = this.getStateReturn("cancelActiveTask") as Record<string, unknown> | undefined;
  expect(result).toBeDefined();
  expect((result as any)?.success).toBe(true);
});

Then('the queued background task should be removed successfully', async function (this: CustomWorld) {
  const result = this.getStateReturn("removeQueuedTask") as Record<string, unknown> | undefined;
  expect(result).toBeDefined();
  expect((result as any)?.success).toBe(true);
});

