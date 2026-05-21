/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { TEST_PAGE_IDS } from '../../../../src/renderer/testing-active/TestPageIds';

import { BasePage } from './BasePage';

export class FormControlsTestPage extends BasePage {
  static readonly pageId = `testing/${TEST_PAGE_IDS.PAGE_FORM_CONTROLS_TEST}`;

  readonly selectors = {
    pageRoot: '[data-testid="form-controls-component-under-test"]',
    controlledNameInput: '[data-testid="controlled-input-name"]',
    controlledEmailInput: '[data-testid="controlled-input-email"]',
    controlledAcceptedTermsInput: '[data-testid="controlled-input-accepted-terms"]',
    controlledSubmitButton: '[data-testid="controlled-submit-button"]',
    controlledNameDisplay: '[data-testid="controlled-name-display"]',
    controlledEmailDisplay: '[data-testid="controlled-email-display"]',
    controlledAcceptedTermsDisplay: '[data-testid="controlled-accepted-terms-display"]',
    controlledSubmitCount: '[data-testid="controlled-submit-count"]',
    controlledPersonalInformationFieldset:
      '[data-testid="controlled-fieldset-personal-information"]',
    controlledPersonalInformationLegend:
      '[data-testid="controlled-fieldset-personal-information"] legend',
    controlledPreferencesFieldset: '[data-testid="controlled-fieldset-preferences"]',
    controlledPreferencesLegend: '[data-testid="controlled-fieldset-preferences"] legend',
    uncontrolledNameInput: '[data-testid="uncontrolled-input-name"]',
    uncontrolledEmailInput: '[data-testid="uncontrolled-input-email"]',
    uncontrolledAcceptedTermsInput: '[data-testid="uncontrolled-input-accepted-terms"]',
    uncontrolledSubmitButton: '[data-testid="uncontrolled-submit-button"]',
    uncontrolledNameResult: '[data-testid="uncontrolled-name-result"]',
    uncontrolledEmailResult: '[data-testid="uncontrolled-email-result"]',
    uncontrolledAcceptedTermsResult: '[data-testid="uncontrolled-accepted-terms-result"]',
    uncontrolledSubmitCount: '[data-testid="uncontrolled-submit-count"]',
    uncontrolledPersonalInformationFieldset:
      '[data-testid="uncontrolled-fieldset-personal-information"]',
    uncontrolledPersonalInformationLegend:
      '[data-testid="uncontrolled-fieldset-personal-information"] legend',
    uncontrolledPreferencesFieldset: '[data-testid="uncontrolled-fieldset-preferences"]',
    uncontrolledPreferencesLegend: '[data-testid="uncontrolled-fieldset-preferences"] legend',
    generatedIdNameInput1: '[data-testid="generated-id-name-input-1"]',
    generatedIdNameInput2: '[data-testid="generated-id-name-input-2"]',
    customIdEmailInput: '[data-testid="custom-id-email-input"]',
    formlessGeneratedIdNameInput1: '[data-testid="formless-generated-id-name-input-1"]',
    formlessGeneratedIdNameInput2: '[data-testid="formless-generated-id-name-input-2"]',
    formlessCustomIdEmailInput: '[data-testid="formless-custom-id-email-input"]',
    hiddenLabelsDefaultInput: '[data-testid="hidden-label-default-input"]',
    hiddenLabelsCustomInput: '[data-testid="hidden-label-custom-input"]',
  } as Record<string, string>;

  async submitControlledForm(): Promise<void> {
    await this.click('controlledSubmitButton');
  }

  async submitUncontrolledForm(): Promise<void> {
    await this.click('uncontrolledSubmitButton');
  }

  async getControlledSubmitCount(): Promise<number | null> {
    return this.getNumber('controlledSubmitCount');
  }

  async getUncontrolledSubmitCount(): Promise<number | null> {
    return this.getNumber('uncontrolledSubmitCount');
  }

  async getInputLabelForAttribute(name: string): Promise<string | null> {
    const locator = await this.getLocator(name);
    return locator.evaluate((el) => el.parentElement?.getAttribute('for') ?? null);
  }

  async doesHiddenLabelInputHaveAVisibleLabelParent(name: string): Promise<boolean> {
    const locator = await this.getLocator(name);
    const parentTagName = await locator.evaluate((el) => el.parentElement?.tagName);
    return parentTagName == 'LABEL';
  }
}
