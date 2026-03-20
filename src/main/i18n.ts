import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { app } from 'electron';

const isDevMode = !app.isPackaged;
const i18nPath = path.join(app.getAppPath(), 'assets/locales');

export const appLanguage = ( process.env.NODE_ENV === 'test' ) ? 'test' : isDevMode ? 'dev' : app.getLocale();

i18n
  .use(Backend)
  .init({
    debug: isDevMode,

    backend: {
      loadPath: path.join(i18nPath, '{{lng}}/{{ns}}.json'),
      addPath: path.join(i18nPath, '{{lng}}/{{ns}}.missing.json'),
    },
    defaultNS: 'main',
    fallbackLng: ( process.env.NODE_ENV === 'test' ) ? 'test' : isDevMode ? 'dev' : 'en',
    initImmediate: false, 
    interpolation: { escapeValue: false},
    lng: appLanguage,
    load: 'all',
    ns: ['main', 'common'],
    parseMissingKeyHandler: (key) => `[!!!${key}!!!]`,
    preload: ['en'],
    saveMissing: true,
    saveMissingPlurals: true,
  });

export default i18n;