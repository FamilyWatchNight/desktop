import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createApiClient } from './api-client';

// the translations
// (tip: move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
import enUS from './locales/en-US.json';

const resources = {
  'en-US': {
    translation: enUS,
  },
};

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
  .use(electronDetector)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: 'en-US',

    interpolation: {
      escapeValue: false, // react already does escaping
    },

    // for missing keys, show [key] to make it obvious
    parseMissingKeyHandler: (key) => `[${key}]`,
  });

export default i18n;