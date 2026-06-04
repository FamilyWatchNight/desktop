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
  PAGE_MESSAGE_TEST: 'message-test',
  PAGE_PROGRESSBAR_TEST: 'progressbar-test',
  PAGE_BADGE_TEST: 'badge-test',
  PAGE_CARD_TEST: 'card-test',
  PAGE_LIST_TEST: 'list-test',
  PAGE_STACK_TEST: 'stack-test',
  PAGE_GRID_TEST: 'grid-test',
} as const;

export type TestPageId = (typeof TEST_PAGE_IDS)[keyof typeof TEST_PAGE_IDS];
