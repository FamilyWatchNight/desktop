/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class ExpandableMenuSectionTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_EXPANDABLE_SECTION_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="page-expandable-section-test"]',
    expandedInput: '[data-testid="expandable-expanded-input"]',
    sectionToggle: '[data-testid="expandable-preview-toggle"]',
    sectionContent: '[data-testid="expandable-preview-content"]',
  } as Record<string, string>;

  async setExpanded(expanded: boolean): Promise<void> {
    const current = await this.isChecked('expandedInput');
    if (current !== expanded) {
      await this.click('expandedInput');
      await new Promise((r) => setTimeout(r, 1000)); // Give the animation time to finish
    }
  }

  async toggleSection(): Promise<void> {
    await this.click('sectionToggle');
    await new Promise((r) => setTimeout(r, 1000)); // Give the animation time to finish
  }

  async isSectionExpanded(): Promise<boolean> {
    const toggle = await this.getLocator('sectionToggle');
    const ariaExpanded = await toggle.getAttribute('aria-expanded');
    return ariaExpanded === 'true';
  }

  async isSectionContentVisible(): Promise<boolean> {
    return this.isVisible('sectionContent');
  }
}
