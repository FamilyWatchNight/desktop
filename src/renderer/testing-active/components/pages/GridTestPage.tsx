import { Card, Page, Section } from '../../../components/elements/containers';
import Grid from '../../../components/elements/containers/Grid';

export default function GridTestPage(): React.ReactElement {
  return (
    <>
      <Page title="Grid Test" testId="grid-test-page">
        <Section title="Preview">
          <Grid testId="grid-preview" columns={3} gap="0.5rem">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i}>Card {i}</Card>
            ))}
          </Grid>
        </Section>
      </Page>
      <Section title="Test Controls">
        <p>Grid controls not implemented yet</p>
      </Section>
    </>
  );
}
