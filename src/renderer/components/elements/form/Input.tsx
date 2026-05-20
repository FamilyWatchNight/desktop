/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  labelVisible?: boolean;
  testId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelVisible = true, testId, id, ...rest }, ref) => {
    // When labelVisible is false, inject aria-label if not already provided
    const ariaLabel = !labelVisible && !rest['aria-label'] && label ? label : rest['aria-label'];
    const inputElement = (
      <input
        id={id}
        className={className}
        data-testid={testId}
        ref={ref}
        aria-label={ariaLabel}
        {...rest}
      />
    );

    if (!label || !labelVisible) {
      return inputElement;
    }

    return (
      <label className={className} htmlFor={id}>
        <span>{label}</span>
        {inputElement}
      </label>
    );
  },
);

Input.displayName = 'Input';
