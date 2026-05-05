import type { CustomWorld } from '../../technical/infrastructure/world';
import { MenuPanel } from '../../technical/page-objects/MenuPanel';
import { SettingsPage } from '../../technical/page-objects/SettingsPage';

export class UserPersona {
  constructor(protected world: CustomWorld) {}

  async openWindow(): Promise<void> {
      const { page, browser } = await this.world.uiApi.openMainWindow();
      this.world.page = page;
      this.world.browser = browser; 
  }

  async navigateToSettings(): Promise<void> {
    const menu = new MenuPanel(this.world);

    await menu.openSettings();
    
    const settingsPage = new SettingsPage(this.world);
    await settingsPage.waitForVisible('pageRoot', 10000);
  }
}
