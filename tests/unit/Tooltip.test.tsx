/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ButtonHTMLAttributes, ReactElement } from 'react';

import { Button } from '../../src/renderer/components/elements/buttons/Button';
import { Tooltip } from '../../src/renderer/components/elements/feedback/Tooltip';
import { NavigationProvider } from '../../src/renderer/contexts/NavigationContext';
import { useNavigationFocusable } from '../../src/renderer/contexts/useNavigationFocusable';

describe('Tooltip', () => {
  function SpatialFocusable({
    focusKey,
    ...buttonProps
  }: { focusKey: string } & ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
    const { ref } = useNavigationFocusable<HTMLButtonElement>({ focusKey });
    return (
      <button ref={ref} {...buttonProps} data-testid={focusKey}>
        {focusKey}
      </button>
    );
  }

  test('reveals on pointer hover and hides on leave', () => {
    render(
      <Tooltip content="Delete is unavailable" testId="tooltip-1">
        <Button data-testid="trigger">Delete</Button>
      </Tooltip>,
    );

    const overlay = screen.getByTestId('tooltip-1');
    const trigger = screen.getByTestId('trigger');

    expect(overlay).toHaveClass('tooltip__overlay');
    expect(overlay).toHaveClass('tooltip__overlay--placement-top');
    expect(overlay).not.toHaveClass('tooltip__overlay--open');

    fireEvent.mouseEnter(trigger);
    expect(overlay).toHaveClass('tooltip__overlay--open');

    fireEvent.mouseLeave(trigger);
    expect(overlay).not.toHaveClass('tooltip__overlay--open');
  });

  test('reveals on keyboard focus and hides on blur', () => {
    render(
      <Tooltip content="Delete is unavailable" testId="tooltip-2">
        <Button data-testid="trigger">Delete</Button>
      </Tooltip>,
    );

    const overlay = screen.getByTestId('tooltip-2');
    const trigger = screen.getByTestId('trigger');

    fireEvent.focus(trigger);
    expect(overlay).toHaveClass('tooltip__overlay--open');

    fireEvent.blur(trigger);
    expect(overlay).not.toHaveClass('tooltip__overlay--open');
  });

  test('reveals while a trigger is spatially focused and hides when focus moves away', async () => {
    render(
      <NavigationProvider>
        <Tooltip content="This is unavailable" testId="spatial-tooltip">
          <SpatialFocusable focusKey="tooltip-spatial-trigger" />
        </Tooltip>
        <SpatialFocusable focusKey="other-spatial-trigger" />
      </NavigationProvider>,
    );

    const overlay = screen.getByTestId('spatial-tooltip');

    await act(async () => {
      await setFocus('tooltip-spatial-trigger');
    });
    await waitFor(() => expect(overlay).toHaveClass('tooltip__overlay--open'));

    await act(async () => {
      await setFocus('other-spatial-trigger');
    });
    await waitFor(() => expect(overlay).not.toHaveClass('tooltip__overlay--open'));
  });

  test('links trigger to the description via aria-describedby', () => {
    render(
      <Tooltip content="Delete is unavailable" testId="tooltip-3">
        <Button data-testid="trigger">Delete</Button>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');
    const overlay = screen.getByTestId('tooltip-3');

    expect(trigger).toHaveAttribute('aria-describedby', overlay.id);
    expect(overlay.id).toBeTruthy();
  });

  test('always keeps the description in the DOM', () => {
    render(
      <Tooltip content="Delete is unavailable" testId="tooltip-4">
        <Button data-testid="trigger">Delete</Button>
      </Tooltip>,
    );

    // Even when closed, the description element exists (not unmounted).
    expect(screen.getByTestId('tooltip-4')).toBeInTheDocument();
  });

  test('keeps the trigger as a direct child of its layout container', () => {
    render(
      <div data-testid="layout-container">
        <Tooltip content="Delete is unavailable" testId="tooltip-layout">
          <Button data-testid="layout-trigger">Delete</Button>
        </Tooltip>
      </div>,
    );

    const container = screen.getByTestId('layout-container');
    const trigger = screen.getByTestId('layout-trigger');
    const overlay = screen.getByTestId('tooltip-layout');

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(trigger);
    expect(overlay.parentElement).toBe(document.body);
  });

  test.each([
    ['top', '32px', '90px'],
    ['bottom', '108px', '90px'],
    ['left', '90px', '-48px'],
    ['right', '90px', '148px'],
  ] as const)('positions the %s tooltip relative to its trigger', (placement, top, left) => {
    render(
      <Tooltip content="Reason" placement={placement} testId="positioned-tooltip">
        <Button data-testid="positioned-trigger">Action</Button>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('positioned-trigger');
    const overlay = screen.getByTestId('positioned-tooltip');
    Object.defineProperty(trigger, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(40, 80, 100, 20),
    });
    Object.defineProperty(overlay, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, 0, 80, 40),
    });

    fireEvent.focus(trigger);

    expect(overlay).toHaveStyle({ top, left });
  });

  test('merges trigger props so the original handlers still run', () => {
    const onClick = jest.fn();
    render(
      <Tooltip content="reason">
        <Button data-testid="trigger" onClick={onClick}>
          Delete
        </Button>
      </Tooltip>,
    );

    fireEvent.click(screen.getByTestId('trigger'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});