/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Card, Group, Page, Section } from '../../../components/elements/containers';
import { GroupFlexSpread, GroupFlow } from '../../../components/elements/containers/Group';
import { Message } from '../../../components/elements/feedback';
import { ContainerSpacing, ContentSize } from '../../../components/properties';
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: {
    hasError: boolean;
    error?: Error;
    componentStack?: string;
    ownerStack?: string | null;
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(_error: Error, info: { componentStack?: string }) {
    this.setState({
      componentStack: info.componentStack,
    });
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error: error,
      ownerStack: React.captureOwnerStack(),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Message type="error">
          <p>{this.state?.error?.message}</p>
          <p />
          {this.state.componentStack && <pre>{this.state.componentStack}</pre>}
          <p />
          {this.state.ownerStack && <pre>{this.state.ownerStack}</pre>}
        </Message>
      );
    }

    return this.props.children;
  }
}

export default function GroupTestPage(): React.ReactElement {
  const [spacing, setSpacing] = useState<ContainerSpacing>('normal');
  const [flow, setFlow] = useState<GroupFlow>('grid');
  const [size, setSize] = useState<ContentSize>('small');
  const [cellCount, setCellCount] = useState<number>(17);
  const [grid, setGrid] = useState<string | undefined>(
    '[row1-start] "card-1 card-1 card-1 card-1 card-1 card-1" 2em [row1-end]\n' +
      '[row2-start] "card-2 card-3 card-4 card-4 card-5 card-5" 3em [row2-end]\n' +
      '[row3-start] "card-2 card-3 card-6 card-7 card-5 card-5" 4em [row3-end]\n' +
      '[row4-start] "card-2 card-8 card-8 card-9 card-9 card-10" 5em [row4-end]\n' +
      '[row5-start] "card-11 card-11 card-12 card-12 card-13 card-13" 6em [row5-end]\n' +
      '[row6-start] "card-11 card-11 card-14 card-15 card-16 card-17" 7em [row6-end]\n' +
      '/ 6em 8em 10em 12em 14em 16em\n',
  );
  const [createGridAreas, setCreateGridAreas] = useState<boolean>(true);
  const [spread, setSpread] = useState<GroupFlexSpread | undefined>(undefined);
  const [wrap, setWrap] = useState<boolean>(false);
  const [height, setHeight] = useState<string>('30rem');

  const style: React.CSSProperties = {
    height: height,
  };

  return (
    <>
      <Page title="Group Test" testId="stack-test-page">
        <Section title="Preview">
          <div style={style}>
            <ErrorBoundary key={flow + spread + wrap}>
              <Group
                flow={flow}
                fillContainer={true}
                testId="group-preview"
                spacing={spacing}
                size={size}
                grid={flow === 'grid' ? grid : undefined}
                spread={flow !== 'grid' ? spread : undefined}
                {...(wrap && flow !== 'grid' ? { flexWrap: 'wrap' } : {})}
              >
                {Array.from({ length: cellCount }, (_, i) => (
                  <Card key={i + 1} gridArea={createGridAreas ? `card-${i + 1}` : undefined}>
                    Card {i + 1}
                  </Card>
                ))}
              </Group>
            </ErrorBoundary>
          </div>
        </Section>
      </Page>

      <Section title="Test Controls">
        <label>
          Flow:
          <select
            defaultValue={flow}
            onChange={(e) => setFlow(e.target.value as GroupFlow)}
            data-testid="group-flow-select"
          >
            <option value="grid">grid</option>
            <option value="row">row</option>
            <option value="column">column</option>
          </select>
        </label>
        {flow === 'grid' && (
          <label>
            Grid:
            <textarea
              defaultValue={grid}
              onChange={(e) => {
                if (e.target.value.trim() === '') {
                  setGrid(undefined);
                } else {
                  setGrid(e.target.value);
                }
              }}
              data-testid="group-rows-input"
            />
          </label>
        )}
        {flow === 'grid' && (
          <label>
            Create Grid Areas
            <input
              type="checkbox"
              checked={createGridAreas}
              onChange={(e) => setCreateGridAreas(e.target.checked)}
              data-testid="group-create-grid-areas-input"
            />
          </label>
        )}
        {flow !== 'grid' && (
          <label>
            Wrap
            <input
              type="checkbox"
              checked={wrap}
              onChange={(e) => setWrap(e.target.checked)}
              data-testid="group-wrap-input"
            />
          </label>
        )}
        {flow !== 'grid' && (
          <label>
            Spread:
            <select
              defaultValue={spread}
              onChange={(e) => setSpread(e.target.value as GroupFlexSpread)}
              data-testid="group-spread-select"
            >
              <option value="none">none</option>
              <option value="proportional">proportional</option>
              <option value="equal">equal</option>
            </select>
          </label>
        )}
        <label>
          Count
          <input
            type="number"
            defaultValue={cellCount}
            onChange={(e) => setCellCount(parseInt(e.target.value, 10))}
            data-testid="group-count-input"
          />
        </label>
        <label>
          Section Height
          <input
            type="text"
            defaultValue={height}
            onChange={(e) => setHeight(e.target.value)}
            data-testid="group-height-input"
          />
        </label>
        <label>
          Size:
          <select
            defaultValue={size}
            onChange={(e) => setSize(e.target.value as ContentSize)}
            data-testid="group-size-select"
          >
            <option value="small">small</option>
            <option value="normal">normal</option>
            <option value="large">large</option>
          </select>
        </label>
        <label>
          Spacing:
          <select
            defaultValue={spacing}
            onChange={(e) => setSpacing(e.target.value as ContainerSpacing)}
            data-testid="group-spacing-select"
          >
            <option value="compact">compact</option>
            <option value="normal">normal</option>
            <option value="contiguous">contiguous</option>
          </select>
        </label>
      </Section>
    </>
  );
}
