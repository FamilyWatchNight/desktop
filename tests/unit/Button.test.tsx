/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from '../../src/renderer/components/elements/buttons/Button';
import { ButtonGroup } from '../../src/renderer/components/elements/buttons/ButtonGroup';

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

describe('ButtonGroup', () => {
  test('renders children and applies alignment and spacing classes', () => {
    render(
      <ButtonGroup align="center" spacing="compact" testId="button-group">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </ButtonGroup>,
    );

    const group = screen.getByTestId('button-group');
    expect(group).toHaveClass('button-group--center');
    expect(group).toHaveClass('button-group--compact');
    expect(group).toHaveTextContent('Cancel');
    expect(group).toHaveTextContent('Save');
  });

  test('defaults alignment to spread', () => {
    render(
      <ButtonGroup testId="default-spread">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );

    expect(screen.getByTestId('default-spread')).toHaveClass('button-group--spread');
  });

  test('applies default size to child buttons when provided', () => {
    render(
      <ButtonGroup size="large" testId="sized-group">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </ButtonGroup>,
    );

    expect(screen.getByText('Primary')).toHaveClass('button--large');
    expect(screen.getByText('Secondary')).toHaveClass('button--large');
  });

  test('preserves explicit button size overrides inside the group', () => {
    render(
      <ButtonGroup size="large" testId="override-group">
        <Button>Primary</Button>
        <Button size="small">Secondary</Button>
      </ButtonGroup>,
    );

    expect(screen.getByText('Primary')).toHaveClass('button--large');
    expect(screen.getByText('Secondary')).toHaveClass('button--small');
  });
});
