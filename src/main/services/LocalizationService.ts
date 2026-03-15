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

function normalizeLanguage(language: string): string {
  const trimmed = language.trim();
  const parts = trimmed.split('-');
  const root = parts[0].toLowerCase();

  // Require language code to be purely alphabetical and of reasonable length.
  if (!/^[a-z]{2,8}$/.test(root)) {
    throw new Error('Invalid language: must be a purely alphabetical language code');
  }

  if (parts.length > 2) {
    throw new Error('Invalid language: must be either a simple language code or language and region in the form ll-RR');
  } else if (parts.length === 2) {
    const region = parts[1].toUpperCase();
    if (!/^[A-Z]{2,8}$/.test(region)) {
      throw new Error('Invalid language: region, if supplied, must be purely alphabetical');
    }

    return `${root}-${region}`;
  } else {
    return root;
  }
}

function normalizeNamespace(namespace: string): string {
  const trimmed = namespace.trim().toLowerCase();

  if (! /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(trimmed)) {
    throw new Error('Invalid namespace: Must be alphanumeric segments separated by single hyphens or underscords.')
  }

  return trimmed;
}

// Helper to set a nested value on an object given a dot-separated key path.
function setNestedValue(obj: Record<string, any>, pathStr: string, value: any) {
  const parts = pathStr.split('.');

  const MAX_KEY_SEGMENTS = 100;
  if (parts.length > MAX_KEY_SEGMENTS) {
    throw new Error(`Invalid assignment: Key has too many nested segments (max ${MAX_KEY_SEGMENTS})`);
  }

  // Start with the topmost object
  let current: Record<string, any> = obj;

  // Iterate through the parts of the path, creating nested objects as needed.
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Prevent prototype pollution by blocking dangerous keys.
    if (part !== '__proto__' && part !== 'constructor' && part !== 'prototype') {
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
    const candidatePath = path.resolve(this.localesRoot, language, `${namespace}${suffix}.json`);

    // Resolve the locales root; if it does not exist yet, fall back to the configured path.
    let resolvedRoot = this.localesRoot;
    try {
      resolvedRoot = fs.realpathSync(this.localesRoot);
    } catch {
      // If the root directory does not exist yet, we still enforce that candidate paths
      // are rooted under the configured localesRoot string.
    }

    const normalizedRoot = resolvedRoot.endsWith(path.sep)
      ? resolvedRoot
      : resolvedRoot + path.sep;

    // Try to resolve the candidate path fully (including symlinks) if it already exists.
    var finalPath: string;
    try {
      finalPath = fs.realpathSync(candidatePath);
    } catch {
      // If the file does not exist yet, fall back to the normalized candidate path.
      finalPath = path.normalize(candidatePath);
    }

    // Ensure the resolved path is within the locales root directory.
    if (!finalPath.startsWith(normalizedRoot) && finalPath !== resolvedRoot) {
      throw new Error('Resolved locale file path is outside of the configured locales directory');
    }

    return finalPath;
  }

  async getLocaleFile(namespace: string, language: string): Promise<Record<string, string>> {
    const filePath = this.getLocaleFilePath(normalizeLanguage(language), normalizeNamespace(namespace));
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

    const missingFilePath = this.getLocaleFilePath(normalizeLanguage(language), normalizeNamespace(namespace), '.missing');

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

      // Before constructing a temporary path, double-check that the directory
      // for the missing file is still within the configured locales root.
      const rootWithSep = this.localesRoot.endsWith(path.sep)
        ? this.localesRoot
        : this.localesRoot + path.sep;
      const dirPath = path.normalize(path.dirname(missingFilePath));
      // Resolve the directory path (following symlinks) if possible, falling back to
      // the normalized path if it does not yet exist.
      const resolvedDirPath = await fs.promises.realpath(dirPath).catch(() => dirPath);
      const dirWithSep = resolvedDirPath.endsWith(path.sep) ? resolvedDirPath : resolvedDirPath + path.sep;
      if (!dirWithSep.startsWith(rootWithSep)) {
        throw new Error('Resolved locale directory is outside of the configured locales directory');
      }

      // Atomic write via temp file
      const tempPath = path.join(resolvedDirPath, path.basename(missingFilePath) + '.tmp');
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