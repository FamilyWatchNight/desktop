import { SettingsApi } from '../types';

export class IpcSettingsApi implements SettingsApi {
  private ipc: any;
  constructor(ipc: any) { this.ipc = ipc; }

  getAppVersion() { return this.ipc.getAppVersion(); }
  getServerPort() { return this.ipc.getServerPort(); }
  openSettings() { return this.ipc.openSettings(); }
  loadSettings() { return this.ipc.loadSettings(); }
  saveSettings(settings: Record<string, unknown>) { return this.ipc.saveSettings(settings); }
  onSettingsSaved(callback: () => void) { return this.ipc.onSettingsSaved(callback); }
}
