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
    When I enter "Alice" into the controlled "Name" input
    And I enter "alice@example.com" into the controlled "Email" input
    And I submit the controlled form
    Then the controlled "Name" display should show "Name: Alice"
    And the controlled "Email" display should show "Email: alice@example.com"
    And the controlled form submission count should be 1
    And the "Controlled Personal Information" fieldset should have the legend "Controlled Personal Information"

  Scenario: The uncontrolled form submits DOM-updated values
    Given the Form Controls test page is open for testing
    When I enter "Bob" into the uncontrolled "Name" input
    And I enter "bob@example.com" into the uncontrolled "Email" input
    And I submit the uncontrolled form
    Then the uncontrolled "Name" result should show "Name: Bob"
    And the uncontrolled "Email" result should show "Email: bob@example.com"
    And the uncontrolled form submission count should be 1
    And the "Uncontrolled Personal Information" fieldset should have the legend "Uncontrolled Personal Information"

  Scenario: Inputs with labelVisible=false render aria-label but not visible label elements
    Given the Form Controls test page is open for testing
    Then the hidden label "Default" input should have aria-label "Default"
    And the hidden label "Custom" input should have aria-label "ARIA Custom"
    And the hidden label "Default" input should be visible without a visible label element
    And the hidden label "Custom" input should be visible without a visible label element
