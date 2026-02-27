/* eslint-disable @typescript-eslint/no-var-requires */

function waitFor(cond: () => boolean, timeout = 2000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function poll() {
      try {
        if (cond()) return resolve();
      } catch (e) {
        return reject(e);
      }
      if (Date.now() - start > timeout) return reject(new Error('timeout'));
      setTimeout(poll, 20);
    })();
  });
}

function makeMockTask(duration = 100, supportsCancel = false) {
  return class {
    static get label() {
      return 'Mock Task';
    }
    async runTask(_args: Record<string, unknown>, context: any) {
      context.reportProgress({ current: 0, max: 2, description: 'start' });
      const start = Date.now();
      while (Date.now() - start < duration) {
        if (supportsCancel && context.isCancelled()) return;
        // small delay
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 10));
      }
      context.reportProgress({ current: 2, max: 2, description: 'done' });
    }
  };
}

describe('background-task-manager', () => {
  jest.setTimeout(10000);

  beforeEach(() => {
    jest.resetModules();
  });

  test('enqueue starts and completes a task', async () => {
    const MockA = makeMockTask(50, false);
    jest.doMock('../../../src/main/tasks/task-registry', () => ({ TASK_REGISTRY: { 'test-a': MockA } }));
    const manager = require('../../../src/main/background-task-manager');
    const states: any[] = [];
    manager.setNotifyFn((s: any) => states.push(s));

    const res = manager.enqueue('test-a', {});
    expect(res.success).toBe(true);
    expect(res.taskId).toBeDefined();

    await waitFor(() => states.some((st) => st.queue.length === 0 && st.active === null), 3000);

    const hadRunning = states.some((st) => st.active && st.active.status === 'running');
    const hadCompleted = states.some((st) => st.active && st.active.status === 'completed') || states.some((st) => st.active === null && st.queue.length === 0);
    expect(hadRunning).toBe(true);
    expect(hadCompleted).toBe(true);
  });

  test('cancelActive sets active to cancelled', async () => {
    const MockB = makeMockTask(200, true);
    jest.doMock('../../../src/main/tasks/task-registry', () => ({ TASK_REGISTRY: { 'test-b': MockB } }));
    const manager = require('../../../src/main/background-task-manager');
    const states: any[] = [];
    manager.setNotifyFn((s: any) => states.push(s));

    const res = manager.enqueue('test-b', {});
    expect(res.success).toBe(true);

    // give it a moment to start
    await new Promise((r) => setTimeout(r, 50));
    const cancelRes = manager.cancelActive();
    expect(cancelRes.success).toBe(true);

    await waitFor(() => states.some((st) => st.active && st.active.status === 'cancelled'), 2000);
    const hadCancelled = states.some((st) => st.active && st.active.status === 'cancelled');
    expect(hadCancelled).toBe(true);
  });

  test('removeQueued removes a queued task', async () => {
    const MockA2 = makeMockTask(200, true);
    const MockB2 = makeMockTask(200, true);
    jest.doMock('../../../src/main/tasks/task-registry', () => ({ TASK_REGISTRY: { 'test-a': MockA2, 'test-b': MockB2 } }));
    const manager = require('../../../src/main/background-task-manager');
    const states: any[] = [];
    manager.setNotifyFn((s: any) => states.push(s));

    const r1 = manager.enqueue('test-a', {});
    expect(r1.success).toBe(true);
    const r2 = manager.enqueue('test-b', {});
    expect(r2.success).toBe(true);

    // ensure second is queued
    await waitFor(() => manager.getState().queue.length >= 1, 1000);
    const queued = manager.getState().queue.map((q: any) => q.id);
    expect(queued).toContain(r2.taskId);

    const removeRes = manager.removeQueued(r2.taskId as string);
    expect(removeRes.success).toBe(true);
    const q2 = manager.getState().queue.map((q: any) => q.id);
    expect(q2).not.toContain(r2.taskId);
  });
});
