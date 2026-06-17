import React, { useState } from 'react';

import { Page, Section } from '../../../components/elements/containers';
import { ProgressBar } from '../../../components/elements/feedback/ProgressBar';
import { ContentSize } from '../../../components/properties';

export default function ProgressBarTestPage(): React.ReactElement {
  const [current, setCurrent] = useState(25);
  const [max, setMax] = useState(100);
  const [indeterminate, setIndeterminate] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [size, setSize] = useState<ContentSize>('normal');

  return (
    <Page title="ProgressBar Test" testId="progressbar-test-page">
      <Section title="Preview">
        <ProgressBar
          current={current}
          max={max}
          isIndeterminate={indeterminate}
          showLabel={showLabel}
          size={size}
          testId="progressbar-preview"
        />
      </Section>
      <Section title="Controls">
        <label>
          Current:
          <input
            data-testid="progressbar-current-input"
            type="number"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value))}
          />
        </label>
        <label>
          Max:
          <input
            data-testid="progressbar-max-input"
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
          />
        </label>
        <label>
          Indeterminate:
          <input
            data-testid="progressbar-indeterminate-input"
            type="checkbox"
            checked={indeterminate}
            onChange={(e) => setIndeterminate(e.target.checked)}
          />
        </label>
        <label>
          Show Label:
          <input
            data-testid="progressbar-showlabel-input"
            type="checkbox"
            checked={showLabel}
            onChange={(e) => setShowLabel(e.target.checked)}
          />
        </label>
        <label>
          Size:
          <select
            data-testid="progressbar-size-select"
            value={size}
            onChange={(e) => setSize(e.target.value as ContentSize)}
          >
            <option value="small">small</option>
            <option value="normal">normal</option>
            <option value="large">large</option>
          </select>
        </label>
      </Section>
    </Page>
  );
}
