import { AppApi } from '../types';

export class IpcAppApi implements AppApi {
  private ipc: any;
  constructor(ipc: any) { this.ipc = ipc; }

  getAppVersion() { return this.ipc.getAppVersion(); }
  getServerPort() { return this.ipc.getServerPort(); }
  openSettings() { return this.ipc.openSettings(); }
}
