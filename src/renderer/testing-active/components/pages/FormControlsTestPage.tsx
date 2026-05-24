/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useRef, useState } from 'react';

import {
  Checkbox,
  CheckboxGroup,
  EmailInput,
  Fieldset,
  Form,
  Radio,
  RadioGroup,
  Select,
  TextInput,
} from '../../../components/elements/form';
import { Page, Section } from '../../../components/elements/layout';

export default function FormControlsTestPage(): React.ReactElement {
  const [controlledState, setControlledState] = useState({
    name: '',
    email: '',
    acceptedTerms: false,
  });
  const [controlledNewsletter, setControlledNewsletter] = useState(false);
  const [controlledPlan, setControlledPlan] = useState<'basic' | 'premium'>('basic');
  const [controlledGenre, setControlledGenre] = useState('comedy');
  const [controlledSubmitCount, setControlledSubmitCount] = useState(0);
  const [uncontrolledSubmitCount, setUncontrolledSubmitCount] = useState(0);
  const [uncontrolledResult, setUncontrolledResult] = useState({
    name: '',
    email: '',
    acceptedTerms: false,
    newsletter: false,
    plan: 'basic',
    favoriteGenre: 'comedy',
  });

  const uncontrolledNameRef = useRef<HTMLInputElement>(null);
  const uncontrolledEmailRef = useRef<HTMLInputElement>(null);
  const uncontrolledAcceptedTermsRef = useRef<HTMLInputElement>(null);
  const uncontrolledNewsletterRef = useRef<HTMLInputElement>(null);
  const uncontrolledPlanBasicRef = useRef<HTMLInputElement>(null);
  const uncontrolledPlanPremiumRef = useRef<HTMLInputElement>(null);
  const uncontrolledGenreRef = useRef<HTMLSelectElement>(null);

  const updateControlledValue = (
    key: 'name' | 'email' | 'acceptedTerms',
    value: string | boolean,
  ): void => {
    setControlledState((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateControlledNewsletter = (checked: boolean): void => {
    setControlledNewsletter(checked);
  };

  const updateControlledPlan = (value: 'basic' | 'premium'): void => {
    setControlledPlan(value);
  };

  const updateControlledGenre = (value: string): void => {
    setControlledGenre(value);
  };

  const handleControlledSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setControlledSubmitCount((previous) => previous + 1);
  };

  const handleUncontrolledSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    setUncontrolledResult({
      name: uncontrolledNameRef.current?.value ?? '',
      email: uncontrolledEmailRef.current?.value ?? '',
      acceptedTerms: uncontrolledAcceptedTermsRef.current?.checked ?? false,
      newsletter: uncontrolledNewsletterRef.current?.checked ?? false,
      plan: uncontrolledPlanBasicRef.current?.checked
        ? 'basic'
        : uncontrolledPlanPremiumRef.current?.checked
          ? 'premium'
          : 'basic',
      favoriteGenre: uncontrolledGenreRef.current?.value ?? 'comedy',
    });
    setUncontrolledSubmitCount((previous) => previous + 1);
  };

  return (
    <>
      <Page title="Form Controls Test Page" testId="form-controls-component-under-test" centered>
        <Section title="Controlled Form" testId="controlled-form-section">
          <Form onSubmit={handleControlledSubmit} testId="controlled-form">
            <Fieldset
              legend="Controlled Personal Information"
              testId="controlled-fieldset-personal-information"
            >
              <TextInput
                id="controlled-input-name"
                name="name"
                label="Name"
                placeholder="Enter your name"
                value={controlledState.name}
                onChange={(event) => updateControlledValue('name', event.target.value)}
                testId="controlled-input-name"
              />
              <EmailInput
                id="controlled-input-email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={controlledState.email}
                onChange={(event) => updateControlledValue('email', event.target.value)}
                testId="controlled-input-email"
              />
            </Fieldset>
            <Fieldset legend="Controlled Preferences" testId="controlled-fieldset-preferences">
              <Checkbox
                id="controlled-input-accepted-terms"
                name="acceptedTerms"
                label="Accept terms"
                checked={controlledState.acceptedTerms}
                onChange={(event) => updateControlledValue('acceptedTerms', event.target.checked)}
                testId="controlled-input-accepted-terms"
              />
              <CheckboxGroup legend="Controlled Options" testId="controlled-checkbox-group">
                <Checkbox
                  id="controlled-input-newsletter"
                  name="newsletter"
                  label="Subscribe to newsletter"
                  checked={controlledNewsletter}
                  onChange={(event) => updateControlledNewsletter(event.target.checked)}
                  testId="controlled-input-newsletter"
                />
              </CheckboxGroup>
              <RadioGroup legend="Account type" testId="controlled-radio-group">
                <Radio
                  id="controlled-input-plan-basic"
                  name="plan"
                  label="Basic"
                  value="basic"
                  checked={controlledPlan === 'basic'}
                  onChange={() => updateControlledPlan('basic')}
                  testId="controlled-radio-plan-basic"
                />
                <Radio
                  id="controlled-input-plan-premium"
                  name="plan"
                  label="Premium"
                  value="premium"
                  checked={controlledPlan === 'premium'}
                  onChange={() => updateControlledPlan('premium')}
                  testId="controlled-radio-plan-premium"
                />
              </RadioGroup>
              <Select
                id="controlled-select-genre"
                name="favoriteGenre"
                label="Favorite genre"
                value={controlledGenre}
                onChange={(event) => updateControlledGenre(event.target.value)}
                testId="controlled-select-genre"
              >
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="action">Action</option>
              </Select>
            </Fieldset>
            <button type="submit" data-testid="controlled-submit-button">
              Submit Controlled Form
            </button>
          </Form>
        </Section>
        <Section title="Uncontrolled Form">
          <Form onSubmit={handleUncontrolledSubmit} testId="uncontrolled-form">
            <Fieldset
              legend="Uncontrolled Personal Information"
              testId="uncontrolled-fieldset-personal-information"
            >
              <TextInput
                id="uncontrolled-input-name"
                name="name"
                label="Name"
                placeholder="Enter your name"
                defaultValue=""
                ref={uncontrolledNameRef}
                testId="uncontrolled-input-name"
              />
              <EmailInput
                id="uncontrolled-input-email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                defaultValue=""
                ref={uncontrolledEmailRef}
                testId="uncontrolled-input-email"
              />
            </Fieldset>
            <Fieldset legend="Uncontrolled Preferences" testId="uncontrolled-fieldset-preferences">
              <Checkbox
                id="uncontrolled-input-accepted-terms"
                name="acceptedTerms"
                label="Accept terms"
                defaultChecked={false}
                ref={uncontrolledAcceptedTermsRef}
                testId="uncontrolled-input-accepted-terms"
              />
              <CheckboxGroup legend="Uncontrolled options" testId="uncontrolled-checkbox-group">
                <Checkbox
                  id="uncontrolled-input-newsletter"
                  name="newsletter"
                  label="Subscribe to newsletter"
                  defaultChecked={false}
                  ref={uncontrolledNewsletterRef}
                  testId="uncontrolled-input-newsletter"
                />
              </CheckboxGroup>
              <RadioGroup legend="Account type" testId="uncontrolled-radio-group">
                <Radio
                  id="uncontrolled-input-plan-basic"
                  name="plan"
                  label="Basic"
                  value="basic"
                  defaultChecked
                  ref={uncontrolledPlanBasicRef}
                  testId="uncontrolled-radio-plan-basic"
                />
                <Radio
                  id="uncontrolled-input-plan-premium"
                  name="plan"
                  label="Premium"
                  value="premium"
                  ref={uncontrolledPlanPremiumRef}
                  testId="uncontrolled-radio-plan-premium"
                />
              </RadioGroup>
              <Select
                id="uncontrolled-select-genre"
                name="favoriteGenre"
                label="Favorite genre"
                defaultValue="comedy"
                ref={uncontrolledGenreRef}
                testId="uncontrolled-select-genre"
              >
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="action">Action</option>
              </Select>
            </Fieldset>
            <button type="submit" data-testid="uncontrolled-submit-button">
              Submit Uncontrolled Form
            </button>
          </Form>
        </Section>
        <Section title="Generated IDs" testId="generated-ids-section">
          <Form testId="generated-ids-form" autoIdPrefix="form-test">
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
          </Form>
        </Section>
        <Section title="Generated IDs with no Form" testId="formless-generated-ids-section">
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
        </Section>

        <Section title="Hidden Labels (labelVisible=false)" testId="hidden-labels-section">
          <Form testId="hidden-labels-form">
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
          </Form>
        </Section>
      </Page>
      <Section title="Test Controls">
        <h3>Controlled Form</h3>
        <div data-testid="controlled-state-display">
          <div data-testid="controlled-name-display">Name: {controlledState.name}</div>
          <div data-testid="controlled-email-display">Email: {controlledState.email}</div>
          <div data-testid="controlled-accepted-terms-display">
            Accepted: {controlledState.acceptedTerms ? 'true' : 'false'}
          </div>
          <div data-testid="controlled-newsletter-display">
            Newsletter: {controlledNewsletter ? 'true' : 'false'}
          </div>
          <div data-testid="controlled-account-type-display">Account type: {controlledPlan}</div>
          <div data-testid="controlled-genre-display">Favorite genre: {controlledGenre}</div>
          <div data-testid="controlled-submit-count">Submit count: {controlledSubmitCount}</div>
        </div>
        <h3>Uncontrolled Form</h3>
        <div data-testid="uncontrolled-state-display">
          <div data-testid="uncontrolled-name-display">Name: {uncontrolledResult.name}</div>
          <div data-testid="uncontrolled-email-display">Email: {uncontrolledResult.email}</div>
          <div data-testid="uncontrolled-accepted-terms-display">
            Accepted: {uncontrolledResult.acceptedTerms ? 'true' : 'false'}
          </div>
          <div data-testid="uncontrolled-newsletter-display">
            Newsletter: {uncontrolledResult.newsletter ? 'true' : 'false'}
          </div>
          <div data-testid="uncontrolled-account-type-display">
            Account type: {uncontrolledResult.plan}
          </div>
          <div data-testid="uncontrolled-genre-display">
            Favorite genre: {uncontrolledResult.favoriteGenre}
          </div>
          <div data-testid="uncontrolled-submit-count">Submit count: {uncontrolledSubmitCount}</div>
        </div>
      </Section>
    </>
  );
}
