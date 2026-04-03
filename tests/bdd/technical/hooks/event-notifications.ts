/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import { withTestHooks } from '../infrastructure/utils';

/**
 * API layer for exposing event notification functionality in the electron app to Cucumber tests.
 */
export class EventNotifications {
  private app: ElectronApplication;

  constructor(app: ElectronApplication) {
    this.app = app;
  }

  /**
   * Clear all recorded events
   */
  async clearRecordedEvents(): Promise<void> {
    return await withTestHooks(this.app, async (hooks) => {
      hooks.eventNotifications.clearRecordedEvents();
    });
  }

  /**
   * Get all recorded events
   */
  async getRecordedEvents(): Promise<Array<{ type: string; data: unknown; timestamp: number }>> {
    return await withTestHooks(this.app, async (hooks) => {
      return hooks.eventNotifications.getRecordedEvents();
    });
  }

  /**
   * Find the first event of a given type
   */
  async findEventByType(type: string): Promise<{ type: string; data: unknown; timestamp: number } | undefined> {
    return await withTestHooks(this.app, async (hooks, type) => {
      return hooks.eventNotifications.findEventByType(type);
    }, type);
  }

  /**
   * Get all events of a given type
   */
  async filterEventsByType(type: string): Promise<Array<{ type: string; data: unknown; timestamp: number }>> {
    return await withTestHooks(this.app, async (hooks, type) => {
      return hooks.eventNotifications.filterEventsByType(type);
    }, type);
  }

  /**
   * Set up event recording for testing
   */
  async setupEventRecording(): Promise<void> {
    return await withTestHooks(this.app, async (hooks) => {
      hooks.eventNotifications.setupEventRecording();
    });
  }

  /**
   * Get the count of events of a given type
   */
  async getEventCount(type: string): Promise<number> {
    const events = await this.filterEventsByType(type);
    return events.length;
  }
}
