import React, { useState } from 'react';

import { Card } from '../../../components/elements/containers/Card';
import { Page, Section } from '../../../components/elements/layout';

export default function CardTestPage(): React.ReactElement {
  const [props, setProps] = useState({
    cardVariant: 'flat',
    cardSize: 'medium',
    hasHeader: true,
    headerContent: 'Header',
    hasFooter: true,
    footerContent: 'Footer',
  });

  const updateProp = (key: string, value: unknown): void => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Page title="Card Test" testId="card-test-page">
        <Section title="Preview">
          <Card
            title={props.hasHeader ? <div>{props.headerContent}</div> : undefined}
            footer={props.hasFooter ? <div>{props.footerContent}</div> : undefined}
            testId="card-preview"
            variant={props.cardVariant as 'flat' | 'glassy'}
            size={props.cardSize as 'small' | 'medium' | 'large'}
          >
            <p>Card body content goes here.</p>
          </Card>
        </Section>
      </Page>
      <Section title="Test Controls">
        <label>
          Size:
          <select
            value={props.cardSize}
            onChange={(e) => updateProp('cardSize', e.target.value)}
            data-testid="button-size-select"
          >
            <option value="small">small</option>
            <option value="medium">medium</option>
            <option value="large">large</option>
          </select>
        </label>
        <label>
          Variant:
          <select
            value={props.cardVariant}
            onChange={(e) => updateProp('cardVariant', e.target.value)}
            data-testid="button-variant-select"
          >
            <option value="flat">flat</option>
            <option value="glassy">glassy</option>
            <option value="transparent">transparent</option>
          </select>
        </label>
        <label>
          Has Header:
          <input
            type="checkbox"
            checked={props.hasHeader}
            onChange={(e) => updateProp('hasHeader', e.target.checked)}
            data-testid="card-test-has-header-input"
          />
        </label>
        <label>
          Header Content:
          <input
            type="text"
            value={props.headerContent}
            onChange={(e) => updateProp('headerContent', e.target.value)}
            data-testid="card-test-header-content-input"
          />
        </label>
        <label>
          Has Footer:
          <input
            type="checkbox"
            checked={props.hasFooter}
            onChange={(e) => updateProp('hasFooter', e.target.checked)}
            data-testid="card-test-has-footer-input"
          />
        </label>
        <label>
          Footer Content:
          <input
            type="text"
            value={props.footerContent}
            onChange={(e) => updateProp('footerContent', e.target.value)}
            data-testid="card-test-footer-content-input"
          />
        </label>
      </Section>
    </>
  );
}
