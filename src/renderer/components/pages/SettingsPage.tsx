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
  const [initialValues, setInitialValues] = useState<SettingsFormValues>({
    webPort: '3000',
    watchmodeApiKey: '',
    tmdbApiKey: '',
  });

  useEffect(() => {
    async function loadSettings(): Promise<void> {
      const result = await apiClient.settings.loadSettings();
      setInitialValues({
        webPort: result.webPort != null ? String(result.webPort) : '3000',
        watchmodeApiKey: result.watchmodeApiKey != null ? String(result.watchmodeApiKey) : '',
        tmdbApiKey: result.tmdbApiKey != null ? String(result.tmdbApiKey) : '',
      });
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
      const values = formContextRef.current.getValues();
      const settings: Record<string, unknown> = {
        webPort:
          typeof values.webPort === 'string' && values.webPort.length > 0
            ? parseInt(values.webPort, 10)
            : 3000,
        watchmodeApiKey: values.watchmodeApiKey != null ? String(values.watchmodeApiKey) : '',
        tmdbApiKey: values.tmdbApiKey != null ? String(values.tmdbApiKey) : '',
      };

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
    async function load(): Promise<void> {
      const result = await apiClient.settings.loadSettings();
      setInitialValues({
        webPort: result.webPort != null ? String(result.webPort) : '3000',
        watchmodeApiKey: result.watchmodeApiKey != null ? String(result.watchmodeApiKey) : '',
        tmdbApiKey: result.tmdbApiKey != null ? String(result.tmdbApiKey) : '',
      });
    }
    void load();
    setStatusMessage('');
    setStatusType('');
  };

  return (
    <Page centered title={t('title')} testId="page-settings">
      <Form
        key={`settings-form-${String(initialValues.webPort)}-${String(
          initialValues.watchmodeApiKey,
        )}-${String(initialValues.tmdbApiKey)}`}
        testId="settings-form"
        formContextRef={formContextRef}
      >
        <Section testId="settings-form-section">
          <NumberInput
            id="settings-webport-input"
            name="webPort"
            label={t('webPort')}
            placeholder="3000"
            defaultValue={initialValues.webPort as string}
            testId="settings-webport-input"
          />
          <TextInput
            id="settings-watchmode-api-key-input"
            name="watchmodeApiKey"
            label={t('watchmodeApiKey')}
            placeholder=""
            defaultValue={initialValues.watchmodeApiKey as string}
            testId="settings-watchmode-api-key-input"
          />
          <TextInput
            id="settings-tmdb-api-key-input"
            name="tmdbApiKey"
            label={t('tmdbApiKey')}
            placeholder=""
            defaultValue={initialValues.tmdbApiKey as string}
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
