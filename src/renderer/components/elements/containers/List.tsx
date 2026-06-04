import React from 'react';

export interface ListProps {
  children: React.ReactNode;
  testId?: string;
  className?: string;
  isOrdered?: boolean;
}

export function List({
  children,
  testId,
  className = '',
  isOrdered = false,
}: ListProps): React.ReactElement {
  const classes = ['list', className].filter(Boolean).join(' ');

  if (isOrdered) {
    return (
      <ol className={classes} data-testid={testId}>
        {children}
      </ol>
    );
  }

  return (
    <ul className={classes} data-testid={testId}>
      {children}
    </ul>
  );
}
