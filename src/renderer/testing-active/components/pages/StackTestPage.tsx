import React, { useState } from 'react';

import { Card, Page, Section, Stack } from '../../../components/elements/containers';
import { ContentSize } from '../../../components/properties';

export default function StackTestPage(): React.ReactElement {
  const [spacing, setSpacing] = useState<'normal' | 'compact' | 'contiguous'>('normal');
  const [direction, setDirection] = useState<'row' | 'column'>('column');
  const [size, setSize] = useState<ContentSize>('normal');

  const [props, setProps] = useState({
    wrap: true,
    align: 'stretch',
    justify: 'flex-start',
    count: 3,
  });

  const updateProp = (key: string, value: unknown): void => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Page title="Stack Test" testId="stack-test-page">
        <Section title="Preview">
          <Stack
            testId="stack-preview"
            spacing={spacing}
            size={size}
            direction={direction}
            wrap={props.wrap}
            gloss="passthrough"
            align={props.align as 'start' | 'center' | 'end' | 'spread'}
          >
            {Array.from({ length: props.count }, (_, i) => (
              <Card key={i}>Card {i + 1}</Card>
            ))}
          </Stack>
        </Section>
      </Page>

      <Section title="Test Controls">
        <label>
          Count
          <input
            type="number"
            value={props.count}
            onChange={(e) => updateProp('count', parseInt(e.target.value, 10))}
            data-testid="stack-count-input"
          />
        </label>
        <label>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ContentSize)}
            data-testid="stack-size-select"
          >
            <option value="small">small</option>
            <option value="normal">normal</option>
            <option value="large">large</option>
          </select>
        </label>
        <label>
          Spacing:
          <select
            value={spacing}
            onChange={(e) => setSpacing(e.target.value as 'normal' | 'compact' | 'contiguous')}
            data-testid="stack-spacing-select"
          >
            <option value="compact">compact</option>
            <option value="normal">normal</option>
            <option value="contiguous">contiguous</option>
          </select>
        </label>
        <label>
          Direction:
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'row' | 'column')}
            data-testid="stack-direction-select"
          >
            <option value="row">row</option>
            <option value="column">column</option>
          </select>
        </label>
        <label>
          Align
          <select
            value={props.align}
            onChange={(e) => updateProp('align', e.target.value)}
            data-testid="stack-align-select"
          >
            <option value="start">start</option>
            <option value="center">center</option>
            <option value="end">end</option>
            <option value="spread">spread</option>
          </select>
        </label>
        <label>
          Wrap
          <input
            type="checkbox"
            checked={props.wrap}
            onChange={(e) => updateProp('wrap', e.target.checked)}
            data-testid="stack-wrap-input"
          />
        </label>
      </Section>
    </>
  );
}
