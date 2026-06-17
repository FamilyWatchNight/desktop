/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

import { ContentSize } from '../../properties';

export interface SectionProps {
  title?: string;
  children: React.ReactNode;
  size?: ContentSize;
  className?: string;
  testId?: string;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  size,
  className = '',
  testId,
}) => {
  const classes = ['section', 'container', size && `container--size-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} data-testid={testId}>
      {title && <h2 className={'section-title'}>{title}</h2>}
      {children}
    </section>
  );
};
