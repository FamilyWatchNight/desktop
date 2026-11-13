# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3.

@ui
@component
@tooltip
Feature: Tooltip and disabled-reason pattern
  As a tester
  I want to verify the reusable tooltip and disabled-reason behavior
  So that unavailable controls explain why and remain non-activatable

  Scenario: Tooltip reveals on pointer hover and keyboard focus without shifting layout
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Tooltip test page is open for testing
    Then the basic tooltip should be hidden
    When I hover the basic tooltip trigger
    Then the basic tooltip should be visible
    When I move the pointer away from the basic tooltip trigger
    Then the basic tooltip should be hidden
    When I focus the basic tooltip trigger
    Then the basic tooltip should be visible
    When I blur the basic tooltip trigger
    Then the basic tooltip should be hidden

  Scenario: A control with a reason is unavailable but focusable and does not activate
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Tooltip test page is open for testing
    And the reason is set to "This role is assigned"
    And the preview controls are disabled
    Then the disabled button should be marked unavailable
    And the disabled button should remain focusable
    And the disabled button should have an accessible reason "This role is assigned"
    And the disabled menu item should be marked unavailable
    And the disabled menu item should have an accessible reason "This role is assigned"
    When I click the disabled button
    Then the disabled button should still be marked unavailable
