/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState, useEffect } from 'react';
import { createApiClient } from '../api-client';

const apiClient = createApiClient();

interface TaskPayload {
  id: string;
  type: string;
  label: string;
  status: string;
}

export default function SettingsPage(): React.ReactElement {
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
        console.error('Failed to load settings:', error);
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
        showMessage('Settings saved successfully!', 'success');
        setTimeout(() => { setStatusMessage(''); setStatusType(''); }, 3000);
      }
    } catch (error) {
      showMessage('Error saving settings: ' + (error instanceof Error ? error.message : String(error)), 'error');
      setTimeout(() => { setStatusMessage(''); setStatusType(''); }, 5000);
    }
  };

  const enqueueBackgroundTask = async (taskType: string): Promise<void> => {
    try {
      const result = await apiClient.backgroundTasks.enqueueBackgroundTask(taskType) as { success?: boolean; error?: string } | undefined;
      if (result?.success) {
        setBackgroundTaskMessage('Task queued. See System → Background Tasks.');
        setTimeout(() => setBackgroundTaskMessage(''), 4000);
      } else {
        setBackgroundTaskMessage(result?.error ?? 'Failed to queue task.');
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
        console.error('Failed to load settings:', error);
      }
    }
    void load();
    setStatusMessage('');
    setStatusType('');
  };

  return (
    <div className="page centered">
      <div className="page-container">
        <h1 className="page-title">Settings</h1>
        <div className="form-group">
          <label htmlFor="webPort">Web Server Port</label>
          <input type="number" id="webPort" placeholder="3000" value={webPort} onChange={(e) => setWebPort(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="watchmodeApiKey">Watchmode API Key</label>
          <input type="password" id="watchmodeApiKey" placeholder="" value={watchmodeApiKey} onChange={(e) => setWatchmodeApiKey(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="tmdbApiKey">TMDB API Key</label>
          <input type="password" id="tmdbApiKey" placeholder="" value={tmdbApiKey} onChange={(e) => setTmdbApiKey(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Background Tasks</label>
          <div className="button-group">
            <button type="button" className="btn-secondary" onClick={() => enqueueBackgroundTask('import-watchmode')} disabled={activeTask?.type === 'import-watchmode' || queue.some((t) => t.type === 'import-watchmode')}>Import Watchmode Database</button>
            <button type="button" className="btn-secondary" onClick={() => enqueueBackgroundTask('import-tmdb')} disabled={activeTask?.type === 'import-tmdb' || queue.some((t) => t.type === 'import-tmdb')}>Import TMDB Database</button>
          </div>
          {backgroundTaskMessage && <div className="message success">{backgroundTaskMessage}</div>}
        </div>
        <div className="button-group">
          <button className="btn-primary" onClick={saveSettings}>Save Settings</button>
          <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
        </div>
        {statusMessage && <div className={`message ${statusType}`}>{statusMessage}</div>}
      </div>
    </div>
  );
}
