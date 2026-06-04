/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { ExpandableMenuSection, MenuItem } from '../components/elements/navigation';
import type { PageRegistry } from '../components/pageRegistry';

import BadgeTestPage from './components/pages/BadgeTestPage';
import ButtonTestPage from './components/pages/ButtonTestPage';
import CardTestPage from './components/pages/CardTestPage';
import ExpandableMenuSectionTestPage from './components/pages/ExpandableMenuSectionTestPage';
import FormControlsTestPage from './components/pages/FormControlsTestPage';
import GridTestPage from './components/pages/GridTestPage';
import ListTestPage from './components/pages/ListTestPage';
import MenuItemTestPage from './components/pages/MenuItemTestPage';
import MessageTestPage from './components/pages/MessageTestPage';
import PageFrameworkTestPage from './components/pages/PageFrameworkTestPage';
import ProgressBarTestPage from './components/pages/ProgressBarTestPage';
import StackTestPage from './components/pages/StackTestPage';
import { TEST_PAGE_IDS } from './TestPageIds';

function TestingMenuSection(): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <ExpandableMenuSection
      label="Testing"
      isExpanded={expanded}
      onExpandedChange={setExpanded}
      testId="menu-testing-section"
    >
      <MenuItem
        label="Page Framework Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_FRAMEWORK_TEST}`}
        testId="menu-testing-page"
      />
      <MenuItem
        label="Form Controls Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_FORM_CONTROLS_TEST}`}
        testId="menu-testing-form-controls-page"
      />
      <MenuItem
        label="MenuItem Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_MENU_ITEM_TEST}`}
        testId="menu-testing-menuitem-page"
      />
      <MenuItem
        label="Expandable Section Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_EXPANDABLE_SECTION_TEST}`}
        testId="menu-testing-expandable-page"
      />
      <MenuItem
        label="Message Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_MESSAGE_TEST}`}
        testId="menu-testing-message-page"
      />
      <MenuItem
        label="ProgressBar Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_PROGRESSBAR_TEST}`}
        testId="menu-testing-progressbar-page"
      />
      <MenuItem
        label="Badge Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_BADGE_TEST}`}
        testId="menu-testing-badge-page"
      />
      <MenuItem
        label="Card Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_CARD_TEST}`}
        testId="menu-testing-card-page"
      />
      <MenuItem
        label="List Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_LIST_TEST}`}
        testId="menu-testing-list-page"
      />
      <MenuItem
        label="Stack Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_STACK_TEST}`}
        testId="menu-testing-stack-page"
      />
      <MenuItem
        label="Grid Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_GRID_TEST}`}
        testId="menu-testing-grid-page"
      />
    </ExpandableMenuSection>
  );
}

export function registerTestPages(registry: PageRegistry): void {
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_FRAMEWORK_TEST}`,
    PageFrameworkTestPage,
    'Page Framework Test',
  );
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_FORM_CONTROLS_TEST}`,
    FormControlsTestPage,
    'Form Controls Test',
  );
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_MENU_ITEM_TEST}`,
    MenuItemTestPage,
    'MenuItem Test',
  );
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_EXPANDABLE_SECTION_TEST}`,
    ExpandableMenuSectionTestPage,
    'Expandable Section Test',
  );
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_MESSAGE_TEST}`,
    MessageTestPage,
    'Message Test',
  );
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_PROGRESSBAR_TEST}`,
    ProgressBarTestPage,
    'ProgressBar Test',
  );
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_BADGE_TEST}`, BadgeTestPage, 'Badge Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_CARD_TEST}`, CardTestPage, 'Card Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_LIST_TEST}`, ListTestPage, 'List Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_STACK_TEST}`, StackTestPage, 'Stack Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_GRID_TEST}`, GridTestPage, 'Grid Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_BUTTON_TEST}`, ButtonTestPage, 'Button Test');
}

export function buildTestingMenu(): React.ReactNode {
  return <TestingMenuSection />;
}
