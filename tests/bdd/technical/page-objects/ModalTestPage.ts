/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { expect } from '@playwright/test';

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class ModalTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_MODAL_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="page-modal-test"]',
    openModal: '[data-testid="modal-open-button"]',
    openConfirmation: '[data-testid="confirmation-open-button"]',
    dialog: '[data-testid="modal"]',
    backdrop: '[data-testid="modal-backdrop"]',
    confirmationCancel: '[data-testid="destructive-confirmation-cancel"]',
    confirmationConfirm: '[data-testid="destructive-confirmation-confirm"]',
    modalOutcome: '[data-testid="modal-test-outcome"]',
    rightActions: '[data-testid="modal-actions-right"]',
    modalContent: '[data-testid="modal-content"]',
    modalContentEnd: '[data-testid="modal-content-end"]',
    modalActionButtons:
      '[data-testid="modal-left-action"], [data-testid="modal-cancel-button"], [data-testid="modal-action-button"]',
    confirmationActionButtons:
      '[data-testid="destructive-confirmation-cancel"], [data-testid="destructive-confirmation-confirm"]',
  } as Record<string, string>;

  async openModal(): Promise<void> {
    await this.click('openModal');
  }

  async openConfirmation(): Promise<void> {
    await this.click('openConfirmation');
  }

  async clickConfirmationCancel(): Promise<void> {
    await this.click('confirmationCancel');
  }

  async clickConfirmationAction(): Promise<void> {
    await this.click('confirmationConfirm');
  }

  async assertDialogNamed(expectedName: string): Promise<void> {
    const page = await this.getPage();
    await expect(page.getByRole('dialog', { name: expectedName })).toBeVisible();
  }

  async assertConfirmationActionOrder(first: string, second: string): Promise<void> {
    const page = await this.getPage();
    const actions = page.locator(this.getSelector('rightActions')).locator('button');
    await expect(actions).toHaveText([first, second]);
  }

  async assertConfirmationActionsInsideDialog(): Promise<void> {
    await this.assertActionsInsideDialog('confirmationActionButtons', 2);
  }

  async assertConfirmationCancelFocused(): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('confirmationCancel'))).toBeFocused();
  }

  async assertOutcomeIs(expectedOutcome: string): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('modalOutcome'))).toHaveText(expectedOutcome);
  }

  async assertDialogVisible(shouldBeVisible: boolean): Promise<void> {
    const page = await this.getPage();
    const dialog = page.locator(this.getSelector('dialog'));

    if (shouldBeVisible) {
      await expect(dialog).toBeVisible();
    } else {
      await expect(dialog).not.toBeVisible();
    }
  }

  async pressEscape(): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press('Escape');
  }

  async pressTab(shift = false): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
  }

  async pressArrowRight(): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press('ArrowRight');
  }

  async pressEnter(): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press('Enter');
  }

  async assertConfirmationActionHasSpatialFocus(): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('confirmationConfirm'))).toHaveClass(
      /has-nav-focus/,
    );
  }

  async clickBackdrop(): Promise<void> {
    const page = await this.getPage();
    await page.locator(this.getSelector('backdrop')).click({ position: { x: 2, y: 2 } });
  }

  async resizeViewport(width: number, height: number): Promise<void> {
    const page = await this.getPage();
    await page.setViewportSize({ width, height });
  }

  async scrollModalContentToEnd(): Promise<void> {
    const content = await this.getLocator('modalContent');
    await content.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
  }

  async assertModalContentEndVisible(): Promise<void> {
    const page = await this.getPage();
    await expect(page.locator(this.getSelector('modalContentEnd'))).toBeInViewport({ ratio: 1 });
  }

  async assertModalActionsInsideDialog(): Promise<void> {
    await this.assertActionsInsideDialog('modalActionButtons', 3);
  }

  private async assertActionsInsideDialog(
    selectorName: 'modalActionButtons' | 'confirmationActionButtons',
    expectedCount: number,
  ): Promise<void> {
    const page = await this.getPage();
    const dialog = page.locator(this.getSelector('dialog'));
    const actions = page.locator(this.getSelector(selectorName));
    const viewport = page.viewportSize();
    if (!viewport) {
      throw new Error('Viewport size is not available');
    }
    await expect(actions).toHaveCount(expectedCount);

    await expect
      .poll(async () => {
        const dialogBounds = await dialog.boundingBox();
        if (!dialogBounds) return false;

        const actionBounds = await actions.evaluateAll((buttons) =>
          buttons.map((button) => {
            const bounds = button.getBoundingClientRect();
            return {
              left: bounds.left,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
              width: bounds.width,
              height: bounds.height,
            };
          }),
        );

        return (
          actionBounds.length === expectedCount &&
          actionBounds.every(
            (bounds) =>
              bounds.width > 0 &&
              bounds.height > 0 &&
              bounds.left >= Math.max(dialogBounds.x, 0) &&
              bounds.right <= Math.min(dialogBounds.x + dialogBounds.width, viewport.width) &&
              bounds.top >= Math.max(dialogBounds.y, 0) &&
              bounds.bottom <= Math.min(dialogBounds.y + dialogBounds.height, viewport.height),
          )
        );
      })
      .toBe(true);
  }
}
