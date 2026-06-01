/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

export const TEST_PAGE_IDS = {
  PAGE_FRAMEWORK_TEST: 'page-framework',
  PAGE_FORM_CONTROLS_TEST: 'form-controls',
  PAGE_MENU_ITEM_TEST: 'menu-item-test',
  PAGE_EXPANDABLE_SECTION_TEST: 'expandable-section-test',
  PAGE_BUTTON_TEST: 'button-test',
} as const;

export type TestPageId = (typeof TEST_PAGE_IDS)[keyof typeof TEST_PAGE_IDS];
