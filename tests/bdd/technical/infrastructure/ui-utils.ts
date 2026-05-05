import type { CustomWorld } from './world';
import type { Page } from 'playwright';

export const TIMEOUT = 4000;

export async function verifyPageIsVisible(world: CustomWorld, pageName: string): Promise<void> {
  const page = await getActivePage(world);
  try {
    const element = await page.waitForSelector(`[data-testid=page-${pageName}]`, { state: 'visible', timeout: TIMEOUT });
  } catch (error) {
    console.error(`Error occurred while waiting for page: ${pageName}`);
    throw error;
  }
}

export async function waitForPageToLoad(world: CustomWorld): Promise<void> {
  const page = await getActivePage(world);
  await page.waitForLoadState('networkidle', { timeout: TIMEOUT });
}

export async function waitForElement(world: CustomWorld, selector: string): Promise<void> {
  const page = await getActivePage(world);
  await page.waitForSelector(selector, { state: 'visible', timeout: TIMEOUT });
}

export async function takeScreenshot(world: CustomWorld, name: string): Promise<void> {
  const page = await getActivePage(world);
  await page.screenshot({ path: `./test-results/screenshots/${name}.png`, fullPage: true });
}

export async function captureFailureScreenshot(world: CustomWorld, scenarioName: string): Promise<void> {
  await takeScreenshot(world, scenarioName.replace(/\s+/g, '-'));
}

async function getActivePage(world: CustomWorld): Promise<Page> {
  if (world.renderLocation === 'electron') {
    if (!world.app) {
      throw new Error('Electron app is not available');
    }
    const windows = world.app.windows();
    if (windows.length === 0) {
      throw new Error('No windows available in Electron app');
    }
    return windows[0];
  }

  if (!world.page) {
    throw new Error('Browser page is not available');
  }

  return world.page;
}