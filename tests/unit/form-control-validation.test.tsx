/** @jest-environment jsdom */

/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { describe, expect, test } from '@jest/globals';
import { renderToString } from 'react-dom/server';

import {
  Checkbox,
  CheckboxGroup,
  EmailInput,
  NumberInput,
  Radio,
  RadioGroup,
  SecureInput,
  Select,
  TextInput,
} from '../../src/renderer/components/elements/form';

describe('Form control runtime validation', () => {
  test('CheckboxGroup throws when name is missing', () => {
    expect(() =>
      renderToString(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <CheckboxGroup testId="missing-name-group" {...({} as any)}>
          <Checkbox id="checkbox-1" value="a" />
        </CheckboxGroup>,
      ),
    ).toThrow('CheckboxGroup must specify a name prop.');
  });

  test('RadioGroup throws when name is missing', () => {
    expect(() =>
      renderToString(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <RadioGroup testId="missing-name-group" {...({} as any)}>
          <Radio id="radio-1" value="a" />
        </RadioGroup>,
      ),
    ).toThrow('RadioGroup must specify a name prop.');
  });

  test('TextInput throws when name is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => renderToString(<TextInput label="Name" {...({} as any)} />)).toThrow(
      'Input of type "text" must specify a name prop.',
    );
  });

  test('EmailInput throws when name is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => renderToString(<EmailInput label="Email" {...({} as any)} />)).toThrow(
      'Input of type "email" must specify a name prop.',
    );
  });

  test('SecureInput throws when name is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => renderToString(<SecureInput label="Password" {...({} as any)} />)).toThrow(
      'Input of type "password" must specify a name prop.',
    );
  });

  test('NumberInput throws when name is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => renderToString(<NumberInput label="Age" {...({} as any)} />)).toThrow(
      'Input of type "number" must specify a name prop.',
    );
  });

  test('Select throws when name is missing', () => {
    expect(() =>
      renderToString(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Select label="Favorite" {...({} as any)}>
          <option value="1">One</option>
        </Select>,
      ),
    ).toThrow('Select must specify a name prop.');
  });

  test('Checkbox without group throws when name is missing', () => {
    expect(() => renderToString(<Checkbox id="checkbox-standalone" />)).toThrow(
      'Checkbox outside a checkbox group must specify a name.',
    );
  });

  test('Radio without group throws when name is missing', () => {
    expect(() => renderToString(<Radio id="radio-standalone" />)).toThrow(
      'Radio outside a radio group must specify a name.',
    );
  });

  test('Checkbox inside group throws when name is supplied', () => {
    expect(() =>
      renderToString(
        <CheckboxGroup name="notificationMethods" testId="notification-group">
          <Checkbox id="checkbox-1" value="email" name="bad-name" />
        </CheckboxGroup>,
      ),
    ).toThrow(
      'Checkbox inside a checkbox group should not specify a name. The group defines the field name.',
    );
  });

  test('Radio inside group throws when name is supplied', () => {
    expect(() =>
      renderToString(
        <RadioGroup name="plan" testId="plan-group">
          <Radio id="radio-1" value="basic" name="bad-name" />
        </RadioGroup>,
      ),
    ).toThrow(
      'Radio inside a radio group should not specify a name. The group defines the field name.',
    );
  });

  test('Checkbox inside group throws when value is missing', () => {
    expect(() =>
      renderToString(
        <CheckboxGroup name="notificationMethods" testId="notification-group">
          <Checkbox id="checkbox-1" />
        </CheckboxGroup>,
      ),
    ).toThrow('Checkbox inside a checkbox group must specify a value.');
  });

  test('Radio inside group throws when value is missing', () => {
    expect(() =>
      renderToString(
        <RadioGroup name="plan" testId="plan-group">
          <Radio id="radio-1" />
        </RadioGroup>,
      ),
    ).toThrow('Radio inside a radio group must specify a value.');
  });
});
