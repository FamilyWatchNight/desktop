/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { createContext, useCallback, useMemo, useRef } from 'react';

export interface FormRegistryMeta {
  required?: boolean;
  hasError?: boolean;
  name?: string;
  type?: string;
  labelVisible?: boolean;
}

export interface FormContextValue {
  generateId: () => string;
  registerField: (id: string, meta?: FormRegistryMeta) => void;
  unregisterField: (id: string) => void;
  hasLabel: (id: string) => boolean;
  registerLabel: (id: string) => void;
  unregisterLabel: (id: string) => void;
}

export const FormContext = createContext<FormContextValue | null>(null);

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  className?: string;
  testId?: string;
  autoIdPrefix?: string;
  children?: React.ReactNode;
}

export function Form({ className, testId, children, autoIdPrefix, ...rest }: FormProps): React.ReactElement {
  const counterRef = useRef(1);
  const fieldsRef = useRef(new Map<string, FormRegistryMeta>());
  const labelsRef = useRef(new Set<string>());

  const generateId = useCallback(() => {
    const prefix = autoIdPrefix ?? 'f';
    const value = `${prefix}-${counterRef.current}`;
    counterRef.current += 1;
    return value;
  }, [autoIdPrefix]);

  const registerField = useCallback((id: string, meta?: FormRegistryMeta) => {
    fieldsRef.current.set(id, meta ?? {});
  }, []);

  const unregisterField = useCallback((id: string) => {
    fieldsRef.current.delete(id);
  }, []);

  const hasLabel = useCallback((id: string) => labelsRef.current.has(id), []);
  const registerLabel = useCallback((id: string) => labelsRef.current.add(id), []);
  const unregisterLabel = useCallback((id: string) => labelsRef.current.delete(id), []);

  const contextValue = useMemo(
    () => ({
      generateId,
      registerField,
      unregisterField,
      hasLabel,
      registerLabel,
      unregisterLabel,
    }),
    [generateId, registerField, unregisterField, hasLabel, registerLabel, unregisterLabel],
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form className={className} data-testid={testId} {...rest}>
        {children}
      </form>
    </FormContext.Provider>
  );
}
