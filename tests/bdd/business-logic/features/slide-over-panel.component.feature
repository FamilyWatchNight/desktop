# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 3.

@ui
@component
@slide-over-panel
Feature: Reusable slide-over panel
  As a developer
  I want to exercise the shared slide-over panel
  So that callers can coordinate page blocking and panel content consistently

  Scenario: Blocking panel requests dismissal without closing itself
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Slide-over Panel test page is open for testing
    When I open the slide-over panel
    Then the slide-over panel should be named "Slide-over panel demonstration"
    And the main content should be blocked
    When I press Escape for the slide-over panel
    Then the slide-over panel should remain open
    And the Escape request should be recorded
    When I click the slide-over backdrop
    Then the slide-over panel should be closed
    And the main content should be available

  Scenario: Nonblocking panel leaves page controls available
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Slide-over Panel test page is open for testing
    When I allow page interaction
    And I open the slide-over panel
    Then the main content should be available
    And the slide-over backdrop should not be shown
    When I activate the page control
    Then the page interaction should be recorded
    When I choose the right panel side
    Then the slide-over panel should enter from the right

  Scenario: Oversized right panel scrolls both slots without clipping
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Slide-over Panel test page is open for testing
    When I resize the viewport for the slide-over panel to 420 by 420
    And I choose the right panel side
    And I enable oversized panel width
    And I open the slide-over panel
    Then the right panel should fill the narrow viewport without clipping
    When I scroll the slide-over panel to its end
    Then the bottom panel slot should be visible
    And the start of the top panel slot should be outside the panel viewport

  Scenario: Navigation menu keeps its width and ignores Escape
    Given a user "hide-bootstrap-panel" exists with the role "admin" assigned
    And the Slide-over Panel test page is open for testing
    When I open the navigation menu
    Then the navigation menu should be 290 pixels wide
    When I press Escape for the navigation menu
    Then the navigation menu should remain open
    When I click the navigation menu backdrop
    Then the navigation menu should be closed
