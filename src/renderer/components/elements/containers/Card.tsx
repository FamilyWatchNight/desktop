import React from 'react';
export type CardVariant = 'glassy' | 'flat' | 'transparent';
export type CardSize = 'small' | 'medium' | 'large';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  testId?: string;
  className?: string;
}

export function Card({
  title,
  children,
  footer,
  variant = 'flat',
  size = 'medium',
  testId,
  className = '',
}: CardProps): React.ReactElement {
  const classes = ['card', `card--${variant}`, `card--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-testid={testId}>
      {title ? <div className="card__header">{title}</div> : null}
      <div className="card__body">{children}</div>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </div>
  );
}
