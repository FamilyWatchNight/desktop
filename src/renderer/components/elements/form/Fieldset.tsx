/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  className?: string;
  legend?: string;
  testId?: string;
  children?: React.ReactNode;
}

export function Fieldset({
  className,
  legend,
  testId,
  children,
  ...rest
}: FieldsetProps): React.ReactElement {
  return (
    <fieldset className={className} data-testid={testId} {...rest}>
      {legend ? <legend>{legend}</legend> : null}
      {children}
    </fieldset>
  );
}
