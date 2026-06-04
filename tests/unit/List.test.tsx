/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

import { List } from '../../src/renderer/components/elements/containers/List';
import { ListItem } from '../../src/renderer/components/elements/containers/ListItem';

describe('List', () => {
  test('renders unordered list by default', () => {
    render(
      <List testId="list-1">
        <ListItem>One</ListItem>
      </List>,
    );

    const el = screen.getByTestId('list-1');
    expect(el.tagName.toLowerCase()).toBe('ul');
    expect(el).toHaveClass('list');
  });

  test('renders ordered list when isOrdered', () => {
    render(
      <List isOrdered testId="list-2">
        <ListItem>One</ListItem>
      </List>,
    );

    expect(screen.getByTestId('list-2').tagName.toLowerCase()).toBe('ol');
  });
});
