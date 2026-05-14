/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { AppApi } from '../types';

import { callApi } from './utils';

export class HttpAppApi implements AppApi {
  getAppVersion() {
    return callApi('/api/version');
  }
  getAppLocale() {
    return callApi('/api/locale');
  }
  getServerPort() {
    return Promise.resolve(window.location.port ? Number(window.location.port) : 80);
  }
  getLocaleFile(namespace: string, language: string): Promise<Record<string, string>> {
    return callApi(`/api/locale/get/${language}/${namespace}`);
  }
  saveMissingKey(
    namespace: string,
    language: string,
    key: string,
    fallbackValue: string,
  ): Promise<void> {
    return callApi('/api/locale/missing-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ namespace, language, key, fallbackValue }),
    });
  }
}
