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
import GroupTestPage from './components/pages/GroupTestPage';
import MenuItemTestPage from './components/pages/MenuItemTestPage';
import MessageTestPage from './components/pages/MessageTestPage';
import ModalTestPage from './components/pages/ModalTestPage';
import PageFrameworkTestPage from './components/pages/PageFrameworkTestPage';
import ProgressBarTestPage from './components/pages/ProgressBarTestPage';
import SlideOverPanelTestPage from './components/pages/SlideOverPanelTestPage';
import TooltipTestPage from './components/pages/TooltipTestPage';
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
        label="Button Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_BUTTON_TEST}`}
        testId="menu-testing-button-page"
      />
      <MenuItem
        label="Card Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_CARD_TEST}`}
        testId="menu-testing-card-page"
      />
      <MenuItem
        label="Group Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_GROUP_TEST}`}
        testId="menu-testing-group-page"
      />
      <MenuItem
        label="Tooltip / Disabled Reason Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_TOOLTIP_TEST}`}
        testId="menu-testing-tooltip-page"
      />
      <MenuItem
        label="Modal Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_MODAL_TEST}`}
        testId="menu-testing-modal-page"
      />
      <MenuItem
        label="Slide-over Panel Test"
        pageId={`testing/${TEST_PAGE_IDS.PAGE_SLIDE_OVER_PANEL_TEST}`}
        testId="menu-testing-slide-over-panel-page"
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
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_BUTTON_TEST}`, ButtonTestPage, 'Badge Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_CARD_TEST}`, CardTestPage, 'Card Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_GROUP_TEST}`, GroupTestPage, 'Group Test');
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_BUTTON_TEST}`, ButtonTestPage, 'Button Test');
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_TOOLTIP_TEST}`,
    TooltipTestPage,
    'Tooltip / Disabled Reason Test',
  );
  registry.registerPage(`testing/${TEST_PAGE_IDS.PAGE_MODAL_TEST}`, ModalTestPage, 'Modal Test');
  registry.registerPage(
    `testing/${TEST_PAGE_IDS.PAGE_SLIDE_OVER_PANEL_TEST}`,
    SlideOverPanelTestPage,
    'Slide-over Panel Test',
  );
}

export function buildTestingMenu(): React.ReactNode {
  return <TestingMenuSection />;
}
