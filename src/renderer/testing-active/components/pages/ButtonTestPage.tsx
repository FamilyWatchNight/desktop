/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Button } from '../../../components/elements/buttons';
import { Group, Page, Section } from '../../../components/elements/containers';
import { ContentSize } from '../../../components/properties';

export default function ButtonTestPage(): React.ReactElement {
  const [variant, setVariant] = useState<
    'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'link'
  >('primary');
  const [size, setSize] = useState<ContentSize>('normal');
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <Page title="Button Test" testId="page-button-test">
        <Section title="Component Preview">
          <Group flow="row" spread="equal" size={size} testId="button-group-preview">
            <Button variant={variant} disabled={disabled} data-testid="button-1">
              Primary
            </Button>
            <Button variant="secondary" disabled={disabled} data-testid="button-2">
              Secondary
            </Button>
          </Group>
        </Section>
        <Section title="Controls">
          <label>
            Variant:
            <select
              value={variant}
              onChange={(e) =>
                setVariant(
                  e.target.value as
                    | 'primary'
                    | 'secondary'
                    | 'danger'
                    | 'success'
                    | 'info'
                    | 'link',
                )
              }
              data-testid="button-variant-select"
            >
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
              <option value="danger">danger</option>
              <option value="success">success</option>
              <option value="info">info</option>
              <option value="link">link</option>
            </select>
          </label>
          <label>
            Size:
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as ContentSize)}
              data-testid="button-size-select"
            >
              <option value="small">small</option>
              <option value="medium">normal</option>
              <option value="large">large</option>
            </select>
          </label>
          <label>
            Disabled:
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              data-testid="button-disabled-input"
            />
          </label>
        </Section>
      </Page>
    </>
  );
}
