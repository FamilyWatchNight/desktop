import React from 'react';

import { List } from '../../../components/elements/containers/List';
import { ListItem } from '../../../components/elements/containers/ListItem';
import { Badge } from '../../../components/elements/feedback/Badge';
import { Page, Section } from '../../../components/elements/layout';

export default function ListTestPage(): React.ReactElement {
  return (
    <Page title="List Test" testId="list-test-page">
      <Section title="Preview">
        <List testId="list-preview">
          <ListItem testId="listitem-1">First item</ListItem>
          <ListItem testId="listitem-2" actions={<Badge value="New" testId="listitem-badge" />}>
            Second item
          </ListItem>
        </List>
      </Section>
    </Page>
  );
}
