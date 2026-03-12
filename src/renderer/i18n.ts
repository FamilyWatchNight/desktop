import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import { createApiClient } from './api-client';

// Set the UI language based on the language returned by the main process.
// This allows the UI to match the user's system language without needing a separate language setting in the app.
const electronDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: (callback: (lng: string) => void) => {
    const apiClient = createApiClient();

    apiClient.app.getAppLocale()
      .then((locale: string) => {
        callback(locale);
      })
      .catch(() => {
        callback('en'); // Fallback on error
      });
  },
  cacheUserLanguage: () => {}
};

i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .use(Backend)
  .use(electronDetector)
  .init({
    ns: ['layout', 'backgroundTasks', 'common', 'settings'],
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: 'dev',

    interpolation: {
      escapeValue: false, // react already does escaping
    },

    // for missing keys, show [key] to make it obvious
    parseMissingKeyHandler: (key) => `[${key}]`,
  });

export default i18n;