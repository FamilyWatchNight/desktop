/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License
as published by the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Button } from '../../../components/elements/buttons';
import { Page, Section, SlideOverPanel } from '../../../components/elements/containers';

export default function SlideOverPanelTestPage(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const [blocksContent, setBlocksContent] = useState(true);
  const [useOversizedWidth, setUseOversizedWidth] = useState(false);
  const [outcome, setOutcome] = useState('No request yet');

  return (
    <Page title="Slide-over Panel Test" testId="page-slide-over-panel-test">
      <Section title="Panel configuration">
        <Button testId="slide-over-open" onClick={() => setIsOpen(true)}>
          Open panel
        </Button>
        <Button testId="slide-over-left" variant="secondary" onClick={() => setSide('left')}>
          Left side
        </Button>
        <Button testId="slide-over-right" variant="secondary" onClick={() => setSide('right')}>
          Right side
        </Button>
        <label>
          Block page content
          <input
            type="checkbox"
            checked={blocksContent}
            onChange={(event) => setBlocksContent(event.target.checked)}
            data-testid="slide-over-blocks-content"
          />
        </label>
        <label>
          Use oversized width
          <input
            type="checkbox"
            checked={useOversizedWidth}
            onChange={(event) => setUseOversizedWidth(event.target.checked)}
            data-testid="slide-over-oversized-width"
          />
        </label>
        <div role="status" data-testid="slide-over-outcome">
          {outcome}
        </div>
      </Section>
      <button
        type="button"
        data-testid="slide-over-page-interaction"
        style={{ marginLeft: '40vw' }}
        onClick={() => setOutcome('Page interaction selected')}
      >
        Interact with page
      </button>
      <SlideOverPanel
        side={side}
        isOpen={isOpen}
        blocksContent={blocksContent}
        width={useOversizedWidth ? 900 : undefined}
        ariaLabel="Slide-over panel demonstration"
        onEscape={() => setOutcome('Escape requested')}
        onBackdropClick={() => {
          setOutcome('Backdrop requested');
          setIsOpen(false);
        }}
        bottomSlot={
          <div className="slide-over-panel-test__footer">
            <p data-testid="slide-over-bottom-content">Bottom-anchored panel content.</p>
            <Button testId="slide-over-close" onClick={() => setIsOpen(false)}>
              Close panel
            </Button>
          </div>
        }
      >
        <div className="slide-over-panel-test__content">
          <p data-testid="slide-over-top-start">
            Flexible top content. Scroll the panel to reach the bottom slot.
          </p>
          {Array.from({ length: 16 }, (_, index) => (
            <p key={index}>Panel content {index + 1}.</p>
          ))}
          <p data-testid="slide-over-top-end">End of flexible content.</p>
        </div>
      </SlideOverPanel>
    </Page>
  );
}
