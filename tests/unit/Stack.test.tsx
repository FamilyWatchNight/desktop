/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import Stack from '../../src/renderer/components/elements/layout/Stack';

describe('Stack', () => {
  test('renders children and default column direction', () => {
    render(
      <Stack testId="stack-1">
        <div>One</div>
      </Stack>,
    );

    const el = screen.getByTestId('stack-1');
    expect(el).toHaveClass('stack');
    expect(el).toHaveClass('stack--column');
  });

  test('applies row direction when requested', () => {
    render(
      <Stack direction="row" testId="stack-2">
        <div>One</div>
      </Stack>,
    );

    expect(screen.getByTestId('stack-2')).toHaveClass('stack--row');
  });
});
