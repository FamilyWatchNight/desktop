/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class PageFrameworkTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_FRAMEWORK_TEST}`;
  readonly selectors = {
    pageRoot: '[data-testid="page-component-under-test"]',
    pageTitleInput: '[data-testid="page-test-page-title-input"]',
    pageCenteredInput: '[data-testid="page-test-page-centered-input"]',
    pageClassNameInput: '[data-testid="page-test-page-className-input"]',
    pageTitle: '[data-testid="page-component-under-test"] h1',
    sectionTitleInput: '[data-testid="section-test-title-input"]',
    sectionClassNameInput: '[data-testid="section-test-className-input"]',
    sectionRoot: '[data-testid="section-component-under-test"]',
    sectionTitle: '[data-testid="section-component-under-test"] h2',
  };

  async setPageTitle(title: string): Promise<void> {
    const page = await this.getPage();
    await page.fill(this.selectors.pageTitleInput, title);
  }

  async setPageCentered(centered: boolean): Promise<void> {
    const page = await this.getPage();
    const checkbox = page.locator(this.selectors.pageCenteredInput);
    const currentValue = await checkbox.isChecked();
    if (currentValue !== centered) {
      await checkbox.click();
    }
  }

  async setPageClassName(className: string): Promise<void> {
    const page = await this.getPage();
    await page.fill(this.selectors.pageClassNameInput, className);
  }

  async setSectionTitle(title: string): Promise<void> {
    const page = await this.getPage();
    await page.fill(this.selectors.sectionTitleInput, title);
  }

  async setSectionClassName(className: string): Promise<void> {
    const page = await this.getPage();
    await page.fill(this.selectors.sectionClassNameInput, className);
  }

  async getPageTitle(): Promise<string | null> {
    return this.getText('pageTitle');
  }

  async getPageClassName(): Promise<string | null> {
    const page = await this.getPage();
    return page.locator(this.selectors.pageRoot).getAttribute('class');
  }

  async isPageCentered(): Promise<boolean> {
    const page = await this.getPage();
    const className = await page.locator(this.selectors.pageRoot).getAttribute('class');
    return className?.split(' ').includes('centered') ?? false;
  }

  async getSectionTitle(): Promise<string | null> {
    return this.getText('sectionTitle');
  }

  async getSectionClassName(): Promise<string | null> {
    const page = await this.getPage();
    return page.locator(this.selectors.sectionRoot).getAttribute('class');
  }

  async waitForVisible(name: string, timeout = 4000): Promise<void> {
    await super.waitForVisible(name, timeout);
  }
}
