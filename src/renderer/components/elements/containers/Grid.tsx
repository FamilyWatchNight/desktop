import React from 'react';

export interface GridProps {
  children: React.ReactNode;
  columns?: number | string; // number -> repeat(cols, 1fr) ; string -> CSS grid-template-columns
  rows?: string;
  gap?: string;
  autoFlow?: React.CSSProperties['gridAutoFlow'];
  alignItems?: React.CSSProperties['alignItems'];
  justifyItems?: React.CSSProperties['justifyItems'];
  testId?: string;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns,
  rows,
  gap = '0.75rem',
  autoFlow,
  alignItems,
  justifyItems,
  testId,
  className = '',
}) => {
  const gridTemplateColumns =
    typeof columns === 'number' && columns > 0
      ? `repeat(${columns}, minmax(0, 1fr))`
      : (columns as string | undefined);

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    gridTemplateRows: rows,
    gap,
    gridAutoFlow: autoFlow,
    alignItems,
    justifyItems,
  };

  const classes = ['grid', className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} data-testid={testId}>
      {children}
    </div>
  );
};

export default Grid;
