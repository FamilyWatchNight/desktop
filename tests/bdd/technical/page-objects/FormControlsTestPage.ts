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
    controlledInputNotificationEmail: '[data-testid="controlled-input-notification-email"]',
    controlledInputNotificationSms: '[data-testid="controlled-input-notification-sms"]',
    controlledInputNotificationPush: '[data-testid="controlled-input-notification-push"]',
    controlledRadioGroup: '[data-testid="controlled-radio-group"]',
    controlledRadioPlanBasic: '[data-testid="controlled-radio-plan-basic"]',
    controlledRadioPlanPremium: '[data-testid="controlled-radio-plan-premium"]',
    controlledSelectGenre: '[data-testid="controlled-select-genre"]',
    controlledNewsletterDisplay: '[data-testid="controlled-newsletter-display"]',
    controlledNotificationMethodsDisplay: '[data-testid="controlled-notification-methods-display"]',
    controlledAccountTypeDisplay: '[data-testid="controlled-account-type-display"]',
    controlledGenreDisplay: '[data-testid="controlled-genre-display"]',
    controlledSubmitButton: '[data-testid="controlled-submit-button"]',
    controlledValidateButton: '[data-testid="controlled-validate-button"]',
    controlledResetButton: '[data-testid="controlled-reset-button"]',
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
    uncontrolledInputNotificationEmail: '[data-testid="uncontrolled-input-notification-email"]',
    uncontrolledInputNotificationSms: '[data-testid="uncontrolled-input-notification-sms"]',
    uncontrolledInputNotificationPush: '[data-testid="uncontrolled-input-notification-push"]',
    uncontrolledRadioGroup: '[data-testid="uncontrolled-radio-group"]',
    uncontrolledRadioPlanBasic: '[data-testid="uncontrolled-radio-plan-basic"]',
    uncontrolledRadioPlanPremium: '[data-testid="uncontrolled-radio-plan-premium"]',
    uncontrolledSelectGenre: '[data-testid="uncontrolled-select-genre"]',
    uncontrolledSubmitButton: '[data-testid="uncontrolled-submit-button"]',
    uncontrolledValidateButton: '[data-testid="uncontrolled-validate-button"]',
    uncontrolledResetButton: '[data-testid="uncontrolled-reset-button"]',
    uncontrolledGetValuesButton: '[data-testid="uncontrolled-get-values-button"]',
    uncontrolledInitialValuesTextarea: '[data-testid="uncontrolled-initial-values-textarea"]',
    uncontrolledSetInitialValuesButton: '[data-testid="uncontrolled-set-initial-values-button"]',
    uncontrolledValuesJson: '[data-testid="uncontrolled-values-json"]',
    uncontrolledNameDisplay: '[data-testid="uncontrolled-name-display"]',
    uncontrolledEmailDisplay: '[data-testid="uncontrolled-email-display"]',
    uncontrolledAcceptedTermsDisplay: '[data-testid="uncontrolled-accepted-terms-result"]',
    uncontrolledNewsletterDisplay: '[data-testid="uncontrolled-newsletter-display"]',
    uncontrolledNotificationMethodsDisplay:
      '[data-testid="uncontrolled-notification-methods-display"]',
    uncontrolledAccountTypeDisplay: '[data-testid="uncontrolled-account-type-display"]',
    uncontrolledGenreDisplay: '[data-testid="uncontrolled-genre-display"]',
    uncontrolledSubmitCount: '[data-testid="uncontrolled-submit-count"]',
    uncontrolledPersonalInformationFieldset:
      '[data-testid="uncontrolled-fieldset-personal-information"]',
    uncontrolledPersonalInformationLegend:
      '[data-testid="uncontrolled-fieldset-personal-information"] legend',
    uncontrolledPreferencesFieldset: '[data-testid="uncontrolled-fieldset-preferences"]',
    uncontrolledPreferencesLegend: '[data-testid="uncontrolled-fieldset-preferences"] legend',
  } as Record<string, string>;

  async submitControlledForm(): Promise<void> {
    await this.click('controlledSubmitButton');
  }

  async submitUncontrolledForm(): Promise<void> {
    await this.click('uncontrolledSubmitButton');
  }

  async setUncontrolledFormReady(
    isReady: boolean,
    initialValues: Record<string, unknown> | null,
  ): Promise<void> {
    // Fill the textarea with the JSON (or empty) and click the Set button
    if (initialValues) {
      await this.setInputText(
        'uncontrolledInitialValuesTextarea',
        JSON.stringify(initialValues, null, 2),
      );
    } else {
      await this.setInputText('uncontrolledInitialValuesTextarea', '');
    }
    if (isReady) {
      await this.click('uncontrolledSetInitialValuesButton');
    } else {
      // If not ready, write invalid JSON and click Set to force not-ready state
      await this.setInputText('uncontrolledInitialValuesTextarea', '{ invalid');
      await this.click('uncontrolledSetInitialValuesButton');
    }
    // Store initial values in world state for verification
    if (initialValues) {
      this.world.setStateObject('uncontrolledInitialValues', initialValues);
    }
  }

  private async getInputValue(name: string): Promise<string> {
    const page = await this.getPage();
    const selector = this.getSelector(name);
    const value = await page.locator(selector).inputValue();
    return value ?? '';
  }

  private async getSelectValue(name: string): Promise<string> {
    const page = await this.getPage();
    const selector = this.getSelector(name);
    const value = await page.locator(selector).inputValue();
    return value ?? '';
  }

  private async isDisabled(name: string): Promise<boolean> {
    const page = await this.getPage();
    const selector = this.getSelector(name);
    const isDisabled = await page.locator(selector).isDisabled();
    return isDisabled;
  }

  async verifyUncontrolledFieldsAreDefault(): Promise<void> {
    // Verify all uncontrolled fields are at their defaults
    const nameValue = await this.getInputValue('uncontrolledNameInput');
    const emailValue = await this.getInputValue('uncontrolledEmailInput');
    const acceptedTermsChecked = await this.isChecked('uncontrolledAcceptedTermsInput');
    const newsletterChecked = await this.isChecked('uncontrolledNewsletterInput');
    const genreValue = await this.getSelectValue('uncontrolledSelectGenre');

    const { expect } = await import('@playwright/test');
    expect(nameValue).toBe('');
    expect(emailValue).toBe('');
    expect(acceptedTermsChecked).toBe(false);
    expect(newsletterChecked).toBe(false);
    expect(genreValue).toBe('comedy');
  }

  async verifyUncontrolledFieldsMatchValues(
    expectedValues: Record<string, unknown>,
  ): Promise<void> {
    const { expect } = await import('@playwright/test');

    if (expectedValues.name !== undefined) {
      const nameValue = await this.getInputValue('uncontrolledNameInput');
      expect(nameValue).toBe(String(expectedValues.name));
    }

    if (expectedValues.email !== undefined) {
      const emailValue = await this.getInputValue('uncontrolledEmailInput');
      expect(emailValue).toBe(String(expectedValues.email));
    }

    if (expectedValues.acceptedTerms !== undefined) {
      const acceptedTermsChecked = await this.isChecked('uncontrolledAcceptedTermsInput');
      expect(acceptedTermsChecked).toBe(Boolean(expectedValues.acceptedTerms));
    }

    if (expectedValues.newsletter !== undefined) {
      const newsletterExpected = expectedValues.newsletter as unknown[];
      const newsletterChecked = await this.isChecked('uncontrolledNewsletterInput');
      expect(newsletterChecked).toBe(Boolean(newsletterExpected.includes('yes')));
    }

    if (expectedValues.favoriteGenre !== undefined) {
      const genreValue = await this.getSelectValue('uncontrolledSelectGenre');
      expect(genreValue).toBe(String(expectedValues.favoriteGenre));
    }

    if (expectedValues.notificationMethods !== undefined) {
      const notificationMethods = expectedValues.notificationMethods as unknown[];
      const emailChecked = await this.isChecked('uncontrolledInputNotificationEmail');
      const smsChecked = await this.isChecked('uncontrolledInputNotificationSms');
      const pushChecked = await this.isChecked('uncontrolledInputNotificationPush');

      expect(emailChecked).toBe(notificationMethods.includes('email'));
      expect(smsChecked).toBe(notificationMethods.includes('sms'));
      expect(pushChecked).toBe(notificationMethods.includes('push'));
    }

    if (expectedValues.plan !== undefined) {
      const planBasicChecked = await this.isChecked('uncontrolledRadioPlanBasic');
      const planPremiumChecked = await this.isChecked('uncontrolledRadioPlanPremium');
      const expectedPlan = String(expectedValues.plan);

      if (expectedPlan === 'basic') {
        expect(planBasicChecked).toBe(true);
        expect(planPremiumChecked).toBe(false);
      } else if (expectedPlan === 'premium') {
        expect(planBasicChecked).toBe(false);
        expect(planPremiumChecked).toBe(true);
      }
    }
  }

  async verifyUncontrolledFieldsDisabled(shouldBeDisabled: boolean): Promise<void> {
    const { expect } = await import('@playwright/test');

    const fieldSelectors = [
      'uncontrolledNameInput',
      'uncontrolledEmailInput',
      'uncontrolledAcceptedTermsInput',
      'uncontrolledNewsletterInput',
      'uncontrolledInputNotificationEmail',
      'uncontrolledInputNotificationSms',
      'uncontrolledInputNotificationPush',
      'uncontrolledRadioPlanBasic',
      'uncontrolledRadioPlanPremium',
      'uncontrolledSelectGenre',
    ];

    for (const selector of fieldSelectors) {
      const isDisabled = await this.isDisabled(selector);
      expect(isDisabled).toBe(shouldBeDisabled);
    }
  }
}
