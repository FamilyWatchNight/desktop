import { afterEach } from '@jest/globals';
import { BaseWebAdapter, init } from '@noriginmedia/norigin-spatial-navigation-core';
import '@testing-library/jest-dom';
import { act, cleanup } from '@testing-library/react';

// Check if the current Jest runner is executing in a browser-like (jsdom) context
const isJsdomEnvironment = typeof window !== 'undefined' && typeof document !== 'undefined';

if (isJsdomEnvironment) {
  afterEach(async () => {
    await act(async () => {
      cleanup();
    });
  });

  // 1. Initialize the layout adapter strictly for DOM-based UI tests
  init({
    layoutAdapter: BaseWebAdapter,
    throttle: 0, // Keep actions synchronous for predictable assertions
  });

  // 2. Mock element layout boundaries since jsdom defaults measurements to 0
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      width: 120,
      height: 60,
      top: 0,
      left: 0,
      right: 120,
      bottom: 60,
      x: 0,
      y: 0,
    }),
  });

  // 3. FIX: Mock scrollIntoView to prevent jsdom crashes
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: jest.fn(), // Creates a mock function that safely does nothing
  });

  // 4. Mock electron-log to prevent actual logging (or console errors) during tests
  jest.mock('electron-log', () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    verbose: jest.fn(),
    debug: jest.fn(),
    silly: jest.fn(),
    log: jest.fn(),
    functions: {},
    transports: {
      console: {},
      file: {},
    },
  }));

  jest.mock('electron-log/renderer', () => jest.requireMock('electron-log'));
}
