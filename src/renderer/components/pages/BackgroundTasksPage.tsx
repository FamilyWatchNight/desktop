/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import log from 'electron-log/renderer';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createApiClient } from '../../api-client';
import '../../styles/components/BackgroundTasksPage.scss';
import { Button } from '../elements/buttons';
import { Card, Page, Section, Stack } from '../elements/containers';
import { ProgressBar } from '../elements/feedback';

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
  const { t } = useTranslation('backgroundTasks');
  const [active, setActive] = useState<TaskPayload | null>(null);
  const [queue, setQueue] = useState<TaskPayload[]>([]);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const state = await apiClient.backgroundTasks.getBackgroundTasks();
        if (state) {
          setActive(state.active as TaskPayload);
          setQueue((state.queue as TaskPayload[]) ?? []);
        }
      } catch (err) {
        log.error('Failed to load background tasks:', err);
      }
    }
    void load();
    const unsubscribe = apiClient.backgroundTasks.onBackgroundTaskUpdate(
      (state: { active: unknown; queue: unknown[] }) => {
        setActive(state.active as TaskPayload);
        setQueue((state.queue as TaskPayload[]) ?? []);
      },
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const progressPercent =
    active && active.current !== undefined && active.max
      ? Math.min(100, Math.round((active.current / active.max) * 100))
      : null;
  const isIndeterminate = progressPercent === null;

  const cancelActiveTask = async (): Promise<void> => {
    try {
      const result = (await apiClient.backgroundTasks.cancelActiveBackgroundTask()) as
        | { success?: boolean; error?: string }
        | undefined;
      if (!result?.success) log.error('Failed to cancel active task:', result?.error);
    } catch (err) {
      log.error('Error cancelling task:', err);
    }
  };

  const removeQueuedTask = async (taskId: string): Promise<void> => {
    try {
      const result = (await apiClient.backgroundTasks.removeQueuedBackgroundTask(taskId)) as
        | { success?: boolean; error?: string }
        | undefined;
      if (!result?.success) log.error('Failed to remove queued task:', result?.error);
    } catch (err) {
      log.error('Error removing task:', err);
    }
  };

  return (
    <Page centered testId="page-background-tasks" title={t('title')}>
      <Section title={t('activeTask')} testId="background-tasks-active-section">
        {active ? (
          <Card gloss="flat" title={active.label}>
            <div data-testid="background-tasks-active-task-step">
              {active.description ?? t('working')}
            </div>
            <ProgressBar
              isIndeterminate={isIndeterminate}
              max={active.max}
              current={active.current}
              showLabel={false}
            />
            <div data-testid="background-tasks-progress-text">
              {isIndeterminate
                ? t('inProgress')
                : t('percentComplete', { percent: progressPercent })}
            </div>
            <Button
              variant="danger"
              size="small"
              data-testid="background-tasks-cancel-button"
              onClick={cancelActiveTask}
            >
              {t('button.cancel', { ns: 'common' })}
            </Button>
          </Card>
        ) : (
          <Card gloss="flat">{t('noActive')}</Card>
        )}
      </Section>
      <Section title={t('queuedTasks')} testId="background-tasks-queued-section">
        {queue.length > 0 ? (
          <Stack direction="column">
            {queue.map((task) => (
              <Card
                key={task.id}
                className="queued-item"
                gloss="flat"
                testId={`background-tasks-queued-item-${task.id}`}
              >
                <span
                  className="queued-item-label"
                  data-testid={`background-tasks-queued-item-label-${task.id}`}
                >
                  {task.label}
                </span>
                <Button
                  variant="danger"
                  size="small"
                  testId={`background-tasks-remove-queued-task-${task.id}`}
                  onClick={() => removeQueuedTask(task.id)}
                  aria-label={t('button.removeTask') + ' ' + task.label}
                >
                  {t('button.removeTask')}
                </Button>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card gloss="flat">{t('noneQueued')}</Card>
        )}
      </Section>
    </Page>
  );
}
