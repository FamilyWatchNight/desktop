/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License
as published by the Free Software Foundation, version 3.
*/

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useContentBlockingRequest } from '../../../contexts/ContentBlockingContext';

export interface SlideOverPanelProps {
  side: 'left' | 'right';
  isOpen: boolean;
  ariaLabel: string;
  isInert?: boolean;
  blocksContent?: boolean;
  width?: string | number;
  children?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  initialFocusTarget?: React.RefObject<HTMLElement | null>;
  onEscape?: () => void;
  onBackdropClick?: () => void;
  className?: string;
  backdropTestId?: string;
  testId?: string;
}

export function SlideOverPanel({
  side,
  isOpen,
  ariaLabel,
  isInert = false,
  blocksContent = false,
  width,
  children,
  bottomSlot,
  initialFocusTarget,
  onEscape: onEscape,
  onBackdropClick: onBackdropClick,
  className = '',
  testId = 'slide-over-panel',
}: SlideOverPanelProps): React.ReactElement {
  useContentBlockingRequest(isOpen && blocksContent);

  useEffect(() => {
    if (!isOpen || !onEscape) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEscape]);

  useEffect(() => {
    if (!isOpen || !initialFocusTarget) return undefined;

    const frame = window.requestAnimationFrame(() => {
      initialFocusTarget.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialFocusTarget, isOpen]);

  const panelClasses = [
    'slide-over-panel',
    `slide-over-panel--${side}`,
    isOpen && 'slide-over-panel--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const style = widthValue
    ? ({ '--slide-over-panel-width': widthValue } as React.CSSProperties)
    : undefined;

  return createPortal(
    <>
      {isOpen && blocksContent && (
        <div
          className="slide-over-panel__backdrop"
          data-testid={testId + '__backdrop'}
          aria-hidden="true"
          onClick={onBackdropClick}
        />
      )}
      <section
        className={panelClasses}
        style={style}
        role="region"
        aria-label={ariaLabel}
        aria-hidden={!isOpen}
        inert={!isOpen || isInert}
        data-testid={testId}
      >
        <div className="slide-over-panel__top" data-testid={testId + '__top'}>
          {children}
        </div>
        {bottomSlot !== undefined && (
          <div className="slide-over-panel__bottom" data-testid={testId + '__bottom'}>
            {bottomSlot}
          </div>
        )}
      </section>
    </>,
    document.body,
  );
}
