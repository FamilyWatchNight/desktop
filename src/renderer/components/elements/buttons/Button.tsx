/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { ButtonHTMLAttributes } from 'react';

import { useNavigationFocusable } from '../../../contexts/useNavigationFocusable';
import { ContentSize } from '../../properties';
import { Tooltip } from '../feedback/Tooltip';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'link';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ContentSize;
  testId?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabledReason?: string;
}

export function Button({
  children,
  variant = 'primary',
  size,
  type = 'button',
  testId,
  className = '',
  disabled,
  disabledReason,
  onClick,
  ...rest
}: ButtonProps): React.ReactElement {
  const hasDisabledReason = disabled && Boolean(disabledReason);
  const isAriaDisabled = hasDisabledReason;
  const isNativeDisabled = disabled && !disabledReason;

  const { ref, focused, focusSelf, domRef } = useNavigationFocusable<HTMLButtonElement>({
    onActivate: () => {
      if (disabled) return;
      domRef.current?.click();
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (disabled) return;
    onClick?.(event);
  };

  const classes = [
    'button',
    focused && 'has-nav-focus',
    variant !== 'primary' ? `btn-${variant}` : '',
    size && `container--size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const button = (
    <button
      ref={ref}
      type={type}
      onFocus={focusSelf}
      className={classes}
      disabled={isNativeDisabled}
      aria-disabled={isAriaDisabled || undefined}
      onClick={handleClick}
      data-testid={testId}
      {...rest}
    >
      {children}
    </button>
  );

  if (!hasDisabledReason) {
    return button;
  }

  return <Tooltip content={disabledReason}>{button}</Tooltip>;
}
