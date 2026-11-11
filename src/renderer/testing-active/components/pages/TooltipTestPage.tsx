/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Button } from '../../../components/elements/buttons';
import { Group, Page, Section } from '../../../components/elements/containers';
import { Tooltip } from '../../../components/elements/feedback';
import { MenuItem } from '../../../components/elements/navigation';

export default function TooltipTestPage(): React.ReactElement {
  const [reason, setReason] = useState('This action is unavailable');
  const [enabled, setEnabled] = useState(true);

  return (
    <>
      <Page title="Tooltip / Disabled Reason Test" testId="page-tooltip-test">
        <Section title="Component Preview">
          <Group flow="row" spread="proportional" testId="tooltip-preview-group">
            <Tooltip content={reason} testId="tooltip-basic" placement="top">
              <Button testId="tooltip-basic-trigger">Hover or focus me</Button>
            </Tooltip>

            <Button
              disabled={!enabled}
              disabledReason={enabled ? undefined : reason}
              testId="disabled-reason-button"
            >
              Delete
            </Button>

            <MenuItem
              label="Restricted"
              disabled={!enabled}
              disabledReason={enabled ? undefined : reason}
              testId="disabled-reason-menu-item"
            />
          </Group>
        </Section>
        <Section title="Controls">
          <label>
            Reason text:
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              data-testid="tooltip-reason-input"
            />
          </label>
          <label>
            Enabled:
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              data-testid="tooltip-enabled-input"
            />
          </label>
        </Section>
      </Page>
    </>
  );
}
