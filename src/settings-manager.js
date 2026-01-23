const db = require('./database');

class SettingsManager {
  constructor() {
    this.cache = {};
    this.isInitialized = false;
  }

  /**
   * Initialize the settings manager with data from the database
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }
    try {
      const settings = db.loadSettings();
      this.cache = settings;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize settings manager:', error.message);
      this.isInitialized = true;
    }
  }

  /**
   * Get a single setting value by key
   * If not in cache, attempts to load from database
   * @param {string} key - The setting key
   * @returns {any} The setting value, or undefined if not found
   */
  get(key) {
    if (key in this.cache) {
      return this.cache[key];
    }

    // Try to load from database if not in cache
    try {
      const dbSettings = db.loadSettings();
      if (key in dbSettings) {
        this.cache[key] = dbSettings[key];
        return dbSettings[key];
      }
    } catch (error) {
      console.error(`Failed to load setting "${key}" from database:`, error.message);
    }

    return undefined;
  }

  /**
   * Set a single setting value and persist to database
   * @param {string} key - The setting key
   * @param {any} value - The setting value
   */
  set(key, value) {
    this.cache[key] = value;
    try {
      db.saveSettings({ [key]: value });
    } catch (error) {
      console.error(`Failed to save setting "${key}" to database:`, error.message);
      throw error;
    }
  }

  /**
   * Get all settings from the cache
   * @returns {object} All cached settings
   */
  getAll() {
    return { ...this.cache };
  }

  /**
   * Set all settings at once and persist to database
   * @param {object} settings - Object with key-value pairs
   */
  setAll(settings) {
    this.cache = { ...this.cache, ...settings };
    try {
      db.saveSettings(settings);
    } catch (error) {
      console.error('Failed to save settings to database:', error.message);
      throw error;
    }
  }

  /**
   * Clear all settings from cache and database
   */
  clear() {
    this.cache = {};
    try {
      const allSettings = db.loadSettings();
      const keysToDelete = Object.keys(allSettings);
      if (keysToDelete.length > 0) {
        // Note: This approach deletes by resetting all to empty
        // If you need selective deletion, you'd need to add that to database.js
        db.saveSettings({});
      }
    } catch (error) {
      console.error('Failed to clear settings:', error.message);
      throw error;
    }
  }
}

module.exports = SettingsManager;
