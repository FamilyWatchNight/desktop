/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useContext, useEffect, useRef } from 'react';

import { FormContext } from './Form';
import { GroupContext } from './GroupContext';

export interface CheckboxGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  className?: string;
  legend?: string;
  testId?: string;
  children?: React.ReactNode;
  name: string;
}

export function CheckboxGroup({
  className,
  legend,
  testId,
  children,
  name,
  ...rest
}: CheckboxGroupProps): React.ReactElement {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('CheckboxGroup must specify a name prop.');
  }

  const formContext = useContext(FormContext);
  const checkboxIdListRef = useRef<string[]>([]);
  const nameToUse = name;

  const groupIdRef = useRef<string | undefined>(undefined);
  if (!groupIdRef.current) {
    groupIdRef.current = formContext?.generateId();
  }

  // Provide a method for child Checkboxes to register their IDs
  const registerCheckboxId = (id: string) => {
    if (!checkboxIdListRef.current.includes(id)) {
      checkboxIdListRef.current.push(id);
    }
  };

  const unregisterCheckboxId = (id: string) => {
    checkboxIdListRef.current = checkboxIdListRef.current.filter((cid) => cid !== id);
  };

  useEffect(() => {
    if (!formContext || !groupIdRef.current) return undefined;

    formContext.registerField(groupIdRef.current, {
      name: nameToUse,
      type: 'checkbox',
      getValue: () => {
        // Use the registered checkbox IDs to find checked ones, scoped to this group
        const checked = checkboxIdListRef.current
          .map((checkboxId) => document.getElementById(checkboxId) as HTMLInputElement | null)
          .filter((el) => el?.checked)
          .map((el) => el!.value);
        return checked;
      },
    });

    return () => {
      formContext.unregisterField(groupIdRef.current!);
    };
  }, [formContext, nameToUse]);

  return (
    <GroupContext.Provider
      value={{
        name: nameToUse,
        type: 'checkbox',
        registerCheckboxId,
        unregisterCheckboxId,
      }}
    >
      <fieldset
        className={`checkbox-group${className ? ` ${className}` : ''}`}
        data-testid={testId}
        {...rest}
      >
        {legend ? <legend>{legend}</legend> : null}
        {children}
      </fieldset>
    </GroupContext.Provider>
  );
}
