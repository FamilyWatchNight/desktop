import React from 'react';

import { SectionTitle } from './SectionTitle';

export interface SectionProps {
  /** Optional section title */
  title?: string;

  /** Section content */
  children: React.ReactNode;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}

/**
 * Section component — semantic section grouping with optional title.
 *
 * @example
 * ```tsx
 * <Section title="API Keys" testId="api-keys-section">
 *   {/* section content *\/}
 * </Section>
 * ```
 */
export const Section: React.FC<SectionProps> = ({ title, children, className = '', testId }) => {
  return (
    <section className={`section ${className}`.trim()} data-testid={testId}>
      {title && <SectionTitle>{title}</SectionTitle>}
      {children}
    </section>
  );
};
