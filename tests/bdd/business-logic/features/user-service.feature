@integration @users
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
    When I attempt to authenticate with username "testuser2" and password "password123"
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
    Then the user's profile should reference the saved image

  Scenario: Save valid JPEG profile image
    Given a user exists with username "jpeguser"
    When I save a 100KB JPEG profile image for the user
    Then the user's profile should reference the saved image

  Scenario: Reject oversized profile image (above 5MB limit)
    Given a user exists with username "largeuser"
    When I attempt to save a 6MB PNG profile image for the user
    Then the profile image save should fail with "Image too large"

  Scenario: Reject invalid profile image format (GIF)
    Given a user exists with username "gifuser"
    When I attempt to save a GIF profile image for the user
    Then the profile image save should fail with "Invalid image type"

  Scenario: Accept profile image exactly at 5MB boundary
    Given a user exists with username "boundaryuser"
    When I attempt to save a 5MB PNG profile image for the user
    Then no error should be thrown
    And the user's profile should reference the saved image

  Scenario: Delete existing profile image
    Given a user exists with username "deleteuser"
    And the user has a 100KB PNG profile image saved
    When I delete the user's profile image
    And the user's profile should have no image reference

  Scenario: Delete non-existent profile image is idempotent
    Given a user exists with username "noimguser"
    When I attempt to delete the user's profile image
    Then no error should be thrown

  Scenario: Change user password successfully
    Given a user exists with username "pwuser" and password "oldpassword"
    And I run unauthenticated
    When I authenticate with username "pwuser" and password "oldpassword"
    Then authentication should succeed
    When I change the user's password to "newpassword"
    Given I run unauthenticated
    When I authenticate with username "pwuser" and password "oldpassword"
    Then authentication should fail
    When I authenticate with username "pwuser" and password "newpassword"
    Then authentication should succeed

  Scenario: Change password on user with no previous password
    Given a user exists with username "nooldpw" and no password
    And I run unauthenticated
    When I authenticate with username "nooldpw" and no password
    Then authentication should succeed
    When I change the user's password to "newpassword"
    Given I run unauthenticated
    When I authenticate with username "nooldpw" and password "newpassword"
    Then authentication should succeed
    Given I run unauthenticated
    When I authenticate with username "nooldpw" and no password
    Then authentication should fail

  @auth
  Scenario: UserService.createUser in bootstrap mode requires no auth, in normal mode requires can-manage-users
    # Bootstrap mode: create first user with no auth
    Given I run unauthenticated
    When I attempt to create a user with username "bootstrap-user" and password "password"
    Then no error should be thrown
    
    # Normal mode: create second user without auth should fail
    Given I run unauthenticated
    When I attempt to create a user with username "second-user" and password "password"
    Then an AuthenticationError should be thrown
    
    # Normal mode: with can-manage-users should succeed
    Given I run with the permissions "can-manage-users"
    When I attempt to create a user with username "second-user" and password "password"
    Then no error should be thrown

  @auth
  Scenario: UserService.authenticateUser requires no auth and fails if attempting to authenticate a different user while already authenticated
    Given a user exists with username "authtest" and password "password123"
    And a user exists with username "otheruser" and password "otherpass"
    
    # Unauthenticated: should succeed
    Given I run unauthenticated
    When I attempt to authenticate with username "authtest" and password "password123"
    Then no error should be thrown
    
    # Already authenticated as same user: should succeed (re-authentication)
    When I attempt to authenticate with username "authtest" and password "password123"
    Then no error should be thrown
    
    # Already authenticated as different user: should fail
    When I attempt to authenticate with username "otheruser" and password "otherpass"
    Then an AuthorizationError should be thrown

  @auth
  Scenario: UserService.getUserById permits self-access without can-admin
    Given a user exists with username "alice"
    And the user's display name is "Alice Banks"
    And a user exists with username "frank"
    
    # Unauthenticated: should return a limited profile
    Given I run unauthenticated
    When I attempt to get the profile for user "alice"
    Then no error should be thrown
    And the returned profile should be limited
    
    # With can-manage-users: should succeed with a full profile
    Given I run with the permissions "can-manage-users"
    When I attempt to get the profile for user "alice"
    Then no error should be thrown
    And the returned profile should be complete
    
    # As a different user without permissions: should return a limited profile
    Given I run unauthenticated
    When I authenticate as user "frank"
    When I attempt to get the profile for user "alice"
    Then no error should be thrown
    And the returned profile should be limited
    
    # As the same user (without can-admin): should succeed with a full profile
    Given I run as user "alice"
    When I attempt to get the profile for user "alice"
    Then no error should be thrown
    And the returned profile should be complete

  @auth
  Scenario: UserService.updateUserProfile permits self-access without can-admin
    Given a user exists with username "bob"
    And a user exists with username "grace"
    
    # Unauthenticated: should fail
    Given I run unauthenticated
    When I attempt to update the display name of user "bob" to "Bob Updated"
    Then an AuthenticationError should be thrown
    
    # With can-manage-users: should succeed
    Given I run with the permissions "can-manage-users"
    When I attempt to update the display name of user "bob" to "Bob Updated"
    Then no error should be thrown
    
    # As a different user without permissions: should fail
    Given I run as user "grace"
    When I attempt to update the display name of user "bob" to "Bob By Grace"
    Then an AuthorizationError should be thrown
    
    # As the same user (without can-admin): should succeed
    Given I run as user "bob"
    When I attempt to update the display name of user "bob" to "Bob Self Updated"
    Then no error should be thrown

  @auth
  Scenario: UserService.changePassword permits self-access without can-admin
    Given a user exists with username "charlie" and password "oldpass"
    And a user exists with username "henry"
    
    # Unauthenticated: should fail
    Given I run unauthenticated
    When I attempt to change the password of user "charlie" to "newpass"
    Then an AuthenticationError should be thrown
    
    # With can-manage-users: should succeed
    Given I run with the permissions "can-manage-users"
    When I attempt to change the password of user "charlie" to "newpass"
    Then no error should be thrown
    
    # Verify old password no longer works
    Given I run unauthenticated
    When I authenticate with username "charlie" and password "oldpass"
    Then authentication should fail
    
    # As a different user without permissions: should fail
    Given I run as user "henry"
    When I attempt to change the password of user "charlie" to "henryChangedIt"
    Then an AuthorizationError should be thrown
    
    # As the same user (without can-admin): should succeed with new password
    Given I run as user "charlie"
    When I attempt to change the password of user "charlie" to "anotherpass"
    Then no error should be thrown

  @auth
  Scenario: UserService.saveProfileImage permits self-access without can-manage-users
    Given a user exists with username "diana"
    
    # Unauthenticated: should fail
    Given I run unauthenticated
    When I attempt to save a 100KB PNG profile image for the user "diana"
    Then an AuthenticationError should be thrown
    
    # With can-manage-users: should succeed
    Given I run with the permissions "can-manage-users"
    When I attempt to save a 100KB PNG profile image for the user "diana"
    Then no error should be thrown
    
    # As a different user without permissions: should fail
    Given I run without the permissions "can-manage-users"
    When I attempt to save a 100KB PNG profile image for the user "diana"
    Then an AuthorizationError should be thrown
    
    # As the same user (without can-admin): should succeed
    Given I run as user "diana"
    When I attempt to save a 100KB PNG profile image for the user "diana"
    Then no error should be thrown

  @auth
  Scenario: UserService.getUsersWithPermissions succeeds unauthenticated
    Given a role exists with the permissions "can-vote"
    And a user exists with username "eve"
    And the role has been assigned to user "eve"
    
    # Unauthenticated should succeed
    Given I run unauthenticated
    When I attempt to request users with the permissions "can-vote"
    Then no error should be thrown