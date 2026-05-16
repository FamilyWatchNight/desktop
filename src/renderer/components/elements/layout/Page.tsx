import React from 'react';

import { PageTitle } from './PageTitle';

export interface PageProps {
  /** Page title displayed at the top */
  title?: string;

  /** Main page content */
  children: React.ReactNode;

  /** Whether to apply centered layout styling */
  centered?: boolean;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}

/**
 * Page component — semantic page container with consistent layout.
 *
 * @example
 * ```tsx
 * <Page title="Settings" centered testId="page-settings">
 *   <Section title="Display">{/* content *\/}</Section>
 * </Page>
 * ```
 */
export const Page: React.FC<PageProps> = ({
  title,
  children,
  centered = false,
  className = '',
  testId,
}) => {
  const classes = ['page', centered ? 'centered' : '', className].filter(Boolean).join(' ');

  return (
    <main className={classes} data-testid={testId}>
      <div className="page-container">
        {title && <PageTitle>{title}</PageTitle>}
        {children}
      </div>
    </main>
  );
};
