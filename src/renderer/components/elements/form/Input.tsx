/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useContext, useEffect, useRef } from 'react';

import { FormContext } from './Form';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  labelVisible?: boolean;
  testId?: string;
}

let fallbackIdCounter = 1;
function createFallbackId(): string {
  const id = `input-${fallbackIdCounter}`;
  fallbackIdCounter += 1;
  return id;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, labelVisible = true, testId, id, ...rest }, ref) => {
    const formContext = useContext(FormContext);
    const idRef = useRef<string | undefined>(id);

    if (!idRef.current) {
      idRef.current = formContext?.generateId() ?? createFallbackId();
    }

    const inputId = idRef.current;
    const ariaLabel = !labelVisible && !rest['aria-label'] && label ? label : rest['aria-label'];

    useEffect(() => {
      if (!formContext) {
        return undefined;
      }

      formContext.registerField(inputId, {
        name: typeof rest.name === 'string' ? rest.name : undefined,
        type: typeof rest.type === 'string' ? rest.type : 'text',
        labelVisible,
        required: rest.required === true,
      });

      return () => {
        formContext.unregisterField(inputId);
      };
    }, [formContext, inputId, labelVisible, rest.name, rest.type, rest.required]);

    const inputElement = (
      <input
        id={inputId}
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
      <label className={className} htmlFor={inputId}>
        <span>{label}</span>
        {inputElement}
      </label>
    );
  },
);

Input.displayName = 'Input';
