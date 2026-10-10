/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License,
version 3.
*/

import type { Buffer } from 'node:buffer';

import { PAGE_IDS } from '../../../../src/renderer/pages/PageIds';

import { BasePage } from './BasePage';

export class ProfileManagementPage extends BasePage {
  static readonly pageId = PAGE_IDS.PROFILE;

  readonly selectors = {
    pageRoot: '[data-testid="page-profile"]',
    accessDenied: '[data-testid="profile-access-denied"]',
    displayNameInput: '[data-testid="profile-display-name-input"]',
    displayNameSaveButton: '[data-testid="profile-display-name-save-button"]',
    passwordInput: '[data-testid="profile-password-input"]',
    passwordConfirmationInput: '[data-testid="profile-password-confirmation-input"]',
    passwordSaveButton: '[data-testid="profile-password-save-button"]',
    passwordRemoveButton: '[data-testid="profile-password-remove-button"]',
    imageInput: '[data-testid="profile-image-input"]',
    imageSaveButton: '[data-testid="profile-image-save-button"]',
    imageRemoveButton: '[data-testid="profile-image-remove-button"]',
    imagePreview: '[data-testid="profile-image-preview"]',
    imagePlaceholder: '[data-testid="profile-image-placeholder"]',
    statusMessage: '[data-testid="profile-status-message"]',
  };

  async updateDisplayName(displayName: string): Promise<void> {
    await this.setInputText('displayNameInput', displayName);
    await this.click('displayNameSaveButton');
  }

  async getDisplayName(): Promise<string | null> {
    return this.getText('displayNameInput');
  }

  async changePassword(password: string, confirmation: string): Promise<void> {
    await this.setInputText('passwordInput', password);
    await this.setInputText('passwordConfirmationInput', confirmation);
    await this.click('passwordSaveButton');
  }

  async selectImage(name: string, mimeType: string, buffer: Buffer): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('imageInput')).setInputFiles({ name, mimeType, buffer });
  }

  async saveImage(): Promise<void> {
    await this.click('imageSaveButton');
  }

  async acceptAndRemovePassword(): Promise<void> {
    const page = await this.getPage();
    page.once('dialog', (dialog) => void dialog.accept());
    await this.click('passwordRemoveButton');
  }

  async acceptAndRemoveImage(): Promise<void> {
    const page = await this.getPage();
    page.once('dialog', (dialog) => void dialog.accept());
    await this.click('imageRemoveButton');
  }

  async getStatusMessage(): Promise<string | null> {
    return this.getText('statusMessage');
  }

  async waitForStatusMessage(): Promise<void> {
    await this.waitForVisible('statusMessage');
  }
}
