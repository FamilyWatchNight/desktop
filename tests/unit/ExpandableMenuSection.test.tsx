/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { fireEvent, render, screen } from '@testing-library/react';

import { ExpandableMenuSection } from '../../src/renderer/components/elements/navigation/ExpandableMenuSection';

describe('ExpandableMenuSection', () => {
  test('renders label and collapses children by default', () => {
    render(
      <ExpandableMenuSection label="More options" testId="expandable-section">
        <div>Child content</div>
      </ExpandableMenuSection>,
    );

    const header = screen.getByRole('button', { name: /more options/i });
    const region = screen.getByTestId('expandable-section-content');

    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(region).toHaveAttribute('aria-hidden', 'true');
    expect(region).toHaveTextContent('Child content');
  });

  test('toggles expanded state when clicked', () => {
    render(
      <ExpandableMenuSection label="More options" testId="expandable-section">
        <div>Child content</div>
      </ExpandableMenuSection>,
    );

    const header = screen.getByRole('button', { name: /more options/i });
    const region = screen.getByTestId('expandable-section-content');

    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(region).toHaveAttribute('aria-hidden', 'false');
  });

  test('calls onExpandedChange when controlled and clicked', () => {
    const handleExpandedChange = jest.fn();

    render(
      <ExpandableMenuSection
        label="Advanced"
        isExpanded={false}
        onExpandedChange={handleExpandedChange}
        testId="controlled-section"
      >
        <div>Controlled content</div>
      </ExpandableMenuSection>,
    );

    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));

    expect(handleExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('controlled-section-content')).toHaveAttribute('aria-hidden', 'true');
  });
});
