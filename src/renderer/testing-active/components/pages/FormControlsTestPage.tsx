/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useRef, useState } from 'react';

import { Fieldset, Form, Input } from '../../../components/elements/form';
import { Page, Section } from '../../../components/elements/layout';

export default function FormControlsTestPage(): React.ReactElement {
  const [controlledState, setControlledState] = useState({
    name: '',
    email: '',
    acceptedTerms: false,
  });
  const [controlledSubmitCount, setControlledSubmitCount] = useState(0);
  const [uncontrolledSubmitCount, setUncontrolledSubmitCount] = useState(0);
  const [uncontrolledResult, setUncontrolledResult] = useState({
    name: '',
    email: '',
    acceptedTerms: false,
  });

  const uncontrolledNameRef = useRef<HTMLInputElement>(null);
  const uncontrolledEmailRef = useRef<HTMLInputElement>(null);
  const uncontrolledAcceptedTermsRef = useRef<HTMLInputElement>(null);

  const updateControlledValue = (
    key: 'name' | 'email' | 'acceptedTerms',
    value: string | boolean,
  ): void => {
    setControlledState((previous) => ({
      ...previous,
      [key]: value,
    }));
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
              <Input
                id="controlled-input-name"
                name="name"
                label="Name"
                placeholder="Enter your name"
                value={controlledState.name}
                onChange={(event) => updateControlledValue('name', event.target.value)}
                testId="controlled-input-name"
              />
              <Input
                id="controlled-input-email"
                name="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={controlledState.email}
                onChange={(event) => updateControlledValue('email', event.target.value)}
                testId="controlled-input-email"
              />
            </Fieldset>
            <Fieldset legend="Controlled Preferences" testId="controlled-fieldset-preferences">
              <Input
                id="controlled-input-accepted-terms"
                name="acceptedTerms"
                type="checkbox"
                label="Accept terms"
                checked={controlledState.acceptedTerms}
                onChange={(event) => updateControlledValue('acceptedTerms', event.target.checked)}
                testId="controlled-input-accepted-terms"
              />
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
              <Input
                id="uncontrolled-input-name"
                name="name"
                label="Name"
                placeholder="Enter your name"
                defaultValue=""
                ref={uncontrolledNameRef}
                testId="uncontrolled-input-name"
              />
              <Input
                id="uncontrolled-input-email"
                name="email"
                type="email"
                label="Email"
                placeholder="Enter your email"
                defaultValue=""
                ref={uncontrolledEmailRef}
                testId="uncontrolled-input-email"
              />
            </Fieldset>
            <Fieldset legend="Uncontrolled Preferences" testId="uncontrolled-fieldset-preferences">
              <Input
                id="uncontrolled-input-accepted-terms"
                name="acceptedTerms"
                type="checkbox"
                label="Accept terms"
                defaultChecked={false}
                ref={uncontrolledAcceptedTermsRef}
                testId="uncontrolled-input-accepted-terms"
              />
            </Fieldset>
            <button type="submit" data-testid="uncontrolled-submit-button">
              Submit Uncontrolled Form
            </button>
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
          <div data-testid="controlled-submit-count">Submit count: {controlledSubmitCount}</div>
        </div>
        <h3>Uncontrolled Form</h3>
        <div data-testid="uncontrolled-state-display">
          <div data-testid="uncontrolled-name-result">Name: {uncontrolledResult.name}</div>
          <div data-testid="uncontrolled-email-result">Email: {uncontrolledResult.email}</div>
          <div data-testid="uncontrolled-accepted-terms-result">
            Accepted: {uncontrolledResult.acceptedTerms ? 'true' : 'false'}
          </div>
          <div data-testid="uncontrolled-submit-count">Submit count: {uncontrolledSubmitCount}</div>
        </div>
      </Section>
    </>
  );
}
