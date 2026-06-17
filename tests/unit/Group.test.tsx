/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { render, screen } from '@testing-library/react';

import { Group } from '../../src/renderer/components/elements/containers';

describe('Group', () => {
  test('renders children and defaults to column flow', () => {
    render(
      <Group testId="group-1">
        <div>One</div>
      </Group>,
    );

    const el = screen.getByTestId('group-1');
    expect(el).toHaveClass('group');
    expect(el).toHaveClass('group--flow-column');
    expect(el).not.toHaveClass('group--spread-none');
    expect(el).toContainHTML('<div>One</div>');
  });

  test('applies row direction when requested', () => {
    render(
      <Group flow="row" testId="group-2">
        <div>One</div>
      </Group>,
    );

    expect(screen.getByTestId('group-2')).toHaveClass('group--flow-row');
  });

  test('applies proportional and equal spread classes', () => {
    const { rerender } = render(
      <Group flow="row" spread="proportional" testId="group-3">
        <div>One</div>
      </Group>,
    );

    expect(screen.getByTestId('group-3')).toHaveClass('group--spread-proportional');
    expect(screen.getByTestId('group-3')).not.toHaveClass('group--spread-none');

    rerender(
      <Group flow="row" spread="equal" testId="group-3">
        <div>One</div>
      </Group>,
    );

    expect(screen.getByTestId('group-3')).toHaveClass('group--spread-equal');
    expect(screen.getByTestId('group-3')).not.toHaveClass('group--spread-proportional');
  });

  test('applies custom className, style and arbitrary attributes', () => {
    render(
      <Group
        flow="column"
        className="custom-group"
        style={{ padding: '4px' }}
        data-foo="bar"
        testId="group-4"
      >
        <span />
      </Group>,
    );

    const el = screen.getByTestId('group-4');
    expect(el).toHaveClass('custom-group');
    expect(el).toHaveStyle({ padding: '4px' });
    expect(el).toHaveAttribute('data-foo', 'bar');
  });

  test('allows grid props when flow is grid', () => {
    render(
      <Group
        flow="grid"
        gridTemplateColumns="1fr 2fr"
        gridAutoRows="auto"
        justifyItems="center"
        testId="group-5"
      >
        <div />
      </Group>,
    );

    const el = screen.getByTestId('group-5');
    expect(el).toHaveClass('group--flow-grid');
    expect(el).toHaveStyle({
      gridTemplateColumns: '1fr 2fr',
      gridAutoRows: 'auto',
      justifyItems: 'center',
    });
  });

  test('throws when grid-only props are used with flex flow', () => {
    expect(() =>
      render(
        <Group flow="row" gridTemplateColumns="1fr" testId="group-6">
          <div />
        </Group>,
      ),
    ).toThrow(
      'Group with flow="row" does not support grid-only layout props: gridTemplateColumns.',
    );
  });

  test('throws when flex-only props are used with grid flow', () => {
    expect(() =>
      render(
        <Group flow="grid" flexWrap="wrap" testId="group-7">
          <div />
        </Group>,
      ),
    ).toThrow('Group with flow="grid" does not support flex-only layout props: flexWrap.');
  });

  test('throws when spread is set on grid flow', () => {
    expect(() =>
      render(
        <Group flow="grid" spread="equal" testId="group-8">
          <div />
        </Group>,
      ),
    ).toThrow('Group with flow="grid" does not support flex-only layout props: spread.');
  });
});
