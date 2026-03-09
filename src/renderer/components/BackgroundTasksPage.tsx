/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState, useEffect } from 'react';
import { createApiClient } from '../api-client';
import '../styles/BackgroundTasksPage.css';

const apiClient = createApiClient();

interface TaskPayload {
  id: string;
  type: string;
  label: string;
  status: string;
  current?: number;
  max?: number;
  description?: string;
}

export default function BackgroundTasksPage(): React.ReactElement {
  const [active, setActive] = useState<TaskPayload | null>(null);
  const [queue, setQueue] = useState<TaskPayload[]>([]);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const state = await apiClient.backgroundTasks.getBackgroundTasks();
        if (state) {
          setActive(state.active as TaskPayload);
          setQueue(state.queue as TaskPayload[] ?? []);
        }
      } catch (err) {
        console.error('Failed to load background tasks:', err);
      }
    }
    void load();
    const unsubscribe = apiClient.backgroundTasks.onBackgroundTaskUpdate((state :{ active: unknown; queue: unknown[] }) => {
      setActive(state.active as TaskPayload);
      setQueue(state.queue as TaskPayload[] ?? []);
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const progressPercent = active && active.current !== undefined && active.max
    ? Math.min(100, Math.round((active.current / active.max) * 100))
    : null;
  const isIndeterminate = progressPercent === null;

  const cancelActiveTask = async (): Promise<void> => {
    try {
      const result = await apiClient.backgroundTasks.cancelActiveBackgroundTask() as { success?: boolean; error?: string } | undefined;
      if (!result?.success) console.error('Failed to cancel active task:', result?.error);
    } catch (err) {
      console.error('Error cancelling task:', err);
    }
  };

  const removeQueuedTask = async (taskId: string): Promise<void> => {
    try {
      const result = await apiClient.backgroundTasks.removeQueuedBackgroundTask(taskId) as { success?: boolean; error?: string } | undefined;
      if (!result?.success) console.error('Failed to remove queued task:', result?.error);
    } catch (err) {
      console.error('Error removing task:', err);
    }
  };

  return (
      <div className="page centered">
      <div className="page-container">
        <h1 className="page-title">Background Tasks</h1>
        <section className="section">
          <h2 className="section-title">Active Task</h2>
          {active ? (
            <div className="active-task">
              <div className="active-task-label">{active.label}</div>
              <div className="active-task-step">{active.description ?? 'Working...'}</div>
              <div className="progress-bar-wrap">
                <div className={`progress-bar-fill ${isIndeterminate ? 'indeterminate' : ''}`} style={isIndeterminate ? {} : { width: `${progressPercent}%` }} />
              </div>
              <div className="progress-text">{isIndeterminate ? 'In progress...' : `${progressPercent}% complete`}</div>
              <button type="button" className="btn-danger" onClick={cancelActiveTask}>Cancel Task</button>
            </div>
          ) : (
            <div className="no-active-task">No task running</div>
          )}
        </section>
        <section className="section">
          <h2 className="section-title">Queued Tasks</h2>
          {queue.length > 0 ? (
            <ul className="queued-list">
              {queue.map((t) => (
                <li key={t.id} className="queued-item">
                  <span className="queued-item-label">{t.label}</span>
                  <button type="button" className="btn-danger" onClick={() => removeQueuedTask(t.id)} aria-label={`Remove ${t.label}`}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-queued-tasks">No tasks queued</div>
          )}
        </section>
      </div>
    </div>
  );
}
