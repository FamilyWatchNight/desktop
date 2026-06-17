import React from 'react';

export interface BadgeProps {
  value: string | null;
  label?: string;
  testId?: string;
  className?: string;
}

export function Badge({
  value,
  label,
  testId,
  className = '',
}: BadgeProps): React.ReactElement | null {
  if (value === null) {
    return null;
  }

  const classes = ['badge', className].filter(Boolean).join(' ');
  const ariaLabel = label ?? undefined;

  return (
    <span className={classes} role="status" aria-label={ariaLabel} data-testid={testId}>
      {value}
    </span>
  );
}
