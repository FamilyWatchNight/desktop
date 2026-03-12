/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation( 'backgroundTasks' );
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
        <h1 className="page-title">{t('title')}</h1>
        <section className="section">
          <h2 className="section-title">{t('activeTask')}</h2>
          {active ? (
            <div className="active-task">
              <div className="active-task-label">{active.label}</div>
              <div className="active-task-step">{active.description ?? t('working')}</div>
              <div className="progress-bar-wrap">
                <div className={`progress-bar-fill ${isIndeterminate ? 'indeterminate' : ''}`} style={isIndeterminate ? {} : { width: `${progressPercent}%` }} />
              </div>
              <div className="progress-text">{isIndeterminate ? t('inProgress') : t('percentComplete', { percent: progressPercent })}</div>
              <button type="button" className="btn-danger" onClick={cancelActiveTask}>{t('button.cancel', { ns: 'common' })}</button>
            </div>
          ) : (
            <div className="no-active-task">{t('noActive')}</div>
          )}
        </section>
        <section className="section">
          <h2 className="section-title">{t('queuedTasks')}</h2>
          {queue.length > 0 ? (
            <ul className="queued-list">
              {queue.map((task) => (
                <li key={task.id} className="queued-item">
                  <span className="queued-item-label">{task.label}</span>
                  <button type="button" className="btn-danger" onClick={() => removeQueuedTask(task.id)} aria-label={t('button.removeTask') + ' ' + task.label}>{t('button.removeTask')}</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-queued-tasks">{t('noneQueued')}</div>
          )}
        </section>
      </div>
    </div>
  );
}
