import { BackendModule } from 'i18next';
import { createApiClient } from './api-client';

export class ApiBackend implements BackendModule {
  type: 'backend' = 'backend';
  static type: 'backend' = 'backend';

  private api = createApiClient().app;

  read(
    language: string,
    namespace: string,
    callback: (err: any, data: Record<string, string>) => void
  ): void {
    this.api
      .getLocaleFile(namespace, language)
      .then((data) => callback(null, data))
      .catch((err) => callback(err, {} as Record<string, string>));
  }

  create(
    languages: readonly string[],
    namespace: string,
    key: string,
    fallbackValue: string
  ): void {
    // i18next passes an array of languages; we only care about the first one.
    const language = Array.isArray(languages) ? languages[0] : (languages as unknown as string);

    // Only attempt to save if the API actually exposes the method (dev mode).
    if (this.api.saveMissingKey) {
      // Some implementations may not return a promise, so wrap with Promise.resolve
      Promise.resolve(this.api.saveMissingKey(namespace, language, key, fallbackValue))
        .catch(() => {
          // ignore errors; failures aren't critical for missing-key logging
        });
    }
  }
}

export default ApiBackend;
