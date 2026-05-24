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
    Then the "controlledNameDisplay" element should say "Name: Alice"
    And the "controlledEmailDisplay" element should say "Email: alice@example.com"
    And the "controlledSubmitCount" element should say 1
    And the "controlledPersonalInformationFieldset" fieldset should have the legend "Controlled Personal Information"

  Scenario: The uncontrolled form submits DOM-updated values
    Given the Form Controls test page is open for testing
    When I enter "Bob" into the "uncontrolledNameInput" input
    And I enter "bob@example.com" into the "uncontrolledEmailInput" input
    And I submit the uncontrolled form
    Then the "uncontrolledNameDisplay" element should say "Name: Bob"
    And the "uncontrolledEmailDisplay" element should say "Email: bob@example.com"
    And the "uncontrolledSubmitCount" element should say 1
    And the "uncontrolledPersonalInformationFieldset" fieldset should have the legend "Uncontrolled Personal Information"

  Scenario: Inputs with labelVisible=false render aria-label but not visible label elements
    Given the Form Controls test page is open for testing
    Then the "hiddenLabelsDefaultInput" element should have aria-label "Default"
    And the "hiddenLabelsCustomInput" element should have aria-label "ARIA Custom"
    And the "hiddenLabelsDefaultInput" input should be visible without a visible label element
    And the "hiddenLabelsCustomInput" input should be visible without a visible label element

  Scenario: Inputs without explicit id receive generated ids and custom ids are preserved
    Given the Form Controls test page is open for testing
    Then the "generatedIdNameInput1" element should have id "form-test-1"
    And the "customIdEmailInput" element should have id "custom-id-email"
    And the "generatedIdNameInput2" element should have id "form-test-2"
    And the "generatedIdNameInput1" input's label should reference its id
    And the "customIdEmailInput" input's label should reference its id
    And the "generatedIdNameInput2" input's label should reference its id
    And the "formlessGeneratedIdNameInput1" element should have id "text-1"
    And the "formlessCustomIdEmailInput" element should have id "formless-custom-id-email"
    And the "formlessGeneratedIdNameInput2" element should have id "text-2"
    And the "formlessGeneratedIdNameInput1" input's label should reference its id
    And the "formlessCustomIdEmailInput" input's label should reference its id
    And the "formlessGeneratedIdNameInput2" input's label should reference its id

  Scenario: Controlled stage 2 inputs update state through user interaction
    Given the Form Controls test page is open for testing
    When I toggle the "controlledNewsletterInput" checkbox
    And I select "Premium" for the "controlled plan" radio group
    And I choose "Drama" from the "controlledSelectGenre" select
    Then the "controlledNewsletterDisplay" element should say "Newsletter: true"
    And the "controlledAccountTypeDisplay" element should say "Account type: premium"
    And the "controlledGenreDisplay" element should say "Favorite genre: drama"

  Scenario: Uncontrolled stage 2 inputs submit DOM values
    Given the Form Controls test page is open for testing
    When I toggle the "uncontrolledNewsletterInput" checkbox
    And I select "Premium" for the "uncontrolled plan" radio group
    And I choose "Action" from the "uncontrolledSelectGenre" select
    And I submit the uncontrolled form
    Then the "uncontrolledNewsletterDisplay" element should say "Newsletter: true"
    And the "uncontrolledAccountTypeDisplay" element should say "Account type: premium"
    And the "uncontrolledGenreDisplay" element should say "Favorite genre: action"
