/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import React from 'react';

import {
  PageRegistryProvider,
  usePageRegistry,
} from '../../src/renderer/contexts/PageRegistryContext';

function TestConsumer(): React.ReactElement {
  const registry = usePageRegistry();
  registry.registerPage('test/page', () => <div>Test page</div>, 'Test Page');
  const registeredPage = registry.getPage('test/page');
  return <div data-testid="registry-status">{registeredPage ? 'registered' : 'missing'}</div>;
}

test('usePageRegistry returns the shared page registry instance', () => {
  render(
    <PageRegistryProvider>
      <TestConsumer />
    </PageRegistryProvider>,
  );

  expect(screen.getByTestId('registry-status')).toHaveTextContent('registered');
});
