/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Page, Section } from '../../../components/elements/layout';
import { ExpandableMenuSection } from '../../../components/elements/navigation';

export default function ExpandableMenuSectionTestPage(): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Page title="Expandable Section Test" testId="page-expandable-section-test">
        <Section title="Component Preview">
          <ExpandableMenuSection
            label="More options"
            isExpanded={expanded}
            onExpandedChange={setExpanded}
            testId="expandable-preview"
          >
            <div>Item A</div>
            <div>Item B</div>
          </ExpandableMenuSection>
        </Section>
        <Section title="Controls">
          <label>
            Expanded:
            <input
              type="checkbox"
              checked={expanded}
              onChange={(e) => setExpanded(e.target.checked)}
              data-testid="expandable-expanded-input"
            />
          </label>
        </Section>
      </Page>
    </>
  );
}
