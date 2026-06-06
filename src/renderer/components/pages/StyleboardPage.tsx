/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';
import '../../styles/components/StyleboardPage.scss';

import { Button, ButtonGroup } from '../elements/buttons';
import { Page, Section, Stack } from '../elements/containers';

export default function StyleboardPage(): React.ReactElement {
  return (
    <Page centered title="Styleboard" testId="page-styleboard">
      <Section testId="styleboard-content-section">
        <p>Paragraph text</p>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </p>
        <h1>Heading 1</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <h2>Heading 2</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
          sint occaecat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </Section>
      <Section title="Buttons" testId="styleboard-buttons-section">
        <h3>Normal</h3>
        <ButtonGroup>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </ButtonGroup>
        <h3>Compact, Small</h3>
        <p>Left</p>
        <ButtonGroup align="start" size="small" spacing="compact">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </ButtonGroup>
        <p>Center</p>
        <ButtonGroup align="center" size="small" spacing="compact">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="info">Info</Button>
          <Button variant="link">Link</Button>
          <Button variant="success">Success</Button>
        </ButtonGroup>
        <p>Right</p>
        <ButtonGroup align="end" size="small" spacing="compact">
          <Button variant="secondary">Secondary</Button>
          <Button>Primary</Button>
        </ButtonGroup>
        <h3>Large</h3>
        <ButtonGroup size="large">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </ButtonGroup>
      </Section>
      <Section title="Colors" testId="styleboard-colors-section">
        <Stack direction="row">
          <div className="color-swatch" style={{ background: 'var(--core-gold)' }}>
            <span>Gold</span>
          </div>
        </Stack>
        <Stack direction="row">
          <div className="color-swatch" style={{ background: 'var(--core-red)' }}>
            <span>Red</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-green)' }}>
            <span>Green</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-blue)' }}>
            <span>Blue</span>
          </div>
        </Stack>
        <Stack direction="row">
          <div className="color-swatch" style={{ background: 'var(--core-cyan)' }}>
            <span>Cyan</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-magenta)' }}>
            <span>Magenta</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-yellow)' }}>
            <span>Yellow</span>
          </div>
        </Stack>
        <Stack direction="row">
          <div className="color-swatch" style={{ background: 'var(--core-lime)' }}>
            <span>Lime</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-teal)' }}>
            <span>Teal</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-purple)' }}>
            <span>Purple</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-coral)' }}>
            <span>Coral</span>
          </div>
        </Stack>
      </Section>
    </Page>
  );
}
