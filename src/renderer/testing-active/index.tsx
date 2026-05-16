import React, { useState } from 'react';

import type { PageRegistry } from '../components/pageRegistry';

import PageTestPage from './components/pages/PageTestPage';

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
            navigateTo('testing/page');
            setExpanded(false);
          }}
        >
          <span>Page Test</span>
        </button>
      </div>
    </div>
  );
}

export function registerTestPages(registry: PageRegistry): void {
  registry.registerPage('testing/page', PageTestPage, 'Page Test');
}

export function buildTestingMenu(navigateTo: (page: string) => void): React.ReactNode {
  return <TestingMenuSection navigateTo={navigateTo} />;
}
