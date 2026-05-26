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
    uncontrolledGetValuesButton: '[data-testid="uncontrolled-get-values-button"]',
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
}
