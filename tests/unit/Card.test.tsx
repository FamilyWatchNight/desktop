/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { Card } from '../../src/renderer/components/elements/containers/Card';

describe('Card', () => {
  test('renders header, body and footer', () => {
    render(
      <Card title={<div>H</div>} footer={<div>F</div>} testId="card-1">
        <p>Body</p>
      </Card>,
    );

    const el = screen.getByTestId('card-1');
    expect(el).toHaveClass('card');
    expect(screen.getByText('H')).toBeDefined();
    expect(screen.getByText('Body')).toBeDefined();
    expect(screen.getByText('F')).toBeDefined();
  });
});
