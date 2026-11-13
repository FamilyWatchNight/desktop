# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3.

@ui
@component
@modal
Feature: Modal and destructive-confirmation pattern
  As a tester
  I want to exercise the shared modal and destructive-confirmation behavior
  So that future features can rely on the same accessible interaction pattern

  Scenario: Confirming an action closes through caller state
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Modal test page is open for testing
    When I open the destructive confirmation
    Then the confirmation dialog should be named "Delete role: Demo role?"
    And the confirmation actions should be ordered "Cancel" then "Delete"
    And the confirmation Cancel action should have focus
    When I choose the destructive action
    Then the confirmation action should be recorded
    And the confirmation dialog should be closed
    When I open the destructive confirmation
    And I cancel the confirmation
    Then the confirmation cancellation should be recorded
    And the confirmation dialog should be closed

  Scenario: Escape and backdrop cancel the generic modal
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Modal test page is open for testing
    When I open the generic modal
    And I press Escape in the modal
    Then the generic modal should be closed
    When I open the generic modal
    And I click the modal backdrop
    Then the generic modal should be closed

  Scenario: Tab and spatial navigation stay within the confirmation
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Modal test page is open for testing
    When I open the destructive confirmation
    And I move spatial focus to the destructive action
    Then the destructive action should have spatial focus
    When I activate the focused destructive action
    Then the confirmation action should be recorded
    And the confirmation dialog should be closed

  Scenario: Narrow windows preserve destructive action order
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Modal test page is open for testing
    When I resize the viewport to 420 by 420
    And I open the destructive confirmation
    Then the confirmation actions should be ordered "Cancel" then "Delete"
    And the confirmation action buttons should fit inside the dialog

  Scenario: Narrow windows keep modal actions visible while content scrolls
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Modal test page is open for testing
    When I resize the viewport to 420 by 420
    And I open the generic modal
    Then the generic modal actions should fit inside the dialog
    When I scroll the modal content to the end
    Then the end of modal content should be visible
    And the generic modal actions should fit inside the dialog
