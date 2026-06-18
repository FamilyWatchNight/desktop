/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react';
import React, { ButtonHTMLAttributes } from 'react';

import { ContentSize } from '../../properties';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'link';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ContentSize;
  testId?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size,
  type = 'button',
  testId,
  className = '',
  disabled,
  ...rest
}: ButtonProps): React.ReactElement {
  const { ref, focused, focusSelf } = useFocusable();
  const classes = [
    'button',
    focused && 'has-nav-focus',
    variant !== 'primary' ? `btn-${variant}` : '',
    size && `container--size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      onFocus={focusSelf}
      className={classes}
      disabled={disabled}
      data-testid={testId}
      {...rest}
    >
      {children}
    </button>
  );
}
