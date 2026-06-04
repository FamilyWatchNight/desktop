import React from 'react';

export interface MessageProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
  testId?: string;
  className?: string;
}

export function Message({
  type = 'info',
  children,
  testId,
  className = '',
}: MessageProps): React.ReactElement {
  const classes = ['message', `message--${type}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" data-testid={testId}>
      {children}
    </div>
  );
}
