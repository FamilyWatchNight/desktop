/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { render, screen } from '@testing-library/react';

import { Form, TextInput } from '../../src/renderer/components/elements/form';

function getLabelElementForId(id: string): HTMLLabelElement | null {
  return document.querySelector(`label[for="${id}"]`);
}

describe('Form Controls — generated ids', () => {
  test('Form generates ids with autoIdPrefix and preserves custom ids; labels reference ids', () => {
    render(
      <Form autoIdPrefix="form-test">
        <TextInput
          name="generatedName1"
          label="Generated Name 1"
          placeholder="No id provided"
          testId="generated-id-name-input-1"
        />
        <TextInput
          id="custom-id-email"
          name="customEmail"
          label="Custom Email (but plain text input)"
          placeholder="Explicit id provided"
          testId="custom-id-email-input"
        />
        <TextInput
          name="generatedName2"
          label="Generated Name 2"
          placeholder="No id provided"
          testId="generated-id-name-input-2"
        />
      </Form>,
    );

    const gen1 = screen.getByTestId('generated-id-name-input-1') as HTMLInputElement;
    const custom = screen.getByTestId('custom-id-email-input') as HTMLInputElement;
    const gen2 = screen.getByTestId('generated-id-name-input-2') as HTMLInputElement;

    expect(gen1.id).toBe('form-test-1');
    expect(gen2.id).toMatch('form-test-2');
    expect(custom.id).toBe('custom-id-email');

    // labels (which should be the inputs' parents) should reference the input ids
    expect(getLabelElementForId(gen1.id)).toBe(gen1.parentElement);
    expect(getLabelElementForId(custom.id)).toBe(custom.parentElement);
    expect(getLabelElementForId(gen2.id)).toBe(gen2.parentElement);
  });

  test('Formless TextInput components receive generated text- ids and labels reference them', () => {
    render(
      <>
        <TextInput
          name="formlessGeneratedName1"
          label="Formless Generated Name 1"
          placeholder="No id provided"
          testId="formless-generated-id-name-input-1"
        />
        <TextInput
          id="formless-custom-id-email"
          name="formlessCustomEmail"
          label="Formless Custom Email (but plain text input)"
          placeholder="Explicit id provided"
          testId="formless-custom-id-email-input"
        />
        <TextInput
          name="formlessGeneratedName2"
          label="Formless Generated Name 2"
          placeholder="No id provided"
          testId="formless-generated-id-name-input-2"
        />
      </>,
    );

    const f1 = screen.getByTestId('formless-generated-id-name-input-1') as HTMLInputElement;
    const fc = screen.getByTestId('formless-custom-id-email-input') as HTMLInputElement;
    const f2 = screen.getByTestId('formless-generated-id-name-input-2') as HTMLInputElement;

    expect(f1.id).toBe('text-1');
    expect(f2.id).toMatch('text-2');
    expect(fc.id).toBe('formless-custom-id-email');

    // labels (which should be the inputs' parents) should reference the input ids
    expect(getLabelElementForId(f1.id)).toBe(f1.parentElement);
    expect(getLabelElementForId(fc.id)).toBe(fc.parentElement);
    expect(getLabelElementForId(f2.id)).toBe(f2.parentElement);
  });
});
