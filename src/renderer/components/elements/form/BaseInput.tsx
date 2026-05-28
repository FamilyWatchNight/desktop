/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import log from 'electron-log/renderer';
import React, { forwardRef, useContext, useEffect } from 'react';

import { GroupContext } from './GroupContext';
import { useFormField } from './useFormField';

/*
  BaseInput.tsx - explanatory overview

  Purpose:
  - A shared input component used for text, checkbox, radio and other
    primitive inputs in the Form system. It centralizes registration with
    the Form's registry, enforces runtime validation rules for grouped
    inputs (checkbox/radio), and applies `initialValue` to uncontrolled
    DOM nodes when the form becomes ready.

  Key responsibilities:
  - Derive accessibility attributes (`id`, `aria-label`) and `disabled`
    from either the provided props or the `useFormField()` helper which
    consults the parent `Form` context.
  - Register the field with the Form's `fieldsRef` registry so the
    `Form.getValues()` / `Form.reset()` implementations can query and
    manipulate the field imperatively when needed.
  - Validate group semantics at runtime:
    - When a `FormGroup` wrapper is used (for radio/checkbox groups),
      children must not specify `name` prop (group controls the name),
      and each child must provide a `value` prop.
    - These checks help developers catch misuses that would otherwise be
      hard to debug at runtime.
  - Support uncontrolled inputs initialization:
    - React's `defaultValue`/`defaultChecked` only take effect at mount.
      When `initialValues` are supplied after mount (e.g., dynamic
      initialValues from a test harness), BaseInput performs an
      imperative DOM update to set `value`/`checked` so the uncontrolled
      input reflects the intended initial state.

  Implementation notes:
  - `internalRef` is used to keep a stable ref to the DOM element. This
    ref is registered with the `Form` registry via `register()` so higher
    level functions like `reset()` can access and update the DOM.
  - Side-effects that update the DOM only run when `isReady` is true and
    an `initialValue` is present. This mirrors the `Form`'s contract that
    initial values should be applied when the form signals readiness.

  Tests & Behavior:
  - Unit tests cover the runtime validation (name/value rules) and the
    reset behavior for uncontrolled inputs - ensure changes here are
    validated by running `npm run test:unit`.

*/

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
      if (!Object.prototype.hasOwnProperty.call(rest, 'value')) {
        throw new Error(
          `${nativeType === 'checkbox' ? 'Checkbox' : 'Radio'} inside a ${nativeType} group must specify a value.`,
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
    initialValue,
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

  // Compute element props while allowing explicit props to win
  const implicitProps: Record<string, unknown> = {
    id: inputId,
    className,
    'data-testid': testId,
    ref,
    'aria-label': ariaLabel,
    type: nativeType,
    inputMode,
    disabled,
    name: nameToRegister,
  } as Record<string, unknown>;

  // If the caller didn't explicitly pass a value/defaultValue/defaultChecked, and the form provided an initialValue, apply it.
  const isCheckboxOrRadio = nativeType === 'checkbox' || nativeType === 'radio';
  const hasExplicitChecked = Object.prototype.hasOwnProperty.call(restWithoutType, 'checked');
  const hasExplicitValue = isCheckboxOrRadio
    ? false
    : Object.prototype.hasOwnProperty.call(restWithoutType, 'value');
  const hasExplicitDefault =
    Object.prototype.hasOwnProperty.call(restWithoutType, 'defaultValue') ||
    Object.prototype.hasOwnProperty.call(restWithoutType, 'defaultChecked');

  // Apply initialValue when provided by the form and the field is uncontrolled.
  // initialValue takes precedence over any defaultValue/defaultChecked in the markup when the form is ready.
  if (!hasExplicitValue && !hasExplicitChecked && initialValue !== undefined) {
    if (nativeType === 'checkbox') {
      // For grouped checkbox initialValue may be array
      if (Array.isArray(initialValue)) {
        const val = (restWithoutType as Record<string, unknown>).value as string | undefined;
        if (val !== undefined) {
          implicitProps.defaultChecked = (initialValue as unknown[]).includes(val);
        }
      } else {
        implicitProps.defaultChecked = Boolean(initialValue);
      }
    } else if (nativeType === 'radio') {
      const val = (restWithoutType as Record<string, unknown>).value as string | undefined;
      if (val !== undefined) {
        (implicitProps as Record<string, unknown>).defaultChecked = String(initialValue) === val;
      }
    } else {
      implicitProps.defaultValue = initialValue != null ? String(initialValue) : '';
    }
  } else if (!hasExplicitValue && !hasExplicitDefault && initialValue === undefined) {
    // No explicit value/default and no initialValue: leave implicitProps without default value.
  }

  // Manage an internal ref so we can imperatively update uncontrolled inputs
  const internalRef = React.useRef<HTMLInputElement | null>(null);
  const setRefs = (el: HTMLInputElement | null) => {
    internalRef.current = el;
    if (typeof ref === 'function') {
      try {
        ref(el);
      } catch {
        /* don't let a broken custom component make the whole form crash. */
        log.warn('BaseInput: failed to assign ref via function, ignoring.', { inputId });
      }
    } else if (ref && typeof ref === 'object') {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    }
  };

  const inputElement = (
    <input
      {...(implicitProps as React.InputHTMLAttributes<HTMLInputElement>)}
      {...(restWithoutType as React.InputHTMLAttributes<HTMLInputElement>)}
      ref={setRefs}
    />
  );

  // If the form provides an initialValue after mount, update the uncontrolled DOM value
  React.useEffect(() => {
    if (!internalRef.current) return;

    const el = internalRef.current;
    const hasExplicitValue = Object.prototype.hasOwnProperty.call(restWithoutType, 'value');
    const hasExplicitChecked = Object.prototype.hasOwnProperty.call(restWithoutType, 'checked');
    const isCheckboxOrRadio = nativeType === 'checkbox' || nativeType === 'radio';
    if (hasExplicitValue && !isCheckboxOrRadio) return; // controlled externally for text-like inputs
    if (hasExplicitChecked) return; // controlled externally for checkbox/radio

    if (initialValue === undefined) return;

    try {
      if (nativeType === 'checkbox') {
        if (Array.isArray(initialValue)) {
          const val = (restWithoutType as Record<string, unknown>).value as string | undefined;
          if (val !== undefined) el.checked = (initialValue as unknown[]).includes(val);
        } else {
          el.checked = Boolean(initialValue);
        }
      } else if (nativeType === 'radio') {
        const val = (restWithoutType as Record<string, unknown>).value as string | undefined;
        if (val !== undefined) el.checked = String(initialValue) === val;
      } else {
        el.value = initialValue != null ? String(initialValue) : '';
      }
    } catch {
      // ignore DOM assignment errors
    }
  }, [initialValue, nativeType, restWithoutType]);

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
