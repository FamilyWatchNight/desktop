/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { forwardRef, useContext, useEffect } from 'react';

import { GroupContext } from './GroupContext';
import { useFormField } from './useFormField';

export interface BaseInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
  label?: string;
  labelVisible?: boolean;
  testId?: string;
  enabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  nativeType: string;
  labelFirst?: boolean;
}

const BaseInputImpl = (
  {
    className,
    label,
    labelVisible = true,
    testId,
    id,
    enabled = true,
    inputMode,
    nativeType,
    labelFirst = true,
    name,
    required,
    ...rest
  }: BaseInputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) => {
  const { type: _type, ...restWithoutType } = rest as Record<string, unknown>;
  void _type;
  const ariaFromRest = (restWithoutType as Record<string, unknown>)['aria-label'] as
    | string
    | undefined;

  const group = useContext(GroupContext);

  const isCheckbox = nativeType === 'checkbox';
  const isRadio = nativeType === 'radio';
  const isGrouped = group?.type === nativeType;

  if (isCheckbox || isRadio) {
    if (isGrouped) {
      if (typeof name === 'string') {
        throw new Error(
          `${nativeType === 'checkbox' ? 'Checkbox' : 'Radio'} inside a ${nativeType} group should not specify a name. The group defines the field name.`,
        );
      }
    } else if (typeof name !== 'string') {
      throw new Error(
        `${nativeType === 'checkbox' ? 'Checkbox' : 'Radio'} outside a ${nativeType} group must specify a name.`,
      );
    }
  } else if (typeof name !== 'string') {
    throw new Error(`Input of type "${nativeType}" must specify a name prop.`);
  }

  const nameToRegister = typeof name === 'string' ? name : group?.name;

  const {
    id: inputId,
    ariaLabel,
    disabled,
  } = useFormField({
    id,
    name: typeof nameToRegister === 'string' ? nameToRegister : undefined,
    type: nativeType,
    label,
    labelVisible,
    required,
    enabled,
    ariaLabel: ariaFromRest,
    testId,
  });

  // Register this radio/checkbox with the group so the group can track its ID
  useEffect(() => {
    if (nativeType === 'radio' && group?.registerRadioId) {
      group.registerRadioId(inputId);
      return () => {
        group.unregisterRadioId?.(inputId);
      };
    }
    if (nativeType === 'checkbox' && group?.registerCheckboxId) {
      group.registerCheckboxId(inputId);
      return () => {
        group.unregisterCheckboxId?.(inputId);
      };
    }
    return undefined;
  }, [nativeType, inputId, group]);

  const inputElement = (
    <input
      id={inputId}
      className={className}
      data-testid={testId}
      ref={ref}
      aria-label={ariaLabel}
      type={nativeType}
      inputMode={inputMode}
      disabled={disabled}
      name={nameToRegister}
      {...(restWithoutType as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );

  if (!label || !labelVisible) {
    return inputElement;
  }

  if (labelFirst) {
    return (
      <label className={className} htmlFor={inputId}>
        <span>{label}</span>
        {inputElement}
      </label>
    );
  }

  return (
    <label className={className} htmlFor={inputId}>
      {inputElement}
      <span>{label}</span>
    </label>
  );
};

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(BaseInputImpl);
BaseInput.displayName = 'BaseInput';
