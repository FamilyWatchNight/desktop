/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { ListItem } from '../../src/renderer/components/elements/containers/ListItem';

describe('ListItem', () => {
  test('renders content and actions and applies status class', () => {
    render(
      <ListItem actions={<div>Act</div>} status="highlight" testId="li-1">
        Content
      </ListItem>,
    );
    const li = screen.getByTestId('li-1');
    expect(li).toHaveClass('list-item');
    expect(li).toHaveClass('list-item--highlight');
    expect(screen.getByText('Content')).toBeDefined();
    expect(screen.getByText('Act')).toBeDefined();
  });
});
