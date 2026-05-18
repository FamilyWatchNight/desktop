/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import log from 'electron-log';
import type { Page } from 'playwright';

import { TIMEOUT as UI_TIMEOUT } from '../infrastructure/ui-utils';
import type { CustomWorld } from '../infrastructure/world';

export abstract class BasePage {
  private pageErrorsListening = false;

  constructor(protected world: CustomWorld) {}

  protected async getPage(): Promise<Page> {
    if (!this.world.page) {
      console.error('[BasePage] Page not initialized - this.world.page is null or undefined');
      throw new Error('Page is not initialized on the world');
    }

    // First time setup - attach browser error listeners
    if (!this.pageErrorsListening) {
      const page = this.world.page;

      // Capture console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.error(`[Browser Console] ${msg.text()}`);
        }
      });

      // Capture uncaught JavaScript exceptions
      page.on('pageerror', (error) => {
        console.error(`[Browser Exception] ${error.name}: ${error.message}`);
      });

      // Capture failed network requests
      page.on('requestfailed', (request) => {
        console.error(
          `[Browser Request Failed] ${request.method()} ${request.url()}: ${request.failure()?.errorText}`,
        );
      });

      // Capture HTTP error responses
      page.on('response', (response) => {
        if (!response.ok()) {
          console.error(`[Browser HTTP Error] ${response.status()} ${response.url()}`);
        }
      });

      this.pageErrorsListening = true;
    }

    return this.world.page;
  }

  abstract readonly selectors: Record<string, string>;

  async navigate(path: string): Promise<void> {
    const page = await this.getPage();
    await page.goto(path);
  }

  async click(name: string): Promise<void> {
    const page = await this.getPage();
    const selector = this.selectors[name];
    if (!selector) {
      throw new Error(`Selector not found for ${name}`);
    }

    try {
      await page.click(selector, { timeout: UI_TIMEOUT });
    } catch (error) {
      const count = await page.locator(selector).count();
      const isVisible = await page
        .locator(selector)
        .isVisible()
        .catch(() => false);
      log.error(
        `[BasePage.click] Failed to click "${name}": selector="${selector}", exists=${count > 0}, visible=${isVisible}`,
      );
      throw error;
    }
  }

  async isVisible(name: string): Promise<boolean> {
    const page = await this.getPage();
    const selector = this.selectors[name];
    if (!selector) {
      throw new Error(`Selector not found for ${name}`);
    }

    return page
      .locator(selector)
      .isVisible()
      .catch(() => false);
  }

  async waitForVisible(name: string, timeout = UI_TIMEOUT): Promise<void> {
    const page = await this.getPage();
    const selector = this.selectors[name];
    if (!selector) {
      throw new Error(`Selector not found for ${name}`);
    }

    try {
      await page.waitForSelector(selector, { state: 'visible', timeout });
    } catch (error) {
      const exists = (await page.locator(selector).count()) > 0;
      console.error(
        `[BasePage.waitForVisible] Timeout waiting for "${name}": selector="${selector}", element exists=${exists}`,
      );
      throw error;
    }
  }

  async getText(name: string, timeout = UI_TIMEOUT): Promise<string | null> {
    const page = await this.getPage();
    await this.waitForVisible(name, timeout);

    const selector = this.selectors[name];
    if (!selector) {
      throw new Error(`Selector not found for ${name}`);
    }

    const locator = page.locator(selector);

    const textValue = await locator.evaluate((el) => {
      if (!el) {
        return null;
      }

      // If it's an input/textarea/select, it has a 'value' property
      if ('value' in el) {
        return el.value as string;
      }
      if ('textContent' in el) {
        return el.textContent as string;
      }

      return null;
    });

    return textValue;
  }

  /**
   * Navigate to the page represented by this PageObject.
   * The concrete PageObject class should declare a static `pageId` string.
   * This calls `window.navigateTo(pageId)` inside the renderer via Playwright.
   */
  async navigateToPage(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctor = this.constructor as any;
    const pageId: string | undefined = ctor.pageId;
    if (!pageId) {
      throw new Error(`PageObject ${ctor.name} must declare a static pageId`);
    }

    const page = await this.getPage();
    // Invoke the renderer-level navigation function exposed on window
    await page.evaluate((p) => {
      type WindowWithNavigateTo = Window & { navigateTo?: (page: string) => void };
      const fn = (window as WindowWithNavigateTo).navigateTo;
      if (typeof fn !== 'function') {
        throw new Error('window.navigateTo is not available');
      }
      fn(p);
    }, pageId);

    // If this PageObject declares a pageRoot selector, wait for it to be visible.
    if ((this.selectors as Record<string, string>).pageRoot) {
      await this.waitForVisible('pageRoot', UI_TIMEOUT);
    } else {
      // Otherwise wait for network idle shortly to give the renderer a moment to update
      await page.waitForLoadState('networkidle', { timeout: UI_TIMEOUT }).catch(() => {});
    }
  }
}
