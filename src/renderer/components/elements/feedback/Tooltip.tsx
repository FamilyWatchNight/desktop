/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { NAVIGATION_FOCUS_CHANGE_EVENT } from '../../../contexts/useNavigationFocusable';

import { useTooltip } from './useTooltip';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

function composeHandlers<E>(
  first: unknown,
  second: (event: E) => void,
  beforeSecond?: (event: E) => void,
): (event: E) => void {
  const original = first as ((event: E) => void) | undefined;
  return (event) => {
    original?.(event);
    beforeSecond?.(event);
    second(event);
  };
}

export interface TooltipProps {
  /** Text or content to show in the tooltip overlay. */
  content: React.ReactNode;
  /** The trigger element the tooltip is anchored to. */
  children: React.ReactElement;
  placement?: TooltipPlacement;
  testId?: string;
  /** Additional class name applied to the tooltip overlay. */
  className?: string;
}

/**
 * A general-purpose tooltip primitive.
 *
 * The description content is always present in the DOM (linked to the trigger
 * via `aria-describedby`) so assistive technology can read it even when the
 * tooltip is not visually revealed. The overlay is portaled to the document
 * body so the trigger remains a direct child of its original layout container.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  testId,
  className = '',
}: TooltipProps): React.ReactElement {
  const {
    descriptionId,
    open,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onSpatialFocusChange,
  } = useTooltip({});
  const trigger = React.Children.only(children);
  const triggerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerProps = (trigger.props ?? {}) as Record<string, unknown>;
  const setTriggerFromEvent = (event: React.SyntheticEvent<HTMLElement>): void => {
    triggerRef.current = event.currentTarget;
  };

  useLayoutEffect(() => {
    const handleSpatialFocusChange = (event: Event): void => {
      const { target } = event;
      if (!(target instanceof HTMLElement)) return;

      const describedBy = target.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
      if (!describedBy.includes(descriptionId)) return;

      triggerRef.current = target;
      const detail = (event as CustomEvent<{ focused: boolean }>).detail;
      onSpatialFocusChange(detail.focused);
    };

    document.addEventListener(NAVIGATION_FOCUS_CHANGE_EVENT, handleSpatialFocusChange);
    return () =>
      document.removeEventListener(NAVIGATION_FOCUS_CHANGE_EVENT, handleSpatialFocusChange);
  }, [descriptionId, onSpatialFocusChange]);

  // Compose the tooltip's hover/focus handlers with any the trigger already has,
  // so both the tooltip and the trigger's own behavior (e.g. Norigin focus
  // tracking) run on the same event.
  const composedProps = {
    onMouseEnter: composeHandlers(
      triggerProps.onMouseEnter,
      onMouseEnter,
      setTriggerFromEvent,
    ),
    onMouseLeave: composeHandlers(triggerProps.onMouseLeave, onMouseLeave),
    onFocus: composeHandlers(triggerProps.onFocus, onFocus, setTriggerFromEvent),
    onBlur: composeHandlers(triggerProps.onBlur, onBlur),
    'aria-describedby': descriptionId,
  };

  useLayoutEffect(() => {
    if (!open) return undefined;

    const triggerElement = triggerRef.current;
    const overlayElement = overlayRef.current;
    if (!triggerElement || !overlayElement) return undefined;

    const updatePosition = (): void => {
      const triggerElement = triggerRef.current;
      const overlayElement = overlayRef.current;
      if (!triggerElement || !overlayElement) return;

      const triggerRect = triggerElement.getBoundingClientRect();
      const overlayRect = overlayElement.getBoundingClientRect();
      const gap = 8;
      let top: number;
      let left: number;

      switch (placement) {
        case 'bottom':
          top = triggerRect.bottom + gap;
          left = triggerRect.left + triggerRect.width / 2;
          break;
        case 'left':
          top = triggerRect.top + triggerRect.height / 2;
          left = triggerRect.left - overlayRect.width - gap;
          break;
        case 'right':
          top = triggerRect.top + triggerRect.height / 2;
          left = triggerRect.right + gap;
          break;
        case 'top':
        default:
          top = triggerRect.top - overlayRect.height - gap;
          left = triggerRect.left + triggerRect.width / 2;
          break;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updatePosition);
    observer?.observe(triggerElement);
    observer?.observe(overlayElement);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      observer?.disconnect();
    };
  }, [open, placement]);

  const overlay = (
    <span
      ref={overlayRef}
      id={descriptionId}
      role="tooltip"
      aria-hidden={open ? undefined : 'true'}
      className={[
        'tooltip__overlay',
        `tooltip--placement-${placement}`,
        `tooltip__overlay--placement-${placement}`,
        open && 'tooltip__overlay--open',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ top: position.top, left: position.left }}
      data-testid={testId}
      data-placement={placement}
    >
      {content}
    </span>
  );

  return (
    <>
      {React.cloneElement(trigger, composedProps)}
      {createPortal(overlay, document.body)}
    </>
  );
}
