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

  test('exposes disabledReason via aria-disabled and aria-describedby', () => {
    render(
      <Button disabled disabledReason="This role is assigned" testId="reason-button">
        Delete
      </Button>,
    );

    const button = screen.getByTestId('reason-button');
    // Remains focusable so the reason can be reached; not natively disabled.
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-describedby');

    const describedBy = button.getAttribute('aria-describedby') as string;
    const description = document.getElementById(describedBy);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('This role is assigned');
  });

  test('does not activate when disabled with a reason', () => {
    const handleClick = jest.fn();
    render(
      <Button
        disabled
        disabledReason="This role is assigned"
        onClick={handleClick}
        testId="reason-noop"
      >
        Delete
      </Button>,
    );

    const button = screen.getByTestId('reason-noop');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('does not add aria-describedby when disabled without a reason', () => {
    render(
      <Button disabled testId="plain-disabled">
        Delete
      </Button>,
    );

    const button = screen.getByTestId('plain-disabled');
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-describedby');
  });
});
