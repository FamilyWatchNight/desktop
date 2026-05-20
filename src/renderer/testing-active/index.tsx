/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import type { PageRegistry } from '../components/pageRegistry';

import FormControlsTestPage from './components/pages/FormControlsTestPage';
import PageFrameworkTestPage from './components/pages/PageFrameworkTestPage';
import { TEST_PAGE_IDS } from './TestPageIds';

interface TestingMenuSectionProps {
  navigateTo: (page: string) => void;
}

function TestingMenuSection({ navigateTo }: TestingMenuSectionProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`menu-system ${expanded ? 'expanded' : 'collapsed'}`}
      data-testid="menu-testing-section"
    >
      <button
        type="button"
        className="menu-system-toggle"
        data-testid="menu-testing-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="menu-testing-items"
      >
        <span className="menu-system-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        <span className="menu-system-label">Testing</span>
      </button>
      <div id="menu-testing-items" className="menu-system-items">
        <button
          type="button"
          className="menu-item"
          data-testid="menu-testing-page"
          onClick={() => {
            navigateTo(`testing/${TEST_PAGE_IDS.PAGE_FRAMEWORK_TEST}`);
            setExpanded(false);
          }}
        >
          <span>Page Framework Test</span>
        </button>
        <button
          type="button"
          className="menu-item"
          data-testid="menu-testing-form-controls-page"
          onClick={() => {
            navigateTo(`testing/${TEST_PAGE_IDS.PAGE_FORM_CONTROLS_TEST}`);
            setExpanded(false);
          }}
        >
          <span>Form Controls Test</span>
        </button>
      </div>
    </div>
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
}

export function buildTestingMenu(navigateTo: (page: string) => void): React.ReactNode {
  return <TestingMenuSection navigateTo={navigateTo} />;
}
