import { BackgroundTaskApi } from '../types';
import { callApi } from './utils';

export class HttpBackgroundTaskApi implements BackgroundTaskApi {
  enqueueBackgroundTask(taskType: string, args?: Record<string, unknown>) {
    return callApi('/api/background-tasks/enqueue', { method: 'POST', body: JSON.stringify({ type: taskType, args }) });
  }
  getBackgroundTasks() { return callApi('/api/background-tasks'); }
  cancelActiveBackgroundTask() { return callApi('/api/background-tasks/cancel-active', { method: 'POST' }); }
  removeQueuedBackgroundTask(taskId: string) { return callApi('/api/background-tasks/remove-queued', { method: 'POST', body: JSON.stringify({ taskId }) }); }
  onBackgroundTaskUpdate(_callback: (state: { active: unknown; queue: unknown[] }) => void) { console.warn('onBackgroundTaskUpdate not supported over HTTP'); return () => {}; }
}
