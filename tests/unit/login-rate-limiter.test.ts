/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { describe, expect, test } from '@jest/globals';

import { LoginRateLimiter } from '../../src/main/auth/login-rate-limiter';

describe('LoginRateLimiter', () => {
  test('allows attempts up to the configured limit', () => {
    const limiter = new LoginRateLimiter({ limit: 2, windowMs: 1_000 });

    expect(limiter.allow('client-a')).toBe(true);
    expect(limiter.allow('client-a')).toBe(true);
    expect(limiter.allow('client-a')).toBe(false);
  });

  test('isolates attempts by client key', () => {
    const limiter = new LoginRateLimiter({ limit: 1, windowMs: 1_000 });

    expect(limiter.allow('client-a')).toBe(true);
    expect(limiter.allow('client-b')).toBe(true);
    expect(limiter.allow('client-a')).toBe(false);
  });

  test('allows attempts again after the window expires', () => {
    let now = 1_000;
    const limiter = new LoginRateLimiter({ limit: 1, windowMs: 1_000 }, () => now);

    expect(limiter.allow('client-a')).toBe(true);
    expect(limiter.allow('client-a')).toBe(false);

    now += 1_000;
    expect(limiter.allow('client-a')).toBe(true);
  });

  test('clear removes all client attempt records', () => {
    const limiter = new LoginRateLimiter({ limit: 1, windowMs: 1_000 });

    expect(limiter.allow('client-a')).toBe(true);
    limiter.clear();

    expect(limiter.allow('client-a')).toBe(true);
  });

  test('rejects invalid limiter configuration', () => {
    expect(() => new LoginRateLimiter({ limit: 0 })).toThrow(RangeError);
    expect(() => new LoginRateLimiter({ windowMs: 0 })).toThrow(RangeError);
  });
});
