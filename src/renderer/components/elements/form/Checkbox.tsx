/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { forwardRef } from 'react';

import { BaseInput } from './BaseInput';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  labelVisible?: boolean;
  testId?: string;
  enabled?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => (
  <BaseInput nativeType="checkbox" labelFirst={false} {...props} ref={ref} />
));

Checkbox.displayName = 'Checkbox';
