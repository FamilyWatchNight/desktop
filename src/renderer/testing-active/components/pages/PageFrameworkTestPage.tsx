import React, { useState } from 'react';

import { Page, Section } from '../../../components/elements/layout';

export default function PageFrameworkTestPage(): React.ReactElement {
  const [props, setProps] = useState({
    pageTitle: 'Test Page',
    pageCentered: true,
    pageClassName: '',
    sectionTitle: 'Test Section',
    sectionClassName: '',
  });

  const updateProp = (key: string, value: unknown): void => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Page
        title={props.pageTitle}
        centered={props.pageCentered}
        className={props.pageClassName}
        testId="page-component-under-test"
      >
        <Section
          title={props.sectionTitle}
          className={props.sectionClassName}
          testId="section-component-under-test"
        >
          <p>Test section content goes here.</p>
        </Section>
        <Section
          title="Second Section"
          className={props.sectionClassName}
          testId="second-section-component"
        >
          <p>Second section content goes here.</p>
        </Section>
      </Page>
      <Section title="Test Controls">
        <label>
          Page Title:
          <input
            type="text"
            value={props.pageTitle}
            onChange={(e) => updateProp('pageTitle', e.target.value)}
            data-testid="page-test-page-title-input"
          />
        </label>

        <label>
          Page Centered:
          <input
            type="checkbox"
            checked={props.pageCentered}
            onChange={(e) => updateProp('pageCentered', e.target.checked)}
            data-testid="page-test-page-centered-input"
          />
        </label>

        <label>
          Page Class Name:
          <input
            type="text"
            value={props.pageClassName}
            onChange={(e) => updateProp('pageClassName', e.target.value)}
            data-testid="page-test-page-className-input"
          />
        </label>

        <label>
          Section Title:
          <input
            type="text"
            value={props.sectionTitle}
            onChange={(e) => updateProp('sectionTitle', e.target.value)}
            data-testid="section-test-title-input"
          />
        </label>
        <label>
          Section Class Name:
          <input
            type="text"
            value={props.sectionClassName}
            onChange={(e) => updateProp('sectionClassName', e.target.value)}
            data-testid="section-test-className-input"
          />
        </label>
      </Section>
    </>
  );
}
