import React from 'react';

export interface ListItemProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  testId?: string;
  className?: string;
  status?: 'normal' | 'subtle' | 'highlight';
}

export function ListItem({
  children,
  actions,
  testId,
  className = '',
  status = 'normal',
}: ListItemProps): React.ReactElement {
  const classes = ['list-item', `list-item--${status}`, className].filter(Boolean).join(' ');

  return (
    <li className={classes} data-testid={testId}>
      <div className="list-item__content">{children}</div>
      {actions ? <div className="list-item__actions">{actions}</div> : null}
    </li>
  );
}
