/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License,
version 3.
*/

import { Buffer } from 'node:buffer';

import { HomePage } from '../../technical/page-objects/HomePage';
import { MenuPanel } from '../../technical/page-objects/MenuPanel';
import { ProfileManagementPage } from '../../technical/page-objects/ProfileManagementPage';
import { generateBufferOfSize } from '../utilities/image-generator';

import { InternalSystemPersona } from './internal-system';
import { UserPersona } from './UserPersona';

export class ProfileManagementPersona extends UserPersona {
  private readonly profilePage = new ProfileManagementPage(this.world);
  private readonly menu = new MenuPanel(this.world);
  private readonly system = new InternalSystemPersona(this.world);

  async openProfile(): Promise<void> {
    await this.menu.openProfile();
    await this.profilePage.waitForVisible('pageRoot');
  }

  async profileIsAvailable(): Promise<boolean> {
    return this.menu.isProfileAvailable();
  }

  async navigateDirectlyToProfile(): Promise<void> {
    await this.profilePage.navigateToPage();
  }

  async updateDisplayName(displayName: string): Promise<void> {
    await this.profilePage.updateDisplayName(displayName);
  }

  async changePassword(password: string, confirmation: string): Promise<void> {
    await this.profilePage.changePassword(password, confirmation);
  }

  async selectImage(name: string, mimeType: string, image: Buffer): Promise<void> {
    await this.profilePage.selectImage(name, mimeType, image);
  }

  async selectGeneratedPng(sizeBytes = 100 * 1024): Promise<void> {
    await this.selectImage('profile.png', 'image/png', generateBufferOfSize(sizeBytes, 'png'));
  }

  async selectGeneratedGif(): Promise<void> {
    await this.selectImage('profile.gif', 'image/gif', Buffer.from('GIF89a'));
  }

  async selectOversizedPng(): Promise<void> {
    await this.selectGeneratedPng(5 * 1024 * 1024 + 1024);
  }

  async saveImage(): Promise<void> {
    await this.profilePage.saveImage();
  }

  async removeImage(): Promise<void> {
    await this.profilePage.acceptAndRemoveImage();
  }

  async removePassword(): Promise<void> {
    await this.profilePage.acceptAndRemovePassword();
  }

  async leaveAndReturnToProfile(): Promise<void> {
    await this.menu.ensureMenuIsOpen();
    await this.menu.click('homeButton');
    await new HomePage(this.world).waitForVisible('pageRoot');
    await this.menu.openProfile();
    await this.profilePage.waitForVisible('pageRoot');
  }

  async getSavedUserDetails(username: string) {
    const user = this.world.getStateObject('users', username) as { id?: unknown } | null;
    if (!user || typeof user.id !== 'number') {
      throw new Error(`No stored user found for username "${username}"`);
    }
    return this.system.getUserById(user.id);
  }

  async statusMessage(): Promise<string | null> {
    return this.profilePage.getStatusMessage();
  }

  async showStatusMessage(): Promise<void> {
    await this.profilePage.waitForStatusMessage();
  }

  async getDisplayName(): Promise<string | null> {
    return this.profilePage.getDisplayName();
  }

  async hasImagePreview(): Promise<boolean> {
    return this.profilePage.isVisible('imagePreview');
  }

  async hasImagePlaceholder(): Promise<boolean> {
    return this.profilePage.isVisible('imagePlaceholder');
  }

  async hasAccessDeniedMessage(): Promise<boolean> {
    return this.profilePage.isVisible('accessDenied');
  }
}
