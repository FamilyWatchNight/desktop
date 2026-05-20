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
    controlledPersonalInformationFieldset: '[data-testid="controlled-fieldset-personal-information"]',
    controlledPersonalInformationLegend: '[data-testid="controlled-fieldset-personal-information"] legend',
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
    uncontrolledPersonalInformationFieldset: '[data-testid="uncontrolled-fieldset-personal-information"]',
    uncontrolledPersonalInformationLegend: '[data-testid="uncontrolled-fieldset-personal-information"] legend',
    uncontrolledPreferencesFieldset: '[data-testid="uncontrolled-fieldset-preferences"]',
    uncontrolledPreferencesLegend: '[data-testid="uncontrolled-fieldset-preferences"] legend',
  };

  async waitForVisible(name: string, timeout = 4000): Promise<void> {
    await super.waitForVisible(name, timeout);
  }

  async setControlledInputValue(fieldName: string, value: string): Promise<void> {
    const page = await this.getPage();
    const normalizedField = fieldName.toLowerCase();
    const selector =
      normalizedField === 'name'
        ? this.selectors.controlledNameInput
        : normalizedField === 'email'
        ? this.selectors.controlledEmailInput
        : undefined;
    if (!selector) {
      throw new Error(`Unsupported controlled input field name: ${fieldName}`);
    }

    await page.fill(selector, value);
  }

  async setUncontrolledInputValue(fieldName: string, value: string): Promise<void> {
    const page = await this.getPage();
    const normalizedField = fieldName.toLowerCase();
    const selector =
      normalizedField === 'name'
        ? this.selectors.uncontrolledNameInput
        : normalizedField === 'email'
        ? this.selectors.uncontrolledEmailInput
        : undefined;
    if (!selector) {
      throw new Error(`Unsupported uncontrolled input field name: ${fieldName}`);
    }

    await page.fill(selector, value);
  }

  async getControlledDisplay(fieldName: string): Promise<string | null> {
    const page = await this.getPage();
    const normalizedField = fieldName.toLowerCase();
    const selector =
      normalizedField === 'name'
        ? this.selectors.controlledNameDisplay
        : normalizedField === 'email'
        ? this.selectors.controlledEmailDisplay
        : normalizedField === 'accepted terms'
        ? this.selectors.controlledAcceptedTermsDisplay
        : undefined;
    if (!selector) {
      throw new Error(`Unsupported controlled display field name: ${fieldName}`);
    }

    return page.locator(selector).textContent();
  }

  async submitControlledForm(): Promise<void> {
    await this.click('controlledSubmitButton');
  }

  async submitUncontrolledForm(): Promise<void> {
    await this.click('uncontrolledSubmitButton');
  }

  async getControlledSubmitCount(): Promise<number> {
    const text = await this.getText('controlledSubmitCount');
    return Number(text?.replace(/[^0-9]/g, '') ?? 0);
  }

  async getUncontrolledSubmitCount(): Promise<number> {
    const text = await this.getText('uncontrolledSubmitCount');
    return Number(text?.replace(/[^0-9]/g, '') ?? 0);
  }

  async getUncontrolledResult(fieldName: string): Promise<string | null> {
    const page = await this.getPage();
    const normalizedField = fieldName.toLowerCase();
    const selector =
      normalizedField === 'name'
        ? this.selectors.uncontrolledNameResult
        : normalizedField === 'email'
        ? this.selectors.uncontrolledEmailResult
        : normalizedField === 'accepted terms'
        ? this.selectors.uncontrolledAcceptedTermsResult
        : undefined;
    if (!selector) {
      throw new Error(`Unsupported uncontrolled result field name: ${fieldName}`);
    }

    return page.locator(selector).textContent();
  }

  async getFieldsetLegend(fieldsetName: string): Promise<string | null> {
    const page = await this.getPage();
    const normalizedName = fieldsetName.toLowerCase();
    const selector =
      normalizedName === 'controlled personal information'
        ? this.selectors.controlledPersonalInformationLegend
        : normalizedName === 'controlled preferences'
        ? this.selectors.controlledPreferencesLegend
        : normalizedName === 'uncontrolled personal information'
        ? this.selectors.uncontrolledPersonalInformationLegend
        : normalizedName === 'uncontrolled preferences'
        ? this.selectors.uncontrolledPreferencesLegend
        : undefined;

    if (!selector) {
      throw new Error(`Unsupported fieldset name: ${fieldsetName}`);
    }

    await page.waitForSelector(selector, { state: 'visible' });
    return page.locator(selector).textContent();
  }
}
