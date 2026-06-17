/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { Message } from '../../src/renderer/components/elements/feedback/Message';

describe('Message', () => {
  test('renders with default type and aria attributes', () => {
    render(<Message testId="msg-1">Hello</Message>);

    const el = screen.getByTestId('msg-1');
    expect(el).toHaveTextContent('Hello');
    expect(el).toHaveClass('message');
    expect(el).toHaveClass('message--info');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  test('applies type class when provided', () => {
    render(
      <Message type="success" testId="msg-2">
        OK
      </Message>,
    );
    expect(screen.getByTestId('msg-2')).toHaveClass('message--success');
  });
});
