import React from 'react';

import { ContentSize } from '../../properties';

export interface ProgressBarProps {
  current?: number;
  max?: number;
  isIndeterminate?: boolean;
  showLabel?: boolean;
  size?: ContentSize;
  testId?: string;
  className?: string;
}

export function ProgressBar({
  current = 0,
  max = 100,
  isIndeterminate = false,
  showLabel = false,
  size = 'normal',
  testId,
  className = '',
}: ProgressBarProps): React.ReactElement {
  const percent =
    max > 0 && !isIndeterminate ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const classes = ['progress-bar', `container--size-${size}`, className].filter(Boolean).join(' ');
  const label = isIndeterminate ? 'Loading' : `${Math.round(percent)}%`;

  return (
    <div
      className={classes}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={isIndeterminate ? undefined : current}
      aria-busy={isIndeterminate ? 'true' : 'false'}
      data-testid={testId}
    >
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill${isIndeterminate ? ' progress-bar__fill--indeterminate' : ''}`}
          style={isIndeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
      {showLabel ? <div className="progress-bar__label">{label}</div> : null}
    </div>
  );
}
