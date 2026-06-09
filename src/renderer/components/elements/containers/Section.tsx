import React from 'react';

import { ContentSize } from '../../properties';

import { SectionTitle } from './SectionTitle';

export interface SectionProps {
  title?: string;
  children: React.ReactNode;
  size?: ContentSize;
  className?: string;
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
export const Section: React.FC<SectionProps> = ({
  title,
  children,
  size,
  className = '',
  testId,
}) => {
  const classes = ['section', 'container', size && `container-size-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} data-testid={testId}>
      {title && <SectionTitle>{title}</SectionTitle>}
      {children}
    </section>
  );
};
