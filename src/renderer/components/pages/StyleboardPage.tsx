/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';
import '../../styles/components/StyleboardPage.scss';

import { Button } from '../elements/buttons';
import { Group, Page, Section } from '../elements/containers';

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
        <Group flow="row" spread="equal">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </Group>
        <h3>Compact, Small</h3>
        <p>Left</p>
        <Group flow="row" justifyContent="start" size="small">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
        </Group>
        <p>Center</p>
        <Group flow="row" justifyContent="center" size="small">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="info">Info</Button>
          <Button variant="link">Link</Button>
          <Button variant="success">Success</Button>
        </Group>
        <p>Right</p>
        <Group flow="row" justifyContent="end" size="small">
          <Button variant="secondary">Secondary</Button>
          <Button>Primary</Button>
        </Group>
        <h3>Large</h3>
        <Group flow="row" spread="equal" size="large">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </Group>
      </Section>
      <Section title="Colors" testId="styleboard-colors-section">
        <Group
          flow="grid"
          grid={
            '[row1-start] "gold gold gold gold gold gold gold gold gold gold gold gold" 1fr [row1-end]\n' +
            '[row2-start] "red red red red green green green green blue blue blue blue" 1fr [row2-end]\n' +
            '[row3-start] "cyan cyan cyan cyan magenta magenta magenta magenta yellow yellow yellow yellow" 1fr [row3-end]\n' +
            '[row4-start] "lime lime lime teal teal teal purple purple purple coral coral coral" 1fr [row4-end]\n' +
            '/ 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr\n'
          }
        >
          <div
            className="color-swatch"
            style={{ background: 'var(--core-gold)', gridArea: 'gold' }}
          >
            <span>Gold</span>
          </div>
          <div className="color-swatch" style={{ background: 'var(--core-red)', gridArea: 'red' }}>
            <span>Red</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-green)', gridArea: 'green' }}
          >
            <span>Green</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-blue)', gridArea: 'blue' }}
          >
            <span>Blue</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-cyan)', gridArea: 'cyan' }}
          >
            <span>Cyan</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-magenta)', gridArea: 'magenta' }}
          >
            <span>Magenta</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-yellow)', gridArea: 'yellow' }}
          >
            <span>Yellow</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-lime)', gridArea: 'lime' }}
          >
            <span>Lime</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-teal)', gridArea: 'teal' }}
          >
            <span>Teal</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-purple)', gridArea: 'purple' }}
          >
            <span>Purple</span>
          </div>
          <div
            className="color-swatch"
            style={{ background: 'var(--core-coral)', gridArea: 'coral' }}
          >
            <span>Coral</span>
          </div>
        </Group>
      </Section>
    </Page>
  );
}
