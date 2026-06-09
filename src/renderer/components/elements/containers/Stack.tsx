import React from 'react';

import { ContainerGlossVariant, ContentSize } from '../../properties';

export interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'compact' | 'normal' | 'contiguous';
  size?: ContentSize;
  gloss?: ContainerGlossVariant;
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'spread';
  testId?: string;
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing = 'normal',
  size,
  gloss,
  wrap = false,
  align = 'spread',
  testId,
  className = '',
}) => {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    flexWrap: wrap ? 'wrap' : undefined,
  };

  const classes = [
    'stack',
    'container',
    `stack--${direction}`,
    `stack--${spacing}`,
    `stack--align-${align}`,
    size && `container-size-${size}`,
    gloss && `container-gloss-${gloss}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} data-testid={testId}>
      {children}
    </div>
  );
};

export default Stack;
