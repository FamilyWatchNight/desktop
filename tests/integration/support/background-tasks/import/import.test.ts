/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import type { ElectronApplication } from 'playwright';
import type { TestHooks } from '../../../../../src/main/testing-active/TestHooksImpl';

let app: ElectronApplication;

// helper that executes a callback inside the electron app with access to test hooks.
// all of the repeated casting/validation logic lives here so callers can remain concise.
async function withTestHooks<T, A extends unknown[]>(
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

test.beforeAll(async () => {
  const debugArgs = (!!process.env.PWDEBUG) ? ['--inspect-brk=9229'] : [];
  const ciArgs = (!!process.env.CI) ? ['--no-sandbox'] : [];
  app = await electron.launch({ args: ['.', ...debugArgs, ...ciArgs] });
  app.on('console', (msg) => {
    console.log('[app]', msg.text());
  });

  await withTestHooks(async (hooks) => {
    hooks.db.initMockDatabase();
    await hooks.data.loadStubWatchmodeData(
      './tests/test-double-data/watchmode/import/title_id_map.csv'
    );
    await hooks.data.loadStubTmdbData(
      './tests/test-double-data/tmdb/import/movie_ids.json'
    );
  });
});

test('should not throw errors', async () => {
  await withTestHooks((hooks) => {
    return {
      hasProcess: typeof process !== 'undefined',
      hasVersions: typeof (process as NodeJS.Process).versions,
      electron: (process as NodeJS.Process).versions?.electron,
      node: (process as NodeJS.Process).versions?.node,
      sandboxed: (process as NodeJS.Process & { sandboxed?: boolean }).sandboxed,
      hasRequire: typeof require,
      appPath: hooks.app.getAppPath(),
    };
  });
});

test('should have 23 movies in the database', async () => {
  const result = await withTestHooks(async (hooks) => {
    return hooks.movies.getAll();
  });

  expect(result.length).toBe(23);
});

test('should not have year value for TMDB ID 1622513', async () => {
  const result = await withTestHooks(async (hooks) => {
    return hooks.movies.getByTmdbId('1622513');
  });

  expect(result!.year).toBeNull();
});

test('should not have popularity value for Watchmode ID 11083261', async () => {
  const result = await withTestHooks(async (hooks) => {
    return hooks.movies.getByWatchmodeId('11083261');
  });

  expect(result!.popularity).toBeNull();
});

test.afterAll(async () => {
  await withTestHooks((hooks) => {
    hooks.db.closeDatabase();
  });

  await app.close();
});
