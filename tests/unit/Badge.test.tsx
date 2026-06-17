/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { Badge } from '../../src/renderer/components/elements/feedback/Badge';

describe('Badge', () => {
  test('renders value and aria-label when provided', () => {
    render(<Badge value="5" label="Notifications" testId="badge-1" />);
    const el = screen.getByTestId('badge-1');
    expect(el).toHaveTextContent('5');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-label', 'Notifications');
  });

  test('returns null when value is null', () => {
    const { queryByTestId } = render((<Badge value={null} testId="badge-2" />) as any);
    expect(queryByTestId('badge-2')).toBeNull();
  });

  test('shows empty string when value is empty', () => {
    render(<Badge value="" testId="badge-3" />);
    expect(screen.getByTestId('badge-3')).toHaveTextContent('');
  });
});
