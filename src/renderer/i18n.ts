import i18n, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { createApiClient } from './api-client';
import ApiBackend from './i18n-backend';

const isDevMode = typeof window !== 'undefined' && (window as any).isDevMode === true;

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
  .use(initReactI18next)
  .use(ApiBackend)
  .use(electronDetector)
  .init({
    ns: ['layout', 'backgroundTasks', 'common', 'settings'],
    defaultNS: 'common',
    fallbackLng: isDevMode ? 'dev' : 'en',
    interpolation: {
      escapeValue: false,
    },
    parseMissingKeyHandler: (key) => `[!!!${key}!!!]`,
    debug: isDevMode,
    saveMissing: isDevMode,
    saveMissingTo: 'fallback',
  });

export default i18n;