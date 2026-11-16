/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { useCallback, useId, useRef, useState } from 'react';

export interface UseTooltipOptions {
  /**
   * When true, the tooltip opens on pointer hover, DOM focus, or spatial
   * navigation focus. Defaults to true.
   */
  enabled?: boolean;
  /** Disables tooltip behavior entirely (for example, when content is empty). */
  disabled?: boolean;
}

export interface UseTooltipResult {
  /** Stable id for the always-in-DOM description; use as `aria-describedby`. */
  descriptionId: string;
  /** Whether the tooltip is currently revealed (hovered or focused). */
  open: boolean;
  /** Individual handlers for composing with a trigger's own handlers. */
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  /** Called when the trigger gains or loses Norigin spatial-navigation focus. */
  onSpatialFocusChange: (focused: boolean) => void;
}

/**
 * A generic hover/focus trigger hook used by `Tooltip` and by controls that
 * surface a `disabledReason`. It opens the tooltip on pointer hover, DOM
 * focus, or spatial-navigation focus, and closes it when none are active.
 *
 * The returned `descriptionId` points at an always-in-DOM description element
 * (rendered by callers), so assistive technology can always resolve the
 * `aria-describedby` reference without requiring a visible tooltip.
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipResult {
  const { enabled = true, disabled = false } = options;
  const generatedId = useId();
  const descriptionId = useRef(`tooltip-${generatedId}`).current;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [spatiallyFocused, setSpatiallyFocused] = useState(false);

  const open = !disabled && enabled && (hovered || focused || spatiallyFocused);

  return {
    descriptionId,
    open,
    onMouseEnter: useCallback(() => setHovered(true), []),
    onMouseLeave: useCallback(() => setHovered(false), []),
    onFocus: useCallback(() => setFocused(true), []),
    onBlur: useCallback(() => setFocused(false), []),
    onSpatialFocusChange: useCallback((value: boolean) => setSpatiallyFocused(value), []),
  };
}
