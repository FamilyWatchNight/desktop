/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { ElectronApplication } from 'playwright';
import type { TestHooks } from '../../../src/main/testing-active/TestHooksImpl';

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
      fnArgs: args,
    }
  );
}