import React, { useState } from 'react';

import { Message } from '../../../components/elements/feedback/Message';
import { Page, Section } from '../../../components/elements/layout';

export default function MessageTestPage(): React.ReactElement {
  const [text, setText] = useState('Hello test message');
  const [type, setType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  return (
    <>
      <Page title="Message Test" testId="message-test-page">
        <Section title="Preview">
          <Message type={type} testId="message-preview">
            {text}
          </Message>
        </Section>
        <Section title="Controls">
          <label>
            Text:
            <input
              data-testid="message-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label>
            Type:
            <select
              data-testid="message-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
            </select>
          </label>
        </Section>
      </Page>
    </>
  );
}
