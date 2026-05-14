/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import path from 'path';

import { app } from 'electron';
import i18n from 'i18next';
import Backend from 'i18next-fs-backend';

let electronApp;
try {
  // Electron may not be available in unit tests
  electronApp = app;
} catch {
  electronApp = undefined;
}

const isDevMode = typeof electronApp !== 'undefined' ? !electronApp.isPackaged : true;
const isTestMode = process.env.NODE_ENV === 'test';
const i18nPath = path.join(
  typeof electronApp !== 'undefined' ? electronApp.getAppPath() : process.cwd(),
  'assets/locales',
);

export const appLanguage = isTestMode
  ? 'test'
  : isDevMode
    ? 'dev'
    : typeof electronApp !== 'undefined'
      ? electronApp.getLocale()
      : 'en';

i18n.use(Backend);
i18n.init({
  debug: !isTestMode && isDevMode,

  backend: {
    loadPath: path.join(i18nPath, '{{lng}}/{{ns}}.json'),
    addPath: path.join(i18nPath, '{{lng}}/{{ns}}.missing.json'),
  },
  defaultNS: 'main',
  fallbackLng: process.env.NODE_ENV === 'test' ? 'test' : isDevMode ? 'dev' : 'en',
  interpolation: { escapeValue: false },
  lng: appLanguage,
  load: 'all',
  ns: ['main', 'common', 'auth'],
  parseMissingKeyHandler: isTestMode ? undefined : (key: string) => `[!!!${key}!!!]`,
  preload: ['en'],
  saveMissing: true,
  saveMissingPlurals: true,
});

export default i18n;
