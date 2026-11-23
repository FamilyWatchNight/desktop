/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import {
  CaretRight,
  Gear,
  House,
  ListChecks,
  Palette,
  SignOut,
  UserCircle,
} from '@phosphor-icons/react';
import type { IconProps } from '@phosphor-icons/react';
import { AccessibleIcon } from 'radix-ui';
import React from 'react';

type IconAccessibilityProps =
  { decorative: true; label?: never } | { decorative?: false; label: string };

type AppIconProps = Omit<IconProps, 'aria-hidden'> & IconAccessibilityProps;

function renderIcon(
  IconComponent: React.ComponentType<IconProps>,
  { decorative, label, ...props }: AppIconProps,
): React.ReactElement {
  const icon = <IconComponent aria-hidden={decorative || undefined} {...props} />;

  return decorative ? icon : <AccessibleIcon.Root label={label}>{icon}</AccessibleIcon.Root>;
}

export function HomeIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(House, props);
}

export function TasksIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(ListChecks, props);
}

export function SettingsIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(Gear, props);
}

export function ProfileIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(UserCircle, props);
}

export function ChevronIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(CaretRight, props);
}

export function PaletteIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(Palette, props);
}

export function SignOutIcon(props: AppIconProps): React.ReactElement {
  return renderIcon(SignOut, props);
}
