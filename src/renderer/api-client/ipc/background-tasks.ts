import { BackgroundTaskApi } from '../types';

export class IpcBackgroundTaskApi implements BackgroundTaskApi {
  private ipc: any;
  constructor(ipc: any) { this.ipc = ipc; }

  enqueueBackgroundTask(taskType: string, args?: Record<string, unknown>) { return this.ipc.enqueueBackgroundTask(taskType, args); }
  getBackgroundTasks() { return this.ipc.getBackgroundTasks(); }
  cancelActiveBackgroundTask() { return this.ipc.cancelActiveBackgroundTask(); }
  removeQueuedBackgroundTask(taskId: string) { return this.ipc.removeQueuedBackgroundTask(taskId); }
  onBackgroundTaskUpdate(callback: (state: { active: unknown; queue: unknown[] }) => void) { return this.ipc.onBackgroundTaskUpdate(callback); }
}
