import React from 'react';

export interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'compact' | 'normal' | 'contiguous';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'spread';
  testId?: string;
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing = 'normal',
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
    `stack--${direction}`,
    `stack--${spacing}`,
    `stack--align-${align}`,
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
