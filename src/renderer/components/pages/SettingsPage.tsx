/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createApiClient } from '../../api-client';
import { Form, NumberInput, TextInput } from '../elements/form';
import type { FormContextValue } from '../elements/form/Form';
import { Page, Section } from '../elements/layout';

const apiClient = createApiClient();

interface TaskPayload {
  id: string;
  type: string;
  label: string;
  status: string;
}

interface SettingsFormValues {
  webPort?: unknown;
  watchmodeApiKey?: unknown;
  tmdbApiKey?: unknown;
}

export default function SettingsPage(): React.ReactElement {
  const { t } = useTranslation('settings');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [backgroundTaskMessage, setBackgroundTaskMessage] = useState('');
  const [activeTask, setActiveTask] = useState<TaskPayload | null>(null);
  const [queue, setQueue] = useState<TaskPayload[]>([]);
  const formContextRef = useRef<FormContextValue | null>(null);
  const [initialValues, setInitialValues] = useState<SettingsFormValues | null>(null);

  useEffect(() => {
    async function loadSettings(): Promise<void> {
      const result = (await apiClient.settings.loadSettings()) as SettingsFormValues | undefined;
      setInitialValues(result || {});
    }
    void loadSettings();
  }, []);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const state = await apiClient.backgroundTasks.getBackgroundTasks();
        setActiveTask((state?.active as TaskPayload) ?? null);
        setQueue((state?.queue as TaskPayload[]) ?? []);
      } catch {
        setActiveTask(null);
        setQueue([]);
      }
    }
    void load();
    const unsub = apiClient.backgroundTasks.onBackgroundTaskUpdate((state) => {
      setActiveTask((state?.active as TaskPayload) ?? null);
      setQueue((state?.queue as TaskPayload[]) ?? []);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const showMessage = (message: string, type: string): void => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const saveSettings = async (): Promise<void> => {
    if (!formContextRef.current) {
      showMessage(t('errorSave') + 'Form context is unavailable', 'error');
      return;
    }

    try {
      const settings = formContextRef.current.getValues();

      await apiClient.settings.saveSettings(settings);
      showMessage(t('saved'), 'success');
      setTimeout(() => {
        setStatusMessage('');
        setStatusType('');
      }, 3000);
    } catch (error) {
      showMessage(
        t('errorSave') + (error instanceof Error ? error.message : String(error)),
        'error',
      );
      setTimeout(() => {
        setStatusMessage('');
        setStatusType('');
      }, 5000);
    }
  };

  const enqueueBackgroundTask = async (taskType: string): Promise<void> => {
    try {
      const result = (await apiClient.backgroundTasks.enqueueBackgroundTask(taskType)) as
        | { success?: boolean; error?: string }
        | undefined;
      if (result?.success) {
        setBackgroundTaskMessage(t('taskQueued'));
        setTimeout(() => setBackgroundTaskMessage(''), 4000);
      } else {
        setBackgroundTaskMessage(result?.error ?? t('failedQueue'));
        setTimeout(() => setBackgroundTaskMessage(''), 5000);
      }
    } catch (err) {
      setBackgroundTaskMessage(
        'Error: ' + (err instanceof Error ? err.message : 'Could not queue task'),
      );
      setTimeout(() => setBackgroundTaskMessage(''), 5000);
    }
  };

  const handleCancel = (): void => {
    // Reset the form to the last-provided initialValues recorded by the
    // Form context. Do not re-fetch from the service — the caller expects
    // Cancel to be handled locally by the Form.reset() behavior.
    formContextRef.current?.reset?.();
    setStatusMessage('');
    setStatusType('');
  };

  return (
    <Page centered title={t('title')} testId="page-settings">
      <Form
        testId="settings-form"
        formContextRef={formContextRef}
        initialValues={initialValues as Record<string, unknown> | undefined}
        isReady={!!initialValues}
      >
        <Section testId="settings-form-section">
          <NumberInput
            id="settings-webport-input"
            name="webPort"
            label={t('webPort')}
            defaultValue={3000}
            testId="settings-webport-input"
          />
          <TextInput
            id="settings-watchmode-api-key-input"
            name="watchmodeApiKey"
            label={t('watchmodeApiKey')}
            placeholder=""
            testId="settings-watchmode-api-key-input"
          />
          <TextInput
            id="settings-tmdb-api-key-input"
            name="tmdbApiKey"
            label={t('tmdbApiKey')}
            placeholder=""
            testId="settings-tmdb-api-key-input"
          />
        </Section>
        <Section title={t('backgroundTasks')} testId="settings-background-tasks-section">
          <div className="form-group">
            <div className="button-group">
              <button
                type="button"
                className="btn-secondary"
                data-testid="settings-import-watchmode-button"
                onClick={() => enqueueBackgroundTask('import-watchmode')}
                disabled={
                  activeTask?.type === 'import-watchmode' ||
                  queue.some((t) => t.type === 'import-watchmode')
                }
              >
                {t('importWatchmode')}
              </button>
              <button
                type="button"
                className="btn-secondary"
                data-testid="settings-import-tmdb-button"
                onClick={() => enqueueBackgroundTask('import-tmdb')}
                disabled={
                  activeTask?.type === 'import-tmdb' || queue.some((t) => t.type === 'import-tmdb')
                }
              >
                {t('importTmdb')}
              </button>
            </div>
            {backgroundTaskMessage && (
              <div className="message success" data-testid="settings-background-task-message">
                {backgroundTaskMessage}
              </div>
            )}
          </div>
        </Section>
        <div className="button-group">
          <button
            type="button"
            className="btn-primary"
            data-testid="settings-save-button"
            onClick={saveSettings}
          >
            {t('save')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            data-testid="settings-cancel-button"
            onClick={handleCancel}
          >
            {t('button.cancel', { ns: 'common' })}
          </button>
        </div>
        {statusMessage && (
          <div className={`message ${statusType}`} data-testid="settings-status-message">
            {statusMessage}
          </div>
        )}
      </Form>
    </Page>
  );
}
