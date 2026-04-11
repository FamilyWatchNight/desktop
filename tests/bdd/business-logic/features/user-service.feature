Feature: User Service
  As a system
  I want to manage users securely
  So that authentication and profiles work correctly

  Scenario: Create user without password
    When I create a user with username "testuser" and no password
    Then the user should be created successfully
    Given I run unauthenticated
    When I authenticate with username "testuser" and no password
    Then authentication should succeed
    Given I run unauthenticated
    When I authenticate with username "testuser" and password "wrong"
    Then authentication should fail

  Scenario: Create user with password
    When I create a user with username "testuser2" and password "password123"
    Then the user should be created successfully
    Given I run unauthenticated
    When I authenticate with username "testuser2" and password "password123"
    Then authentication should succeed
    Given I run unauthenticated
    When I authenticate with username "testuser2" and no password
    Then authentication should fail

  Scenario: Authenticate user without password
    Given a user exists with username "nopass" and no password
    And I run unauthenticated
    When I authenticate with username "nopass" and no password
    Then authentication should succeed

  Scenario: Authenticate user with correct password
    Given a user exists with username "withpass" and password "secret"
    And I run unauthenticated
    When I authenticate with username "withpass" and password "secret"
    Then authentication should succeed

  Scenario: Fail authentication with wrong password
    Given a user exists with username "withpass2" and password "secret"
    And I run unauthenticated
    When I authenticate with username "withpass2" and password "wrong"
    Then authentication should fail

  Scenario: Update user profile
    Given a user exists with username "profileuser"
    When I update the user's display name to "Test User"
    Then the user's display name should be "Test User"