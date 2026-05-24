/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { useContext, useEffect, useRef } from 'react';

import { FormContext } from './Form';
import { createFallbackId } from './utils';

export interface UseFormFieldOpts {
  id?: string;
  name?: string;
  type?: string;
  label?: string;
  labelVisible?: boolean;
  required?: boolean;
  enabled?: boolean;
  ariaLabel?: string | undefined;
  testId?: string;
}

export function useFormField(opts: UseFormFieldOpts) {
  const formContext = useContext(FormContext);
  const idRef = useRef<string | undefined>(opts.id);

  if (!idRef.current) {
    idRef.current = formContext?.generateId() ?? createFallbackId(opts.type ?? 'input');
  }

  const inputId = idRef.current;
  const labelVisible = opts.labelVisible !== false;
  const required = opts.required === true;
  const enabled = opts.enabled !== false;

  const ariaLabel = !labelVisible && !opts.ariaLabel && opts.label ? opts.label : opts.ariaLabel;

  useEffect(() => {
    if (!formContext) {
      return undefined;
    }

    formContext.registerField(inputId, {
      name: typeof opts.name === 'string' ? opts.name : undefined,
      type: typeof opts.type === 'string' ? opts.type : 'text',
      labelVisible,
      required,
    });

    return () => {
      formContext.unregisterField(inputId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formContext, inputId, labelVisible, required, opts.name]);

  return {
    id: inputId,
    ariaLabel,
    testId: opts.testId,
    disabled: !enabled,
    labelVisible,
  };
}
