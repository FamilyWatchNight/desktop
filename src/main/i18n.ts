import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

let app;
try {
  // Electron may not be available in unit tests
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app = require('electron').app;
} catch {
  app = undefined;
}

const isDevMode = typeof app !== 'undefined' ? !app.isPackaged : true;
const isTestMode = process.env.NODE_ENV === 'test';
const i18nPath = path.join(
  typeof app !== 'undefined' ? app.getAppPath() : process.cwd(),
  'assets/locales'
);

export const appLanguage =
  isTestMode
    ? 'test'
    : isDevMode
    ? 'dev'
    : typeof app !== 'undefined'
    ? app.getLocale()
    : 'en';

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
    ns: ['main', 'common', 'auth'],
    parseMissingKeyHandler: isTestMode ? undefined : (key) => `[!!!${key}!!!]`,
    preload: ['en'],
    saveMissing: true,
    saveMissingPlurals: true,
  });

export default i18n;