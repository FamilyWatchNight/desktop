import { BasePage } from './BasePage';
import { SettingsPage } from './SettingsPage';

export class HomePage extends BasePage {
  readonly selectors = {
    pageRoot: '[data-testid="page-home"]',
    settingsButton: '[data-testid="menu-settings"]',
    homeMenuButton: '[data-testid="menu-home"]'
  };

  async openSettings(): Promise<SettingsPage> {
    await this.click('settingsButton');
    return new SettingsPage(this.world);
  }
}
