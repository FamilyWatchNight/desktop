/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { ProgressBar } from '../../src/renderer/components/elements/feedback/ProgressBar';

describe('ProgressBar', () => {
  test('renders determinate progress and label', () => {
    render(<ProgressBar current={30} max={60} showLabel testId="pb-1" />);
    const el = screen.getByTestId('pb-1');
    expect(el).toHaveAttribute('role', 'progressbar');
    expect(el).toHaveAttribute('aria-valuemin', '0');
    expect(el).toHaveAttribute('aria-valuemax', '60');
    expect(el).toHaveAttribute('aria-valuenow', '30');
    expect(el).toHaveClass('progress-bar');
    // label present
    expect(screen.getByText(/%/)).toBeDefined();
  });

  test('renders indeterminate progress with aria-busy', () => {
    render(<ProgressBar isIndeterminate showLabel testId="pb-2" />);
    const el = screen.getByTestId('pb-2');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).not.toHaveAttribute('aria-valuenow');
  });

  test('applies size classes', () => {
    render(<ProgressBar size="small" testId="pb-3" />);
    expect(screen.getByTestId('pb-3')).toHaveClass('progress-bar--small');
  });
});
