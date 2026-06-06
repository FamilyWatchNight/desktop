import React, { useState } from 'react';

import { Page, Section } from '../../../components/elements/containers';
import { Badge } from '../../../components/elements/feedback/Badge';

export default function BadgeTestPage(): React.ReactElement {
  const [value, setValue] = useState<string | null>('3');
  const [label, setLabel] = useState('Notifications');

  return (
    <Page title="Badge Test" testId="badge-test-page">
      <Section title="Preview">
        <Badge value={value} label={label} testId="badge-preview" />
      </Section>
      <Section title="Controls">
        <label>
          Value (empty string shows empty, blank to set null):
          <input
            data-testid="badge-value-input"
            value={value ?? ''}
            onChange={(e) => setValue(e.target.value === '' ? '' : e.target.value)}
          />
        </label>
        <label>
          Hide (set null):
          <input
            data-testid="badge-hide-input"
            type="checkbox"
            checked={value === null}
            onChange={(e) => setValue(e.target.checked ? null : '')}
          />
        </label>
        <label>
          Aria Label:
          <input
            data-testid="badge-label-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
      </Section>
    </Page>
  );
}
