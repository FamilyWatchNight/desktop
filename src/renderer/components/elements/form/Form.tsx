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
  // Optional callback to obtain the current value for this field/group
  getValue?: () => unknown;
}

export interface FormContextValue {
  generateId: () => string;
  registerField: (id: string, meta?: FormRegistryMeta) => void;
  unregisterField: (id: string) => void;
  hasLabel: (id: string) => boolean;
  registerLabel: (id: string) => void;
  unregisterLabel: (id: string) => void;
  // Extract a name -> value map from the current form DOM/state
  getValues: () => Record<string, unknown>;
}

export const FormContext = createContext<FormContextValue | null>(null);

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  className?: string;
  testId?: string;
  autoIdPrefix?: string;
  formContextRef?: React.MutableRefObject<FormContextValue | null>;
  children?: React.ReactNode;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, testId, children, autoIdPrefix, formContextRef, ...rest }, ref) => {
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

    const getValues = useCallback((): Record<string, unknown> => {
      const byName: Record<string, Array<{ id: string; meta: FormRegistryMeta }>> = {};

      for (const [id, meta] of fieldsRef.current.entries()) {
        if (!meta || !meta.name) continue;
        const name = meta.name as string;
        byName[name] = byName[name] || [];
        byName[name].push({ id, meta });
      }

      const result: Record<string, unknown> = {};

      for (const [name, entries] of Object.entries(byName)) {
        // If a group or a single field provided a getValue callback, use it.
        const groupMetaWithGetter = entries.find((e) => typeof e.meta.getValue === 'function');
        if (groupMetaWithGetter) {
          try {
            result[name] = groupMetaWithGetter.meta.getValue!();
          } catch {
            result[name] = null;
          }
          continue;
        }

        // Multiple elements with the same name => treat as grouped inputs
        if (entries.length > 1) {
          const sampleType = entries[0].meta.type;
          if (sampleType === 'radio') {
            const el = document.querySelector(
              `input[name="${name}"]:checked`,
            ) as HTMLInputElement | null;
            result[name] = el ? el.value : null;
            continue;
          }

          if (sampleType === 'checkbox') {
            const checked = Array.from(
              document.querySelectorAll(`input[name="${name}"]:checked`),
            ) as HTMLInputElement[];
            result[name] = checked.map((c) => c.value);
            continue;
          }

          // Fallback: collect values
          result[name] = entries.map((e) => {
            const el = document.getElementById(e.id) as HTMLInputElement | HTMLSelectElement | null;
            if (!el) return null;
            return 'value' in el ? (el as HTMLInputElement | HTMLSelectElement).value : null;
          });
          continue;
        }

        // Single entry: try getValue or read DOM
        const single = entries[0];
        if (typeof single.meta.getValue === 'function') {
          try {
            result[name] = single.meta.getValue!();
          } catch {
            result[name] = null;
          }
          continue;
        }

        const el = document.getElementById(single.id) as
          | HTMLInputElement
          | HTMLSelectElement
          | null;
        if (!el) {
          result[name] = null;
        } else if ('checked' in el && el.type === 'checkbox') {
          result[name] = (el as HTMLInputElement).checked;
        } else if ('value' in el) {
          result[name] = (el as HTMLInputElement | HTMLSelectElement).value;
        } else {
          result[name] = null;
        }
      }

      return result;
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
        getValues,
      }),
      [
        generateId,
        registerField,
        unregisterField,
        hasLabel,
        registerLabel,
        unregisterLabel,
        getValues,
      ],
    );

    React.useEffect(() => {
      if (formContextRef) {
        formContextRef.current = contextValue;
        return () => {
          formContextRef.current = null;
        };
      }
      return undefined;
    }, [contextValue, formContextRef]);

    return (
      <FormContext.Provider value={contextValue}>
        <form ref={ref} className={className} data-testid={testId} {...rest}>
          {children}
        </form>
      </FormContext.Provider>
    );
  },
);

Form.displayName = 'Form';
