import type { CustomWorld } from '../infrastructure/world';
import type { Page } from 'playwright';
import { TIMEOUT as UI_TIMEOUT } from '../infrastructure/ui-utils';
import log from 'electron-log';

export abstract class BasePage {
  constructor(protected world: CustomWorld) {}

  protected async getPage(): Promise<Page> {
    if (!this.world.page) {
      console.error('[BasePage] Page not initialized - this.world.page is null or undefined');
      throw new Error('Page is not initialized on the world');
    }
    
    // First time setup - attach browser error listeners
    if (!(this.world as any).pageErrorsListening) {
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
        console.error(`[Browser Request Failed] ${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
      });
      
      // Capture HTTP error responses
      page.on('response', (response) => {
        if (!response.ok()) {
          console.error(`[Browser HTTP Error] ${response.status()} ${response.url()}`);
        }
      });
      
      (this.world as any).pageErrorsListening = true;
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
      const isVisible = await page.locator(selector).isVisible().catch(() => false);
      log.error(`[BasePage.click] Failed to click "${name}": selector="${selector}", exists=${count > 0}, visible=${isVisible}`);
      throw error;
    }
  }

  async isVisible(name: string): Promise<boolean> {
    const page = await this.getPage();
    const selector = this.selectors[name];
    if (!selector) {
      throw new Error(`Selector not found for ${name}`);
    }
    
    return page.locator(selector).isVisible().catch(() => false);
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
      const exists = await page.locator(selector).count() > 0;
      console.error(`[BasePage.waitForVisible] Timeout waiting for "${name}": selector="${selector}", element exists=${exists}`);
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

    const textValue = await locator.evaluate(el => {
        // If it's an input/textarea/select, it has a 'value' property
        if ('value' in el) {
            return el.value;
        }
        // Otherwise, return the visible text
        return el.textContent;
    }) as Promise<string | null>;

    console.log(`[BasePage.getText] Got text for "${name}":`, textValue);
    return textValue;
  }
}
