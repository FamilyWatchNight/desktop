/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

export function Form({ className, testId, children, ...rest }: FormProps): React.ReactElement {
  return (
    <form className={className} data-testid={testId} {...rest}>
      {children}
    </form>
  );
}
