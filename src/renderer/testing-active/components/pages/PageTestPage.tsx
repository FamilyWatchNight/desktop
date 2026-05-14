import React from 'react';

export default function PageTestPage(): React.ReactElement {
  return (
    <div className="page centered" data-testid="page-testing-page">
      <div className="page-container">
        <h1 className="page-title">Page Component Test</h1>
        <p data-testid="page-testing-description">
          This page is used to verify renderer component test page registration and menu integration.
        </p>
      </div>
    </div>
  );
}
