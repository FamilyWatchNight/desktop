/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

export interface CheckboxGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  className?: string;
  legend?: string;
  testId?: string;
  children?: React.ReactNode;
}

export function CheckboxGroup({
  className,
  legend,
  testId,
  children,
  ...rest
}: CheckboxGroupProps): React.ReactElement {
  return (
    <fieldset
      className={`checkbox-group${className ? ` ${className}` : ''}`}
      data-testid={testId}
      {...rest}
    >
      {legend ? <legend>{legend}</legend> : null}
      {children}
    </fieldset>
  );
}
