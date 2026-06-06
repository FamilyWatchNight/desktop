import React from 'react';

export interface SectionTitleProps {
  /** Title text or content */
  children: React.ReactNode;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}

/**
 * SectionTitle component — standardized section heading component ensuring consistent typography and accessibility.
 *
 * @example
 * ```tsx
 * <SectionTitle testId="section-title">API Keys</SectionTitle>
 * ```
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({ children, className = '', testId }) => {
  return (
    <h2 className={`section-title ${className}`.trim()} data-testid={testId}>
      {children}
    </h2>
  );
};
