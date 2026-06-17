/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class ButtonTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_BUTTON_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="page-button-test"]',
    variantSelect: '[data-testid="button-variant-select"]',
    sizeSelect: '[data-testid="button-size-select"]',
    disabledInput: '[data-testid="button-disabled-input"]',
    button1: '[data-testid="button-1"]',
    button2: '[data-testid="button-2"]',
  } as Record<string, string>;

  async setVariant(variant: string): Promise<void> {
    const page = await this.getPage();
    await page.selectOption(this.getSelector('variantSelect'), variant);
  }

  async setSize(size: string): Promise<void> {
    const page = await this.getPage();
    await page.selectOption(this.getSelector('sizeSelect'), size);
  }

  async setDisabled(disabled: boolean): Promise<void> {
    const current = await this.isChecked('disabledInput');
    if (current !== disabled) {
      await this.click('disabledInput');
    }
  }

  async getButtonClassList(buttonName: 'button1' | 'button2'): Promise<string[]> {
    const button = await this.getLocator(buttonName);
    const className = await button.getAttribute('class');
    return className?.split(' ').filter(Boolean) ?? [];
  }

  async isButtonDisabled(buttonName: 'button1' | 'button2'): Promise<boolean> {
    const button = await this.getLocator(buttonName);
    return button.isDisabled();
  }
}
