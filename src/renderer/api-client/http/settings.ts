import { SettingsApi } from '../types';
import { callApi } from './utils';
import log from 'electron-log/renderer';

export class HttpSettingsApi implements SettingsApi {
  loadSettings() { return callApi('/api/settings'); }
  saveSettings(settings: Record<string, unknown>) { return callApi('/api/settings', { method: 'POST', body: JSON.stringify(settings) }); }
  onSettingsSaved(_callback: () => void) { log.warn('onSettingsSaved not supported over HTTP'); return () => {}; }
}
