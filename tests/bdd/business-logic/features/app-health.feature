# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3.

@smoke
Feature: Application Health Checks
  As a developer
  I want to verify basic application functionality
  So that I can quickly identify critical issues

  @smoke
  Scenario: Application launches successfully
    When I launch the application
    Then the application should consider itself ready

  @smoke
  Scenario: Database connects properly
    Given the application is running with a test database
    Then the database should be connected
    And I can perform basic movie searches
