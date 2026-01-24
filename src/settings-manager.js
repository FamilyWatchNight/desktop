const Store = require('electron-store').default;

const DEFAULT_SETTINGS = {
  // Add default application settings here
  // Example: windowSize: { width: 1024, height: 768 }
  webPort: 3000,
  watchmodeApiKey: '',
  tmdbApiKey: ''
};

class SettingsManager {
  constructor() {
    this.store = new Store();
    // Ensure settings namespace exists
    if (!this.store.has('settings')) {
      this.store.set('settings', {});
    }
  }

  /**
   * Initialize the settings manager
   * (No-op with electron-store as it auto-loads)
   */
  initialize() {
    // electron-store automatically loads persisted data
  }

  /**
   * Get a single setting value by key
   * Returns the stored value if found, otherwise returns the default value
   * @param {string} key - The setting key
   * @returns {any} The setting value or default value, or undefined if neither exists
   */
  get(key) {
    const settings = this.store.get('settings', {});
    if (key in settings) {
      return settings[key];
    }
    return DEFAULT_SETTINGS[key];
  }

  /**
   * Set a single setting value and persist to store
   * @param {string} key - The setting key
   * @param {any} value - The setting value
   */
  set(key, value) {
    try {
      const settings = this.store.get('settings', {});
      settings[key] = value;
      this.store.set('settings', settings);
    } catch (error) {
      console.error(`Failed to save setting "${key}":`, error.message);
      throw error;
    }
  }

  /**
   * Get all settings
   * @returns {object} All settings
   */
  getAll() {
    return this.store.get('settings', {});
  }

  /**
   * Set all settings at once
   * @param {object} settings - Object with key-value pairs
   */
  setAll(settings) {
    try {
      const currentSettings = this.store.get('settings', {});
      const merged = { ...currentSettings, ...settings };
      this.store.set('settings', merged);
    } catch (error) {
      console.error('Failed to save settings:', error.message);
      throw error;
    }
  }

  /**
   * Clear all settings from store
   */
  clear() {
    try {
      this.store.set('settings', {});
    } catch (error) {
      console.error('Failed to clear settings:', error.message);
      throw error;
    }
  }
}

module.exports = SettingsManager;
