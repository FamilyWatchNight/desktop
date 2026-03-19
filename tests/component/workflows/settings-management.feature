@integration
Feature: Settings Management
  As a user
  I want to manage application settings
  So that I can customize the app behavior

  Background:
    Given the application is running with default settings

  Scenario: Load default settings
    When I request all settings
    Then I should receive default settings with webPort 3000

  Scenario: Update a setting
    When I set the webPort to 8080
    And I request the webPort setting
    Then I should receive 8080

  Scenario: Persist settings across requests
    When I set the webPort to 9090
    And I request all settings
    Then I should receive settings with webPort 9090

  Scenario: Update multiple settings
    When I save settings with webPort 4000 and tmdbApiKey "test-key"
    And I request all settings
    Then I should receive settings with webPort 4000 and tmdbApiKey "test-key"