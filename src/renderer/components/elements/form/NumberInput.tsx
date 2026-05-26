/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { forwardRef } from 'react';

import { BaseInput } from './BaseInput';

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  labelVisible?: boolean;
  testId?: string;
  enabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  name: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => (
  <BaseInput nativeType="number" {...props} ref={ref} />
));

NumberInput.displayName = 'NumberInput';
