/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Page, Section } from '../../../components/elements/layout';
import { MenuItem } from '../../../components/elements/navigation';

export default function MenuItemTestPage(): React.ReactElement {
  const [label, setLabel] = useState('Menu Item');
  const [badge, setBadge] = useState<number | undefined>(3);
  const [active, setActive] = useState(false);

  return (
    <>
      <Page title="MenuItem Test" testId="page-menuitem-test">
        <Section title="Component Preview">
          <MenuItem label={label} badge={badge} isActive={active} testId="menu-item-preview" />
        </Section>
        <Section title="Controls">
          <label>
            Label:
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              data-testid="menuitem-label-input"
            />
          </label>
          <label>
            Badge:
            <input
              type="number"
              value={badge ?? 0}
              onChange={(e) => setBadge(Number(e.target.value) || undefined)}
              data-testid="menuitem-badge-input"
            />
          </label>
          <label>
            Active:
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              data-testid="menuitem-active-input"
            />
          </label>
        </Section>
      </Page>
    </>
  );
}
