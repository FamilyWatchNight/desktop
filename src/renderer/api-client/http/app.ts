import { AppApi } from '../types';
import { callApi } from './utils';

export class HttpAppApi implements AppApi {
  getAppVersion() { return callApi('/api/version'); }
  getServerPort() { return Promise.resolve(window.location.port ? Number(window.location.port) : 80); }
  openSettings() { return Promise.reject(new Error('openSettings not available over HTTP')); }
}
