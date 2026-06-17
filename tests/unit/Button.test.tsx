/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../../src/renderer/components/elements/buttons/Button';

describe('Button', () => {
  test('renders with primary variant and custom data-testid', () => {
    render(
      <Button variant="primary" testId="primary-button">
        Save
      </Button>,
    );

    const button = screen.getByTestId('primary-button');
    expect(button).toHaveTextContent('Save');
    expect(button).toHaveClass('button');
  });

  test('renders disabled state and prevents clicks', () => {
    const handleClick = jest.fn();
    render(
      <Button variant="danger" disabled onClick={handleClick} testId="danger-button">
        Delete
      </Button>,
    );

    const button = screen.getByTestId('danger-button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});
