import { AppApi } from '../types';
import { callApi } from './utils';

export class HttpAppApi implements AppApi {
  getAppVersion() { return callApi('/api/version'); }
  getAppLocale() { return callApi('/api/locale'); }
  getServerPort() { return Promise.resolve(window.location.port ? Number(window.location.port) : 80); }
}
