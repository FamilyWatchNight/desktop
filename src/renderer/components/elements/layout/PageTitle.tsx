import React from 'react';

export interface PageTitleProps {
  /** Title text or content */
  children: React.ReactNode;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}

/**
 * PageTitle component — standardized page heading component ensuring consistent typography and accessibility.
 *
 * @example
 * ```tsx
 * <PageTitle testId="page-title">Settings</PageTitle>
 * ```
 */
export const PageTitle: React.FC<PageTitleProps> = ({ children, className = '', testId }) => {
  return (
    <h1 className={`page-title ${className}`.trim()} data-testid={testId}>
      {children}
    </h1>
  );
};
