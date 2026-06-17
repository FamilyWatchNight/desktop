/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

import {
  ContainerSpacing,
  type ContainerGlossVariant,
  type ContentSize,
} from '../../properties/containers';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  gloss?: ContainerGlossVariant;
  spacing?: ContainerSpacing;
  size?: ContentSize;
  testId?: string;
  className?: string;
  gridArea?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  gloss = 'flat',
  size,
  spacing,
  testId,
  className = '',
  gridArea,
}) => {
  const classes = [
    'card',
    'container',
    gloss && `container--gloss-${gloss}`,
    spacing && `container--spacing-${spacing}`,
    size && `container--size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    gridArea,
  };

  return (
    <div className={classes} data-testid={testId} style={style}>
      {title ? <div className="card__header">{title}</div> : null}
      <div className="card__body">{children}</div>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </div>
  );
};
