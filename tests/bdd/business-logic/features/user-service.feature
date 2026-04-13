@integration @user-service
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

  Scenario: Save valid PNG profile image
    Given a user exists with username "pnguser"
    When I save a 100KB PNG profile image for the user
    Then the profile image should be saved successfully
    And the user's profile should reference the saved image

  Scenario: Save valid JPEG profile image
    Given a user exists with username "jpeguser"
    When I save a 100KB JPEG profile image for the user
    Then the profile image should be saved successfully
    And the user's profile should reference the saved image

  Scenario: Reject oversized profile image (above 5MB limit)
    Given a user exists with username "largeuser"
    When I save a 6MB PNG profile image for the user
    Then the profile image save should fail with "Image too large"

  Scenario: Reject invalid profile image format (GIF)
    Given a user exists with username "gifuser"
    When I save a profile image with MIME type "image/gif" for the user
    Then the profile image save should fail with "Invalid image type"

  Scenario: Accept profile image exactly at 5MB boundary
    Given a user exists with username "boundaryuser"
    When I save a 5MB PNG profile image for the user
    Then the profile image should be saved successfully

  Scenario: Delete existing profile image
    Given a user exists with username "deleteuser"
    And the user has a 100KB PNG profile image saved
    When I delete the user's profile image
    Then the profile image should be deleted successfully
    And the user's profile should have no image reference

  Scenario: Delete non-existent profile image is idempotent
    Given a user exists with username "noimguser"
    When I delete the user's profile image
    Then the deletion should complete without error

  Scenario: Change user password successfully
    Given a user exists with username "pwuser" and password "oldpassword"
    And I run unauthenticated
    When I authenticate with username "pwuser" and password "oldpassword"
    Then authentication should succeed
    When I change the user's password to "newpassword"
    Then the password change should succeed
    Given I run unauthenticated
    When I authenticate with username "pwuser" and password "oldpassword"
    Then authentication should fail
    Given I run unauthenticated
    When I authenticate with username "pwuser" and password "newpassword"
    Then authentication should succeed

  Scenario: Change password on user with no previous password
    Given a user exists with username "nooldpw" and no password
    And I run unauthenticated
    When I authenticate with username "nooldpw" and no password
    Then authentication should succeed
    When I change the user's password to "newpassword"
    Then the password change should succeed
    Given I run unauthenticated
    When I authenticate with username "nooldpw" and password "newpassword"
    Then authentication should succeed
    Given I run unauthenticated
    When I authenticate with username "nooldpw" and no password
    Then authentication should fail