import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

test('db is connected', async () => {
  const debugArgs = process.env.PWDEBUG ? ['--inspect=9229'] : [];
  const app = await electron.launch({ args: ['.', ...debugArgs] });
  const window = await app.firstWindow();

  window.on('console', (msg) => {
    console.log('[renderer]', msg.text());
  });

  const status = await window.evaluate(async () => {
    return await (window as unknown as { testApi: { db: { getStatus: () => Promise<{ dbConnected: boolean }> } } }).testApi.db.getStatus();
  });

  expect(status.dbConnected).toBe(true);

  const search = await window.evaluate(async () => {
    return (window as unknown as { electron: { movies: { searchByTitle: (q: string) => Promise<{ success: boolean; data: unknown[] }> } } }).electron.movies.searchByTitle('sd;flas;dflkj This movie should not exist');
  });

  expect(search.success).toBe(true);
  expect(search.data.length).toBe(0);

  await app.close();
});
