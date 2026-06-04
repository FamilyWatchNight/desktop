import React, { useState } from 'react';

import { Card } from '../../../components/elements/containers';
import { Page, Section } from '../../../components/elements/layout';
import Grid from '../../../components/elements/layout/Grid';

export default function GridTestPage(): React.ReactElement {
  const [props] = useState({
    columns: 3,
    rows: 3,
  });

  return (
    <>
      <Page title="Grid Test" testId="grid-test-page">
        <Section title="Preview">
          <Grid testId="grid-preview" columns={props.columns} rows={props.rows} gap="0.5rem">
            {Array.from({ length: props.rows }, (_, i) =>
              Array.from({ length: props.columns }, (_, j) => (
                <Card key={i + ', ' + j}>Card {'(' + (i + 1) + ',' + (j + 1) + ')'}</Card>
              )),
            )}
          </Grid>
        </Section>
      </Page>
      <Section title="Test Controls">
        <p>Grid controls not implemented yet</p>
      </Section>
    </>
  );
}
