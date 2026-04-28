@integration @settings
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

  @auth
  Scenario: SettingsService.get requires can-admin permission
    Given I run unauthenticated
    When I attempt to request the "webPort" setting
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to request the "webPort" setting
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to request the "webPort" setting
    Then no error should be thrown

  @auth
  Scenario: SettingsService.set requires can-admin permission
    Given I run unauthenticated
    When I attempt to set the "webPort" setting to 5000
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to set the "webPort" setting to 5000
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to set the "webPort" setting to 5000
    Then no error should be thrown

  @auth
  Scenario: SettingsService.load requires can-admin permission
    Given I run unauthenticated
    When I attempt to request all settings
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to request all settings
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to request all settings
    Then no error should be thrown

  @auth
  Scenario: SettingsService.save requires can-admin permission
    Given I run unauthenticated
    When I attempt to save the following settings:
      """
      {
        "webPort": 7000
      }
      """
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to save the following settings:
      """
      {
        "webPort": 7000
      }
      """
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to save the following settings:
      """
      {
        "webPort": 7000
      }
      """
    Then no error should be thrown