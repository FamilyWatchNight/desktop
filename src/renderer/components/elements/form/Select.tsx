/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

import { useFormField } from './useFormField';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  label?: string;
  labelVisible?: boolean;
  testId?: string;
  enabled?: boolean;
  name: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, labelVisible = true, testId, id, enabled = true, ...rest }, ref) => {
    const nameToUse = typeof rest.name === 'string' ? rest.name : undefined;
    if (!nameToUse) {
      throw new Error('Select must specify a name prop.');
    }

    const {
      id: inputId,
      ariaLabel,
      disabled,
    } = useFormField({
      id,
      name: nameToUse,
      type: 'select',
      label,
      labelVisible,
      required: rest.required === true,
      enabled,
      ariaLabel: (rest as any)['aria-label'],
      testId,
    });

    const selectElement = (
      <select
        id={inputId}
        className={className}
        data-testid={testId}
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled}
        {...rest}
      />
    );

    if (!label || !labelVisible) {
      return selectElement;
    }

    return (
      <label className={className} htmlFor={inputId}>
        <span>{label}</span>
        {selectElement}
      </label>
    );
  },
);

Select.displayName = 'Select';
