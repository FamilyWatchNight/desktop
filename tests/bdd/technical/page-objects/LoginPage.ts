/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TIMEOUT as UI_TIMEOUT } from '../infrastructure/ui-utils';

import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly selectors = {
    pageRoot: '[data-testid="login-overlay"]',
    passwordForm: '[data-testid="login-password-form"]',
    passwordInput: '[data-testid="login-password-input"]',
    cancelButton: '[data-testid="login-cancel-button"]',
    submitButton: '[data-testid="login-submit-button"]',
    userChips: '[data-login-user-id]',
  };

  async waitForDismissal(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('pageRoot')).waitFor({
      state: 'hidden',
      timeout: UI_TIMEOUT,
    });
  }

  async waitForUser(userId: number): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getUserSelector(userId)).waitFor({
      state: 'visible',
      timeout: UI_TIMEOUT,
    });
  }

  async waitForUserPresent(userId: number): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getUserSelector(userId)).waitFor({
      state: 'attached',
      timeout: UI_TIMEOUT,
    });
  }

  async waitForUserAbsent(userId: number): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getUserSelector(userId)).waitFor({
      state: 'detached',
      timeout: UI_TIMEOUT,
    });
  }

  async getUserCount(): Promise<number> {
    const page = await this.getPage();
    return page.locator(this.getSelector('userChips')).count();
  }

  async clickUser(userId: number): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getUserSelector(userId)).click({ timeout: UI_TIMEOUT });
  }

  async cancelSelection(): Promise<void> {
    await this.click('cancelButton');
  }

  async waitForPasswordForm(): Promise<void> {
    await this.waitForVisible('passwordForm');
  }

  async enterPassword(password: string): Promise<void> {
    await this.setInputText('passwordInput', password);
  }

  async submitPassword(): Promise<void> {
    await this.click('submitButton');
  }

  private getUserSelector(userId: number): string {
    return `[data-testid="login-user-${userId}"]`;
  }
}
