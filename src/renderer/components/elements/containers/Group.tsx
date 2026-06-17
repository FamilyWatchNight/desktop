/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

import { ContainerGlossVariant, ContainerSpacing, ContentSize } from '../../properties';

export type GroupFlow = 'row' | 'column' | 'grid';
export type GroupFlexSpread = 'proportional' | 'equal' | 'none';

export type GroupLayoutProps = Pick<
  React.CSSProperties,
  | 'flexWrap'
  | 'justifyContent'
  | 'alignItems'
  | 'alignContent'
  | 'justifyItems'
  | 'alignSelf'
  | 'grid'
  | 'gridTemplate'
  | 'gridTemplateColumns'
  | 'gridTemplateRows'
  | 'gridTemplateAreas'
  | 'gridAutoFlow'
  | 'gridAutoColumns'
  | 'gridAutoRows'
>;

export interface GroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'>, GroupLayoutProps {
  children: React.ReactNode;
  flow?: GroupFlow;
  spread?: GroupFlexSpread;
  fillContainer?: boolean;
  testId?: string;
  className?: string;
  gridArea?: string;
  gloss?: ContainerGlossVariant;
  spacing?: ContainerSpacing;
  size?: ContentSize;
  style?: React.CSSProperties;
}

export const Group: React.FC<GroupProps> = ({
  children,
  flow = 'column',
  spread,
  fillContainer = false,
  testId,
  className = '',
  gridArea,
  gloss = 'passthrough',
  spacing,
  size,
  flexWrap,
  justifyContent,
  alignItems,
  alignContent,
  justifyItems,
  alignSelf,
  grid,
  gridTemplate,
  gridTemplateColumns,
  gridTemplateRows,
  gridTemplateAreas,
  gridAutoFlow,
  gridAutoColumns,
  gridAutoRows,
  style,
  ...rest
}) => {
  const validateLayoutProps = () => {
    if (flow !== 'grid') {
      const invalidGridProps = [
        ['grid', grid],
        ['gridTemplate', gridTemplate],
        ['gridTemplateColumns', gridTemplateColumns],
        ['gridTemplateRows', gridTemplateRows],
        ['gridTemplateAreas', gridTemplateAreas],
        ['gridAutoFlow', gridAutoFlow],
        ['gridAutoColumns', gridAutoColumns],
        ['gridAutoRows', gridAutoRows],
        ['justifyItems', justifyItems],
      ].filter(([, value]) => value !== undefined);

      if (invalidGridProps.length > 0) {
        throw new Error(
          `Group with flow="${flow}" does not support grid-only layout props: ${invalidGridProps
            .map(([name]) => name)
            .join(', ')}.`,
        );
      }
    }

    if (flow === 'grid') {
      const invalidFlexProps = [
        ['flexWrap', flexWrap],
        ['spread', spread],
      ].filter(([, value]) => value !== undefined && value !== 'none');

      if (invalidFlexProps.length > 0) {
        throw new Error(
          `Group with flow="grid" does not support flex-only layout props: ${invalidFlexProps
            .map(([name]) => name)
            .join(', ')}.`,
        );
      }
    }
  };

  validateLayoutProps();

  const layoutStyle: React.CSSProperties = {
    ...(flexWrap && { flexWrap }),
    ...(justifyContent && { justifyContent }),
    ...(alignItems && { alignItems }),
    ...(alignContent && { alignContent }),
    ...(justifyItems && { justifyItems }),
    ...(alignSelf && { alignSelf }),
    ...(grid && { grid }),
    ...(gridTemplate && { gridTemplate }),
    ...(gridTemplateColumns && { gridTemplateColumns }),
    ...(gridTemplateRows && { gridTemplateRows }),
    ...(gridTemplateAreas && { gridTemplateAreas }),
    ...(gridAutoFlow && { gridAutoFlow }),
    ...(gridAutoColumns && { gridAutoColumns }),
    ...(gridAutoRows && { gridAutoRows }),
    ...(gridArea && { gridArea }),
    ...(fillContainer && { height: '100%', width: '100%' }),
  };

  const classes = [
    'container',
    'group',
    `group--flow-${flow}`,
    spread && spread !== 'none' && `group--spread-${spread}`,
    spacing && `container--spacing-${spacing}`,
    size && `container--size-${size}`,
    gloss && `container--gloss-${gloss}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={{ ...layoutStyle, ...style }} data-testid={testId} {...rest}>
      {children}
    </div>
  );
};

export default Group;
