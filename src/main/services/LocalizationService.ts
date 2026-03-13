/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const isTestMode = process.env.NODE_ENV === 'test';
const isDevMode = !(app && app.isPackaged);
const defaultLocalesPath = path.join(
  // if `app` is missing or doesn't have getAppPath, fall back to cwd so path
  // operations succeed during unit tests.
  (app && typeof app.getAppPath === 'function') ? app.getAppPath() : process.cwd(),
  'assets/locales'
);

function isValidLanguage(language: string): boolean {
  return /^[a-zA-Z0-9-]+$/.test(language);
}

function isValidNamespace(namespace: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(namespace);
}

// Helper to set a nested value on an object given a dot-separated key path.
function setNestedValue(obj: Record<string, any>, pathStr: string, value: any) {
  const parts = pathStr.split('.');

  // Start with the topmost object
  let current: Record<string, any> = obj;

  // Iterate through the parts of the path, creating nested objects as needed.
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      // This is the last part of the path.
      current[part] = value;
    } else {
      if (typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      // Step down into the next level of the object for the next iteration.
      current = current[part];
    }
  }
}

export class LocalizationService {
  private localesPath: string;
  private localesRoot: string;

  // Simple per-file promise queue to serialize writes and avoid races.  The
  // key is the absolute path to the missing.json file being updated.
  private writeQueues: Map<string, Promise<void>> = new Map();

  // Allow overriding the locales path for testing
  constructor(localesPath: string = defaultLocalesPath) {
    this.localesPath = localesPath;
    this.localesRoot = path.resolve(this.localesPath);
  }

  /**
   * Build the full path to a locale file and ensure it stays within the locales root directory.
   */
  private getLocaleFilePath(language: string, namespace: string, suffix: string = ''): string {
    const filePath = path.resolve(this.localesRoot, language, `${namespace}${suffix}.json`);

    // Ensure the resolved path is within the locales root directory.
    const normalizedRoot = this.localesRoot.endsWith(path.sep)
      ? this.localesRoot
      : this.localesRoot + path.sep;

    if (!filePath.startsWith(normalizedRoot) && filePath !== this.localesRoot) {
      throw new Error('Resolved locale file path is outside of the configured locales directory');
    }

    return filePath;
  }

  async getLocaleFile(namespace: string, language: string): Promise<Record<string, string>> {
    if (!isValidNamespace(namespace)) {
      throw new Error(`Invalid namespace: "${namespace}". Namespace must contain only alphanumeric characters, hyphens, and underscores.`);
    }

    if (!isValidLanguage(language)) {
      throw new Error(`Invalid language: "${language}". Language must contain only alphanumeric characters and hyphens.`);
    }

    const filePath = this.getLocaleFilePath(language, namespace);
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Return empty object if file doesn't exist or is malformed (i18next will handle fallbacks)
      return {};
    }
  }

  async saveMissingKey(namespace: string, language: string, key: string, fallbackValue: string): Promise<void> {
    if (!isDevMode && !isTestMode) {
      // Client-side protections should keep us from getting here, but guard against accidental calls in production just in case.
      throw new Error('Cannot save missing keys in production mode');
    }

    if (!isValidNamespace(namespace)) {
      throw new Error(`Invalid namespace: "${namespace}". Namespace must contain only alphanumeric characters, hyphens, and underscores.`);
    }

    if (!isValidLanguage(language)) {
      throw new Error(`Invalid language: "${language}". Language must contain only alphanumeric characters and hyphens.`);
    }

    if (typeof key !== 'string' || typeof fallbackValue !== 'string') {
      throw new Error('Invalid assignment: Key and fallbackValue must both be strings');
    }

    const trimmedKey = key.trim();
    if (trimmedKey.length === 0) {
      throw new Error('Invalid assignment: Key must not be empty');
    }

    const MAX_KEY_LENGTH = 1024;
    if (trimmedKey.length > MAX_KEY_LENGTH) {
      throw new Error(`Invalid assignment: Key is too long (max ${MAX_KEY_LENGTH} characters)`);
    }

    const MAX_KEY_SEGMENTS = 100;
    const segmentCount = trimmedKey.split('.').length;
    if (segmentCount > MAX_KEY_SEGMENTS) {
      throw new Error(`Invalid assignment: Key has too many nested segments (max ${MAX_KEY_SEGMENTS})`);
    }

    const missingFilePath = this.getLocaleFilePath(language, namespace, '.missing');

    // Queue up operations for this specific file so they execute sequentially.
    const queueKey = missingFilePath;
    const previous = this.writeQueues.get(queueKey) || Promise.resolve();

    const current = previous.then(async () => {
      // Re-read file at the moment we have the lock, merging any changes
      // written by earlier callers.
      let missingKeys: Record<string, any> = {};
      try {
        const content = await fs.promises.readFile(missingFilePath, 'utf-8');
        missingKeys = JSON.parse(content);
      } catch {
        // File doesn't exist yet. That's not an error. We'll create it later.
      }

      // Add the missing key in a nested structure
      setNestedValue(missingKeys, key, fallbackValue);

      // Ensure directory for language exists (may be missing for new languages)
      await fs.promises.mkdir(path.dirname(missingFilePath), { recursive: true });

      // Atomic write via temp file
      const tempPath = `${missingFilePath}.tmp`;
      await fs.promises.writeFile(tempPath, JSON.stringify(missingKeys, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, missingFilePath);
    });

    // store/cleanup the queue entry
    this.writeQueues.set(queueKey, current.finally(() => {
      if (this.writeQueues.get(queueKey) === current) {
        this.writeQueues.delete(queueKey);
      }
    }));

    try {
      await current;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw error;
      }
      throw new Error('Failed to save missing key');
    }
  }
}