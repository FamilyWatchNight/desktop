/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useContext, useEffect, useRef } from 'react';

import { FormContext } from './Form';
import { GroupContext } from './GroupContext';

export interface RadioGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  className?: string;
  legend?: string;
  testId?: string;
  children?: React.ReactNode;
  name: string;
}

export function RadioGroup({
  className,
  legend,
  testId,
  children,
  name,
  ...rest
}: RadioGroupProps): React.ReactElement {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('RadioGroup must specify a name prop.');
  }

  const formContext = useContext(FormContext);
  const radioIdListRef = useRef<string[]>([]);
  const nameToUse = name;

  // Register a group-level getter with the form so Form.getValues prefers this
  const groupIdRef = useRef<string | undefined>(undefined);
  if (!groupIdRef.current) {
    groupIdRef.current = formContext?.generateId();
  }

  // Provide a method for child Radios to register their IDs
  const registerRadioId = (id: string) => {
    if (!radioIdListRef.current.includes(id)) {
      radioIdListRef.current.push(id);
    }
  };

  const unregisterRadioId = (id: string) => {
    radioIdListRef.current = radioIdListRef.current.filter((rid) => rid !== id);
  };

  useEffect(() => {
    if (!formContext || !groupIdRef.current) return undefined;

    formContext.registerField(groupIdRef.current, {
      name: nameToUse,
      type: 'radio',
      getValue: () => {
        // Use the registered radio IDs to find the checked one, scoped to this form
        for (const radioId of radioIdListRef.current) {
          const el = document.getElementById(radioId) as HTMLInputElement | null;
          if (el?.checked) {
            return el.value;
          }
        }
        return null;
      },
    });

    return () => {
      formContext.unregisterField(groupIdRef.current!);
    };
  }, [formContext, nameToUse]);

  return (
    <GroupContext.Provider
      value={{ name: nameToUse, type: 'radio', registerRadioId, unregisterRadioId }}
    >
      <fieldset
        className={`radio-group${className ? ` ${className}` : ''}`}
        data-testid={testId}
        {...rest}
      >
        {legend ? <legend>{legend}</legend> : null}
        {children}
      </fieldset>
    </GroupContext.Provider>
  );
}
