/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import React from 'react';

import { useOptionalNavigation } from '../../../contexts/NavigationContext';
import { useNavigationFocusable } from '../../../contexts/useNavigationFocusable';
import { Tooltip } from '../feedback/Tooltip';

export interface MenuItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'type'
> {
  label: ReactNode;
  icon?: ReactNode;
  badge?: number;
  pageId?: string;
  isActive?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  testId?: string;
  disabledReason?: string;
}

export function MenuItem({
  label,
  icon,
  badge,
  pageId,
  isActive,
  onClick,
  className = '',
  testId,
  type = 'button',
  disabled,
  disabledReason,
  ...rest
}: MenuItemProps): React.ReactElement {
  const hasDisabledReason = disabled && Boolean(disabledReason);
  const isAriaDisabled = hasDisabledReason;
  const isNativeDisabled = disabled && !disabledReason;

  const { ref, focused, focusSelf, domRef } = useNavigationFocusable<HTMLButtonElement>({
    onActivate: () => {
      if (disabled) return;
      domRef.current?.click();
    },
  });
  const navigation = useOptionalNavigation();
  const currentPage = pageId && navigation ? navigation.currentPage : undefined;
  const derivedActive = pageId ? currentPage === pageId : false;
  const active = isActive ?? derivedActive;

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (disabled) return;
    if (pageId) {
      if (!navigation) {
        throw new Error('MenuItem with pageId requires NavigationProvider');
      }
      navigation.navigateTo(pageId);
      return;
    }

    onClick?.(event);
  };

  const classes = ['menu-item', active ? 'active' : '', focused && 'has-nav-focus', className]
    .filter(Boolean)
    .join(' ');

  const button = (
    <button
      ref={ref}
      onFocus={focusSelf}
      type={type}
      className={classes}
      aria-current={active ? 'page' : undefined}
      onClick={handleClick}
      disabled={isNativeDisabled}
      aria-disabled={isAriaDisabled || undefined}
      data-testid={testId}
      {...rest}
    >
      {icon ? <span className="menu-item__icon">{icon}</span> : null}
      <span className="menu-item__label">{label}</span>
      {badge != null && badge > 0 ? (
        <span className="menu-badge" role="status" aria-label={`${badge} new notifications`}>
          {badge}
        </span>
      ) : null}
    </button>
  );

  if (hasDisabledReason) {
    return <Tooltip content={disabledReason}>{button}</Tooltip>;
  }

  return button;
}
