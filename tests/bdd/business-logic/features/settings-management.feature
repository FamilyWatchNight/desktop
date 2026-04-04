@integration
Feature: Settings Management
  As a user
  I want to manage application settings
  So that I can customize the app behavior

  Background:
    Given the application is running with default settings

  Scenario: Load default settings
    When I request all settings
    Then I should receive settings that include the following:
      """
      {
        "webPort": 3000,
        "tmdbApiKey": "",
        "watchmodeApiKey": ""
      }
      """

  Scenario: Update a setting
    When I set the "webPort" setting to 8080
    And I request the "webPort" setting
    Then I should receive a "webPort" setting with value 8080

  Scenario: Persist settings across requests
    When I set the "webPort" setting to 4000
    And I set the "tmdbApiKey" setting to "test-key"
    And I request all settings
    Then I should receive settings that include the following:
      """
      {
        "webPort": 4000,
        "tmdbApiKey": "test-key"
      }
      """
    When I save the following settings:
      """
      {
        "webPort": 9090,
        "watchmodeApiKey": "test-key2"
      }
      """
    And I request all settings
    Then I should receive settings that include the following:
      """
      {
        "webPort": 9090,
        "tmdbApiKey": "test-key",
        "watchmodeApiKey": "test-key2"
      }
      """

  Scenario: Update multiple settings
    When I save the following settings:
      """
      {
        "webPort": 4000,
        "tmdbApiKey": "test-key"
      }
      """
    And I request all settings
    Then I should receive settings that include the following:
      """
      {
        "webPort": 4000,
        "tmdbApiKey": "test-key"
      }
      """