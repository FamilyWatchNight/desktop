/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import Grid from '../../src/renderer/components/elements/layout/Grid';

describe('Grid', () => {
  test('renders grid with numeric columns', () => {
    render(
      <Grid columns={3} testId="grid-1">
        <div>A</div>
        <div>B</div>
      </Grid>,
    );

    const el = screen.getByTestId('grid-1');
    expect(el).toHaveClass('grid');
    // style computed in inline style
    expect(el.style.gridTemplateColumns).toContain('repeat(3');
  });

  test('accepts string columns value', () => {
    render(
      <Grid columns="200px 1fr" testId="grid-2">
        <div>A</div>
      </Grid>,
    );
    expect(screen.getByTestId('grid-2').style.gridTemplateColumns).toBe('200px 1fr');
  });
});
