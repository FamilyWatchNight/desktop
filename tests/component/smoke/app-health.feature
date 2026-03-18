@smoke
Feature: Application Health Checks
  As a developer
  I want to verify basic application functionality
  So that I can quickly identify critical issues

  @smoke
  Scenario: Application launches successfully
    When I launch the application
    Then the application window should be visible

  @smoke
  Scenario: Database connects properly
    Given the application is running with a test database
    Then the database should be connected
    And I can perform basic movie searches