/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { ExpandableMenuSection, MenuItem } from '../components/elements/navigation';
import type { PageRegistry } from '../components/pageRegistry';

import ButtonTestPage from './components/pages/ButtonTestPage';
import ExpandableMenuSectionTestPage from './components/pages/ExpandableMenuSectionTestPage';
import FormControlsTestPage from './components/pages/FormControlsTestPage';
import MenuItemTestPage from './components/pages/MenuItemTestPage';
import PageFrameworkTestPage from './components/pages/PageFrameworkTestPage';
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
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_BUTTON_TEST}`, ButtonTestPage, 'Button Test');
}

export function buildTestingMenu(): React.ReactNode {
  return <TestingMenuSection />;
}
