import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { app } from 'electron';

const isDev = !app.isPackaged;
const i18nPath = path.join(app.getAppPath(), 'assets/locales');
const defaultLanguage = process.env.NODE_ENV=="test" ? "test" : ( isDev ? "dev" : "en" );

i18n
  .use(Backend)
  .init({
    debug: isDev,

    backend: {
      loadPath: path.join(i18nPath, '{{lng}}/{{ns}}.json'),
      addPath: path.join(i18nPath, '{{lng}}/{{ns}}.missing.json'),
    },
    defaultNS: 'main',
    fallbackLng:  defaultLanguage,
    initImmediate: false, // load resources synchronously to avoid race condition
    interpolation: {
      escapeValue: false,
    },
    lng: process.env.NODE_ENV=="test" ? "test" : ( isDev ? "dev" : "en" ),

    load: 'all',
    ns: ['main', 'common'],
    parseMissingKeyHandler: (key) => `[${key}]`,
    preload: ['en'],
    saveMissing: true,
    saveMissingPlurals: true,
  });

export default i18n;