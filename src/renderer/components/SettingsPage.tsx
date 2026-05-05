/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createApiClient } from '../api-client';
import log from 'electron-log/renderer';

const apiClient = createApiClient();

interface TaskPayload {
  id: string;
  type: string;
  label: string;
  status: string;
}

export default function SettingsPage(): React.ReactElement {
  const { t } = useTranslation( 'settings' );
  const [webPort, setWebPort] = useState('3000');
  const [watchmodeApiKey, setWatchmodeApiKey] = useState('');
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [backgroundTaskMessage, setBackgroundTaskMessage] = useState('');
  const [activeTask, setActiveTask] = useState<TaskPayload | null>(null);
  const [queue, setQueue] = useState<TaskPayload[]>([]);

  useEffect(() => {
    async function loadSettings(): Promise<void> {
      try {
        const result = await apiClient.settings.loadSettings();
        if (result?.success && result.data) {
          if (result.data.webPort != null) setWebPort(String(result.data.webPort));
          if (result.data.watchmodeApiKey != null) setWatchmodeApiKey(String(result.data.watchmodeApiKey));
          if (result.data.tmdbApiKey != null) setTmdbApiKey(String(result.data.tmdbApiKey));
        }
      } catch (error) {
        log.error('Failed to load settings:', error);
      }
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
      setActiveTask(state?.active as TaskPayload ?? null);
      setQueue(state?.queue as TaskPayload[] ?? []);
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  const showMessage = (message: string, type: string): void => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const saveSettings = async (): Promise<void> => {
    const settings = { webPort: parseInt(webPort, 10), watchmodeApiKey, tmdbApiKey };
    try {
      const result = await apiClient.settings.saveSettings(settings);
      if (result?.success) {
        showMessage(t('saved'), 'success');
        setTimeout(() => { setStatusMessage(''); setStatusType(''); }, 3000);
      }
    } catch (error) {
      showMessage(t('errorSave') + (error instanceof Error ? error.message : String(error)), 'error');
      setTimeout(() => { setStatusMessage(''); setStatusType(''); }, 5000);
    }
  };

  const enqueueBackgroundTask = async (taskType: string): Promise<void> => {
    try {
      const result = await apiClient.backgroundTasks.enqueueBackgroundTask(taskType) as { success?: boolean; error?: string } | undefined;
      if (result?.success) {
        setBackgroundTaskMessage(t('taskQueued'));
        setTimeout(() => setBackgroundTaskMessage(''), 4000);
      } else {
        setBackgroundTaskMessage(result?.error ?? t('failedQueue'));
        setTimeout(() => setBackgroundTaskMessage(''), 5000);
      }
    } catch (err) {
      setBackgroundTaskMessage('Error: ' + (err instanceof Error ? err.message : 'Could not queue task'));
      setTimeout(() => setBackgroundTaskMessage(''), 5000);
    }
  };

  const handleCancel = (): void => {
    async function load(): Promise<void> {
      try {
        const result = await apiClient.settings.loadSettings();
        if (result?.success && result.data) {
          if (result.data.webPort != null) setWebPort(String(result.data.webPort));
          if (result.data.watchmodeApiKey != null) setWatchmodeApiKey(String(result.data.watchmodeApiKey));
          if (result.data.tmdbApiKey != null) setTmdbApiKey(String(result.data.tmdbApiKey));
        }
      } catch (error) {
        log.error('Failed to load settings:', error);
      }
    }
    void load();
    setStatusMessage('');
    setStatusType('');
  };

  return (
    <div className="page centered" data-testid="page-settings">
      <div className="page-container">
        <h1 className="page-title">{t('title')}</h1>
        <div className="form-group">
          <label htmlFor="webPort" data-testid="settings-webport-label">{t('webPort')}</label>
          <input type="number" id="webPort" data-testid="settings-webport-input" placeholder="3000" value={webPort} onChange={(e) => setWebPort(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="watchmodeApiKey" data-testid="settings-watchmode-api-key-label">{t('watchmodeApiKey')}</label>
          <input type="password" id="watchmodeApiKey" data-testid="settings-watchmode-api-key-input" placeholder="" value={watchmodeApiKey} onChange={(e) => setWatchmodeApiKey(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="tmdbApiKey" data-testid="settings-tmdb-api-key-label">{t('tmdbApiKey')}</label>
          <input id="tmdbApiKey" data-testid="settings-tmdb-api-key-input" placeholder="" value={tmdbApiKey} onChange={(e) => setTmdbApiKey(e.target.value)} />
        </div>
        <div className="form-group">
          <label data-testid="settings-background-tasks-label">{t('backgroundTasks')}</label>
          <div className="button-group">
            <button type="button" className="btn-secondary" data-testid="settings-import-watchmode-button" onClick={() => enqueueBackgroundTask('import-watchmode')} disabled={activeTask?.type === 'import-watchmode' || queue.some((t) => t.type === 'import-watchmode')}>{t('importWatchmode')}</button>
            <button type="button" className="btn-secondary" data-testid="settings-import-tmdb-button" onClick={() => enqueueBackgroundTask('import-tmdb')} disabled={activeTask?.type === 'import-tmdb' || queue.some((t) => t.type === 'import-tmdb')}>{t('importTmdb')}</button>
          </div>
          {backgroundTaskMessage && <div className="message success" data-testid="settings-background-task-message">{backgroundTaskMessage}</div>}
        </div>
        <div className="button-group">
          <button className="btn-primary" data-testid="settings-save-button" onClick={saveSettings}>{t('save')}</button>
          <button className="btn-secondary" data-testid="settings-cancel-button" onClick={handleCancel}>{t('button.cancel', { ns: 'common' })}</button>
        </div>
        {statusMessage && <div className={`message ${statusType}`} data-testid="settings-status-message">{statusMessage}</div>}
      </div>
    </div>
  );
}
