/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';

import { SlideOverPanel } from '../../src/renderer/components/elements/containers/SlideOverPanel';
import {
  ContentBlockingProvider,
  useContentBlockingState,
} from '../../src/renderer/contexts/ContentBlockingContext';

function ContentState(): React.ReactElement {
  const isBlocked = useContentBlockingState();
  return <main data-testid="page-content" inert={isBlocked} />;
}

describe('SlideOverPanel', () => {
  test('requires a region name and exposes top and bottom content slots', () => {
    render(
      <SlideOverPanel
        isOpen
        side="left"
        ariaLabel="Movie details"
        bottomSlot={<button type="button">Done</button>}
      >
        <p>Details</p>
      </SlideOverPanel>,
    );

    expect(screen.getByRole('region', { name: 'Movie details' })).toBeVisible();
    expect(screen.getByTestId('slide-over-panel__top')).toHaveTextContent('Details');
    expect(screen.getByTestId('slide-over-panel__bottom')).toHaveTextContent('Done');
  });

  test('supports both sides and passes the caller width to the viewport-clamped style', () => {
    const { rerender } = render(
      <SlideOverPanel isOpen side="left" ariaLabel="Details" width={900} />,
    );
    const panel = screen.getByRole('region', { name: 'Details' });

    expect(panel).toHaveClass('slide-over-panel--left');
    expect(panel).toHaveStyle({ '--slide-over-panel-width': '900px' });

    rerender(<SlideOverPanel isOpen side="right" ariaLabel="Details" />);
    expect(panel).toHaveClass('slide-over-panel--right');
    expect(panel).not.toHaveStyle({ '--slide-over-panel-width': '900px' });
  });

  test('requests Escape without changing controlled open state', () => {
    const onEscape = jest.fn();
    render(<SlideOverPanel isOpen side="left" ariaLabel="Details" onEscape={onEscape} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('region', { name: 'Details' })).toBeVisible();
  });

  test('requests backdrop dismissal only when blocking and leaves closing to the caller', () => {
    const onBackdropClick = jest.fn();
    const { rerender } = render(
      <SlideOverPanel
        isOpen
        side="left"
        ariaLabel="Details"
        blocksContent
        onBackdropClick={onBackdropClick}
      />,
    );

    fireEvent.click(screen.getByTestId('slide-over-panel__backdrop'));
    expect(onBackdropClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('region', { name: 'Details' })).toBeVisible();

    rerender(
      <SlideOverPanel isOpen side="left" ariaLabel="Details" onBackdropClick={onBackdropClick} />,
    );
    expect(screen.queryByTestId('slide-over-panel__backdrop')).not.toBeInTheDocument();
  });

  test('coordinates blocking requests and releases content when the request stops', async () => {
    const { rerender } = render(
      <ContentBlockingProvider>
        <ContentState />
        <SlideOverPanel isOpen side="left" ariaLabel="Details" blocksContent />
      </ContentBlockingProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('page-content')).toHaveAttribute('inert'));

    rerender(
      <ContentBlockingProvider>
        <ContentState />
        <SlideOverPanel isOpen side="left" ariaLabel="Details" />
      </ContentBlockingProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('page-content')).not.toHaveAttribute('inert'));
  });

  test('moves focus only when the caller provides an initial target', async () => {
    const target = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <SlideOverPanel isOpen side="left" ariaLabel="Details">
        <button type="button">No automatic focus</button>
      </SlideOverPanel>,
    );

    expect(screen.getByRole('button', { name: 'No automatic focus' })).not.toHaveFocus();

    rerender(
      <SlideOverPanel isOpen side="left" ariaLabel="Details" initialFocusTarget={target}>
        <button ref={target} type="button">
          Explicit target
        </button>
      </SlideOverPanel>,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Explicit target' })).toHaveFocus(),
    );
  });
});
