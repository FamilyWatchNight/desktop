/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import BackgroundTask, { TaskContext } from '../../../tasks/BackgroundTask';

/**
 * Controllable mock background task for testing
 * Allows test framework to manipulate progress externally
 */
export class MockBackgroundTask implements BackgroundTask {
  static label = 'Mock Test Task';

  private supportsCancel: boolean;
  private _current: number = 0;
  private _max: number = 1;
  private _description: string = 'Mock task starting';
  private _isComplete: boolean = false;
  private _context?: TaskContext;

  constructor(supportsCancel: boolean = false) {
    this.supportsCancel = supportsCancel;
  }

  // Methods for test framework to control the task
  setProgress(current: number, max: number, description: string): void {
    this._current = current;
    this._max = max;
    this._description = description;
    // Report progress when values change
    if (this._context) {
      this._context.reportProgress({
        current: this._current,
        max: this._max,
        description: this._description
      });
    }
  }

  setDescription(description: string): void {
    this._description = description;
    // Report progress when description changes
    if (this._context) {
      this._context.reportProgress({
        current: this._current,
        max: this._max,
        description: this._description
      });
    }
  }

  setCurrent(current: number): void {
    this._current = current;
    // Report progress when current changes
    if (this._context) {
      this._context.reportProgress({
        current: this._current,
        max: this._max,
        description: this._description
      });
    }
  }

  setMax(max: number): void {
    this._max = max;
    // Report progress when max changes
    if (this._context) {
      this._context.reportProgress({
        current: this._current,
        max: this._max,
        description: this._description
      });
    }
  }

  complete(): void {
    this._isComplete = true;
  }

  async runTask(args: Record<string, unknown>, context: TaskContext): Promise<void> {
    // Use args to avoid TS6133 warning
    if (Object.keys(args).length > 0) {
      // no-op, args preserved for future enhancements
    }

    // Store context for helper methods to use
    this._context = context;

    // Initial progress report
    context.reportProgress({
      current: this._current,
      max: this._max,
      description: this._description
    });

    // Loop until complete, checking for external control
    while (!this._isComplete && this._current < this._max) {
      if (this.supportsCancel && context.isCancelled()) {
        return;
      }

      // Small delay to allow external control
      await new Promise((r) => setTimeout(r, 10));
    }

    // Final progress report
    context.reportProgress({
      current: this._max,
      max: this._max,
      description: this._description
    });
  }
}
