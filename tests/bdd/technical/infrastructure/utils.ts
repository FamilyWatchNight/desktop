/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import type { TestHooks } from '../../../../src/main/testing-active/TestHooksImpl';
import { CustomWorld } from './world';


export interface SerializedError {
  name: string;
  message: string;
}

function normalizeTestHookArg(value: unknown): unknown {
  if (Buffer.isBuffer(value)) {
    return Uint8Array.from(value);
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeTestHookArg);
  }

  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, normalizeTestHookArg(entryValue)])
    );
  }

  return value;
}

export function parseSerializedError(error: unknown): SerializedError | null {
  if (error instanceof Error) {
    const firstLine = error.message.split('\n')[0];
    if (firstLine.startsWith('electronApplication.evaluate: Error: ')) {
      const jsonPart = firstLine.replace('electronApplication.evaluate: Error: ', '');
      try {
        return JSON.parse(jsonPart) as SerializedError;
      } catch {
        return null
      }
    }
  }

  return null;
}

/**
 * Helper that executes a callback inside the electron app with access to test hooks.
 * All of the repeated casting/validation logic lives here so callers can remain concise.
 */
export async function withTestHooks<T, A extends unknown[]>(
  app: ElectronApplication,
  fn: (hooks: TestHooks, ...args: A) => Promise<T> | T,
  ...args: A
): Promise<T> {
  const fnString = fn.toString();
  const normalizedArgs = args.map(normalizeTestHookArg) as unknown[];

  return app.evaluate(
    async (
      { app },
      payload: { fnSource: string; fnArgs: unknown[] }
    ) => {
      const { fnSource, fnArgs } = payload;

      const appWithTestHooks = app as typeof app & {
        testHooks?: TestHooks;
      };

      if (!appWithTestHooks.testHooks) {
        throw new Error(
          'Test hooks not available. Run `npm run build:main:for-integration testing` and launch the app for testing with NODE_ENV=test.'
        );
      }

      const hookFn = eval(`(${fnSource})`);
      return hookFn(appWithTestHooks.testHooks, ...fnArgs);
    },
    {
      fnSource: fnString,
      fnArgs: normalizedArgs,
    }
  );
}

export async function attemptAsync(world: CustomWorld, fn: () => Promise<void>): Promise<void> {
  world.clearLastError();
  try {
    await fn();
  } catch (error) {
    const serialized = parseSerializedError(error);
    if (serialized) {
      world.setLastError(serialized);
    } else {
      world.setLastError(error);
    }
  }
}
