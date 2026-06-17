/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { fireEvent, render, screen } from '@testing-library/react';

import { MenuItem } from '../../src/renderer/components/elements/navigation/MenuItem';
import { NavigationProvider } from '../../src/renderer/contexts/NavigationContext';

describe('MenuItem', () => {
  test('renders a label and a badge with accessible status', () => {
    render(
      <NavigationProvider>
        <MenuItem label="Dashboard" badge={3} testId="menu-item" />
      </NavigationProvider>,
    );

    expect(screen.getByTestId('menu-item')).toHaveTextContent('Dashboard');
    expect(screen.getByRole('status')).toHaveTextContent('3');
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '3 new notifications');
    expect(screen.getByTestId('menu-item')).toHaveClass('menu-item');
  });

  test('derives active state from pageId via navigation context', () => {
    render(
      <NavigationProvider>
        <MenuItem label="Home" pageId="home" testId="menu-home" />
      </NavigationProvider>,
    );

    expect(screen.getByTestId('menu-home')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('menu-home')).toHaveClass('menu-item');
    expect(screen.getByTestId('menu-home')).toHaveClass('active');
  });

  test('calls navigateTo when clicked and pageId is provided', () => {
    render(
      <NavigationProvider>
        <MenuItem label="Settings" pageId="settings" testId="menu-settings" />
      </NavigationProvider>,
    );

    const menuButton = screen.getByTestId('menu-settings');
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-current', 'page');
    expect(menuButton).toHaveClass('menu-item');
    expect(menuButton).toHaveClass('active');
  });
});
