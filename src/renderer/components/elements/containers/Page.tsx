import React from 'react';

export interface PageProps {
  title?: string;
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
  testId?: string;
}

export const Page: React.FC<PageProps> = ({
  title,
  children,
  centered = false,
  className = '',
  testId,
}) => {
  const classes = ['page', centered ? 'centered' : '', className].filter(Boolean).join(' ');

  return (
    <main className={classes} data-testid={testId}>
      <div className="page-container">
        {title && <h1 className={'page-title'}>{title}</h1>}
        {children}
      </div>
    </main>
  );
};
