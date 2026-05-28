/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import {
  Checkbox,
  CheckboxGroup,
  Form,
  Select,
  TextInput,
} from '../../src/renderer/components/elements/form';

describe('Form reset behavior', () => {
  test('restores uncontrolled default values when initialValues is empty', () => {
    const formRef = React.createRef<any>();

    render(
      <Form formContextRef={formRef} initialValues={{}} isReady>
        <TextInput name="name" label="Name" defaultValue="Default" testId="name-input" />
        <Checkbox
          name="acceptedTerms"
          label="Accept terms"
          defaultChecked
          testId="terms-checkbox"
        />
        <Select name="favoriteGenre" label="Genre" defaultValue="comedy" testId="genre-select">
          <option value="comedy">Comedy</option>
          <option value="action">Action</option>
          <option value="drama">Drama</option>
        </Select>
        <CheckboxGroup name="newsletter" testId="newsletter-group" legend="Newsletter">
          <Checkbox value="yes" defaultChecked testId="newsletter-checkbox" />
        </CheckboxGroup>
      </Form>,
    );

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    const termsCheckbox = screen.getByTestId('terms-checkbox') as HTMLInputElement;
    const genreSelect = screen.getByTestId('genre-select') as HTMLSelectElement;
    const newsletterCheckbox = screen.getByTestId('newsletter-checkbox') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Changed' } });
    fireEvent.click(termsCheckbox);
    fireEvent.change(genreSelect, { target: { value: 'action' } });
    fireEvent.click(newsletterCheckbox);

    expect(nameInput.value).toBe('Changed');
    expect(termsCheckbox.checked).toBe(false);
    expect(genreSelect.value).toBe('action');
    expect(newsletterCheckbox.checked).toBe(false);

    formRef.current?.reset();

    expect(nameInput.value).toBe('Default');
    expect(termsCheckbox.checked).toBe(true);
    expect(genreSelect.value).toBe('comedy');
    expect(newsletterCheckbox.checked).toBe(true);
  });

  test('restores uncontrolled initialValues after mutation', () => {
    const formRef = React.createRef<any>();

    render(
      <Form
        formContextRef={formRef}
        initialValues={{
          name: 'Charlie',
          acceptedTerms: true,
          favoriteGenre: 'action',
          newsletter: ['yes'],
        }}
        isReady
      >
        <TextInput name="name" label="Name" defaultValue="Default" testId="name-input" />
        <Checkbox
          name="acceptedTerms"
          label="Accept terms"
          defaultChecked={false}
          testId="terms-checkbox"
        />
        <Select name="favoriteGenre" label="Genre" defaultValue="comedy" testId="genre-select">
          <option value="comedy">Comedy</option>
          <option value="action">Action</option>
          <option value="drama">Drama</option>
        </Select>
        <CheckboxGroup name="newsletter" testId="newsletter-group" legend="Newsletter">
          <Checkbox value="yes" defaultChecked={false} testId="newsletter-checkbox" />
        </CheckboxGroup>
      </Form>,
    );

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    const termsCheckbox = screen.getByTestId('terms-checkbox') as HTMLInputElement;
    const genreSelect = screen.getByTestId('genre-select') as HTMLSelectElement;
    const newsletterCheckbox = screen.getByTestId('newsletter-checkbox') as HTMLInputElement;

    expect(nameInput.value).toBe('Charlie');
    expect(termsCheckbox.checked).toBe(true);
    expect(genreSelect.value).toBe('action');
    expect(newsletterCheckbox.checked).toBe(true);

    fireEvent.change(nameInput, { target: { value: 'Changed' } });
    fireEvent.click(termsCheckbox);
    fireEvent.change(genreSelect, { target: { value: 'comedy' } });
    fireEvent.click(newsletterCheckbox);

    expect(nameInput.value).toBe('Changed');
    expect(termsCheckbox.checked).toBe(false);
    expect(genreSelect.value).toBe('comedy');
    expect(newsletterCheckbox.checked).toBe(false);

    formRef.current?.reset();

    expect(nameInput.value).toBe('Charlie');
    expect(termsCheckbox.checked).toBe(true);
    expect(genreSelect.value).toBe('action');
    expect(newsletterCheckbox.checked).toBe(true);
  });
});
