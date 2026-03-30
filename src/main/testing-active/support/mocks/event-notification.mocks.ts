/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

/**
 * Mock event capture system for testing event broadcasts
 * Intercepts broadcasts to both IPC and HTTP to record what was sent
 */

let recordedEvents: Array<{ type: string; data: unknown; timestamp: number }> = [];

export function clearRecordedEvents(): void {
  recordedEvents = [];
}

export function recordEvent(type: string, data: unknown): void {
  recordedEvents.push({
    type,
    data: JSON.parse(JSON.stringify(data)), // Deep clone to capture state at that moment
    timestamp: Date.now(),
  });
}

export function getRecordedEvents(): Array<{ type: string; data: unknown; timestamp: number }> {
  return [...recordedEvents]; // Return copy to prevent external mutation
}

export function findEventByType(type: string): { type: string; data: unknown; timestamp: number } | undefined {
  return recordedEvents.find((e) => e.type === type);
}

export function filterEventsByType(
  type: string
): Array<{ type: string; data: unknown; timestamp: number }> {
  return recordedEvents.filter((e) => e.type === type);
}
