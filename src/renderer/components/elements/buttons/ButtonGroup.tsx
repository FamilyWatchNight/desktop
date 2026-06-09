/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { ReactNode } from 'react';
import React from 'react';

import type { ButtonSize } from './Button';

export interface ButtonGroupProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end' | 'spread';
  spacing?: 'compact' | 'normal';
  size?: ButtonSize;
  testId?: string;
  className?: string;
}

export function ButtonGroup({
  children,
  align = 'spread',
  spacing = 'normal',
  size,
  testId,
  className = '',
}: ButtonGroupProps): React.ReactElement {
  const classes = [
    'button-group',
    `button-group--${align}`,
    size && `container-size-${size}`,
    `button-group--${spacing}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-testid={testId}>
      {children}
    </div>
  );
}
