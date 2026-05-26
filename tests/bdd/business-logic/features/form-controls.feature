# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3.

@ui
@component
@form-controls
Feature: Form Controls
  In order to validate form structure, semantics, and control wiring
  As a tester
  I want the Form Controls test page to expose inputs, fieldsets, and submit behavior

  Scenario: The controlled form updates state and displays current values
    Given the Form Controls test page is open for testing
    When I enter "Alice" into the "controlledNameInput" input
    And I enter "alice@example.com" into the "controlledEmailInput" input
    And I submit the controlled form
    And I check the "controlledNewsletterInput" checkbox
    And I select "Premium" for the "controlledRadioGroup" radio group
    And I choose "Drama" from the "controlledSelectGenre" select
    And I check the "controlledInputNotificationEmail" checkbox
    And I check the "controlledInputNotificationPush" checkbox
    Then the "controlledNameDisplay" element should say "Name: Alice"
    And the "controlledEmailDisplay" element should say "Email: alice@example.com"
    And the "controlledPersonalInformationFieldset" fieldset should have the legend "Controlled Personal Information"
    And the "controlledNewsletterDisplay" element should say "Newsletter: true"
    And the "controlledAccountTypeDisplay" element should say "Account type: premium"
    And the "controlledGenreDisplay" element should say "Favorite genre: drama"
    And the "controlledNotificationMethodsDisplay" element should say "Notification methods: email, push"

  Scenario: The uncontrolled form submits DOM-updated values
    Given the Form Controls test page is open for testing
    And the "uncontrolledNameInput" input field has the value "Bob"
    And the "uncontrolledEmailInput" input field has the value "bob@example.com"
    And the "uncontrolledNewsletterInput" checkbox is checked
    And the "uncontrolledInputNotificationEmail" checkbox is checked
    And the "uncontrolledInputNotificationSms" checkbox is checked
    When I select "Premium" for the "uncontrolledRadioGroup" radio group
    And I choose "Action" from the "uncontrolledSelectGenre" select
    And I submit the uncontrolled form
    Then the "uncontrolledNameDisplay" element should say "Name: Bob"
    And the "uncontrolledEmailDisplay" element should say "Email: bob@example.com"
    And the "uncontrolledPersonalInformationFieldset" fieldset should have the legend "Uncontrolled Personal Information"
    Then the "uncontrolledNewsletterDisplay" element should say "Newsletter: true"
    And the "uncontrolledAccountTypeDisplay" element should say "Account type: premium"
    And the "uncontrolledGenreDisplay" element should say "Favorite genre: action"
    And the "uncontrolledNotificationMethodsDisplay" element should say "Notification methods: email, sms"
    When I request the uncontrolled form values
    Then the uncontrolled form values should equal:
      """
      {
        "name": "Bob",
        "email": "bob@example.com",
        "acceptedTerms": false,
        "newsletter": ["on"],
        "notificationMethods": ["email", "sms"],
        "plan": "premium",
        "favoriteGenre": "action"
      }
      """
