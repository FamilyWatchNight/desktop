/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

interface AttemptRecord {
  count: number;
  windowStartedAt: number;
}

export interface LoginRateLimiterOptions {
  limit?: number;
  windowMs?: number;
}

export const DEFAULT_LOGIN_ATTEMPT_LIMIT = 10;
export const DEFAULT_LOGIN_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;

/** Limits credential attempts independently for each transport client. */
export class LoginRateLimiter {
  private readonly attempts = new Map<string, AttemptRecord>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(
    options: LoginRateLimiterOptions = {},
    private readonly now: () => number = Date.now,
  ) {
    this.limit = options.limit ?? DEFAULT_LOGIN_ATTEMPT_LIMIT;
    this.windowMs = options.windowMs ?? DEFAULT_LOGIN_ATTEMPT_WINDOW_MS;

    if (!Number.isSafeInteger(this.limit) || this.limit < 1) {
      throw new RangeError('limit must be a positive safe integer');
    }
    if (!Number.isSafeInteger(this.windowMs) || this.windowMs < 1) {
      throw new RangeError('windowMs must be a positive safe integer');
    }
  }

  allow(key: string): boolean {
    const timestamp = this.now();
    const record = this.attempts.get(key);
    if (!record || timestamp - record.windowStartedAt >= this.windowMs) {
      this.attempts.set(key, { count: 1, windowStartedAt: timestamp });
      return true;
    }
    if (record.count >= this.limit) return false;
    record.count += 1;
    return true;
  }

  clear(): void {
    this.attempts.clear();
  }
}
