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
    controlledNewsletterInput: '[data-testid="controlled-input-newsletter"]',
    controlledRadioPlanBasic: '[data-testid="controlled-radio-plan-basic"]',
    controlledRadioPlanPremium: '[data-testid="controlled-radio-plan-premium"]',
    controlledSelectGenre: '[data-testid="controlled-select-genre"]',
    controlledNewsletterDisplay: '[data-testid="controlled-newsletter-display"]',
    controlledAccountTypeDisplay: '[data-testid="controlled-account-type-display"]',
    controlledGenreDisplay: '[data-testid="controlled-genre-display"]',
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
    uncontrolledNewsletterInput: '[data-testid="uncontrolled-input-newsletter"]',
    uncontrolledRadioPlanBasic: '[data-testid="uncontrolled-radio-plan-basic"]',
    uncontrolledRadioPlanPremium: '[data-testid="uncontrolled-radio-plan-premium"]',
    uncontrolledSelectGenre: '[data-testid="uncontrolled-select-genre"]',
    uncontrolledSubmitButton: '[data-testid="uncontrolled-submit-button"]',
    uncontrolledNameDisplay: '[data-testid="uncontrolled-name-display"]',
    uncontrolledEmailDisplay: '[data-testid="uncontrolled-email-display"]',
    uncontrolledAcceptedTermsDisplay: '[data-testid="uncontrolled-accepted-terms-result"]',
    uncontrolledNewsletterDisplay: '[data-testid="uncontrolled-newsletter-display"]',
    uncontrolledAccountTypeDisplay: '[data-testid="uncontrolled-account-type-display"]',
    uncontrolledGenreDisplay: '[data-testid="uncontrolled-genre-display"]',
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

  getSelector(name: string): string {
    return super.getSelector(name);
  }

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

  async getInputId(name: string): Promise<string | null> {
    return this.getId(name);
  }

  async toggleControlledCheckbox(name: string): Promise<void> {
    const selector = this.getSelector(name);
    const page = await this.getPage();
    await page.click(selector);
  }

  async toggleUncontrolledCheckbox(name: string): Promise<void> {
    const selector = this.getSelector(name);
    const page = await this.getPage();
    await page.click(selector);
  }

  async selectControlledRadio(_groupName: string, optionValue: string): Promise<void> {
    const normalizedValue = optionValue.toLowerCase();
    const selector =
      normalizedValue === 'basic'
        ? this.selectors.controlledRadioPlanBasic
        : normalizedValue === 'premium'
          ? this.selectors.controlledRadioPlanPremium
          : undefined;

    if (!selector) {
      throw new Error(`Unsupported controlled radio option: ${optionValue}`);
    }

    const page = await this.getPage();
    await page.click(selector);
  }

  async selectUncontrolledRadio(_groupName: string, optionValue: string): Promise<void> {
    const normalizedValue = optionValue.toLowerCase();
    const selector =
      normalizedValue === 'basic'
        ? this.selectors.uncontrolledRadioPlanBasic
        : normalizedValue === 'premium'
          ? this.selectors.uncontrolledRadioPlanPremium
          : undefined;

    if (!selector) {
      throw new Error(`Unsupported uncontrolled radio option: ${optionValue}`);
    }

    const page = await this.getPage();
    await page.click(selector);
  }

  async chooseControlledSelect(fieldName: string, optionValue: string): Promise<void> {
    const selector = this.getSelector(fieldName);
    const page = await this.getPage();
    await page.selectOption(selector, optionValue.toLowerCase());
  }

  async chooseUncontrolledSelect(fieldName: string, optionValue: string): Promise<void> {
    const selector = this.getSelector(fieldName);
    const page = await this.getPage();
    await page.selectOption(selector, optionValue.toLowerCase());
  }

  async doesHiddenLabelInputHaveAVisibleLabelParent(name: string): Promise<boolean> {
    const locator = await this.getLocator(name);
    const parentTagName = await locator.evaluate((el) => el.parentElement?.tagName);
    return parentTagName == 'LABEL';
  }
}
