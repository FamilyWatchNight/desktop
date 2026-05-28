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
      initialValue,
    } = useFormField({
      id,
      name: nameToUse,
      type: 'select',
      label,
      labelVisible,
      required: rest.required === true,
      enabled,
      ariaLabel: (rest as Record<string, unknown>)['aria-label'] as string | undefined,
      testId,
    });

    // Compute props: if the caller didn't explicitly provide value/defaultValue and the form provided an initialValue, apply it.
    const hasExplicitValue = Object.prototype.hasOwnProperty.call(rest, 'value');

    const implicitProps: Record<string, unknown> = {
      id: inputId,
      className,
      'data-testid': testId,
      ref,
      'aria-label': ariaLabel,
      disabled,
    };

    if (!hasExplicitValue && initialValue !== undefined) {
      implicitProps.defaultValue = initialValue != null ? String(initialValue) : '';
    }

    const selectElement = (
      <select {...(implicitProps as React.SelectHTMLAttributes<HTMLSelectElement>)} {...rest} />
    );

    // If initialValue changes after mount, imperatively update the DOM value so uncontrolled select reflects it.
    React.useEffect(() => {
      if (initialValue === undefined) return;
      try {
        const el = document.getElementById(inputId) as HTMLSelectElement | null;
        if (!el) return;
        el.value = initialValue != null ? String(initialValue) : '';
      } catch {
        // ignore
      }
    }, [initialValue, inputId]);

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
