import React from 'react';

import { type ContainerGlossVariant, type ContentSize } from '../../properties/containers';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  gloss?: ContainerGlossVariant;
  size?: ContentSize;
  testId?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  gloss = 'flat',
  size = 'normal',
  testId,
  className = '',
}) => {
  const classes = ['card', `container-gloss-${gloss}`, `container-size-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-testid={testId}>
      {title ? <div className="card__header">{title}</div> : null}
      <div className="card__body">{children}</div>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </div>
  );
};
