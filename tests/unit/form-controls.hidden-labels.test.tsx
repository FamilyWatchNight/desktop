/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { render, screen } from '@testing-library/react';

import { Form, TextInput } from '../../src/renderer/components/elements/form';

describe('Form Controls — hidden labels', () => {
  test('TextInput with labelVisible=false renders aria-label and no visible label element', () => {
    render(
      <Form>
        <TextInput
          id="hidden-label-default"
          name="default"
          label="Default"
          labelVisible={false}
          placeholder="Default aria-label from label attribute"
          testId="hidden-label-default-input"
        />
        <TextInput
          id="hidden-label-custom"
          name="custom"
          label="Custom"
          labelVisible={false}
          aria-label="ARIA Custom"
          placeholder="ARIA Custom from aria-label attribute"
          testId="hidden-label-custom-input"
        />
      </Form>,
    );

    const defaultInput = screen.getByTestId('hidden-label-default-input');
    const customInput = screen.getByTestId('hidden-label-custom-input');

    // aria-labels present
    expect(defaultInput).toHaveAttribute('aria-label', 'Default');
    expect(customInput).toHaveAttribute('aria-label', 'ARIA Custom');

    // inputs are present and visible
    expect(defaultInput).toBeVisible();
    expect(customInput).toBeVisible();

    // there should be no visible label text nodes for these labels
    expect(screen.queryByText('Default')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom')).not.toBeInTheDocument();
  });
});
