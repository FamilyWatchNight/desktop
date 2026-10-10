# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License,
# version 3.

@ui
@profile
Feature: User Profile Management
  As a signed-in user
  I want to manage my own profile
  So that my account details stay current

  Scenario: Users without profile permission cannot access profile management
    Given a user exists with username "profile-viewer" and password "secret"
    And the user has the role "host"
    When I open the app window as an unauthenticated user
    And I sign in as "profile-viewer" with password "secret"
    Then profile management is unavailable in the menu
    When I navigate directly to profile management
    Then profile access is denied

  Scenario: A user can update and persist their display name and profile picture
    Given a user exists with username "profile-editor" and password "secret"
    And the user has the role "influencer"
    When I open the app window as an unauthenticated user
    And I sign in as "profile-editor" with password "secret"
    Then profile management is available in the menu
    When I open my profile management page
    And I update my display name to "Movie Night Host"
    Then my saved display name is "Movie Night Host"
    When I select a valid PNG profile picture
    And I save my selected profile picture
    Then my profile picture is saved
    When I return to my profile page
    Then the profile page shows the display name "Movie Night Host"
    And the profile picture preview is visible
    When I remove my profile picture
    Then my profile picture removal is saved
    And the profile picture placeholder is displayed

  Scenario: Password confirmation is validated and password changes persist
    Given a user exists with username "profile-password" and password "old-secret"
    And the user has the role "influencer"
    When I open the app window as an unauthenticated user
    And I sign in as "profile-password" with password "old-secret"
    And I open my profile management page
    When I submit profile passwords "new-secret" and "different-secret"
    Then the profile page shows the validation error "passwords do not match"
    When I sign out
    And I sign in as "profile-password" with password "old-secret"
    And I open my profile management page
    And I submit profile passwords "new-secret" and "new-secret"
    Then the profile password is saved
    When I sign out
    And I sign in as "profile-password" with password "new-secret"
    And I open my profile management page
    And I remove my password
    Then the password removal is saved

  Scenario: Invalid and oversized profile pictures are rejected without saving
    Given a user exists with username "profile-image-validation" and password "secret"
    And the user has the role "influencer"
    When I open the app window as an unauthenticated user
    And I sign in as "profile-image-validation" with password "secret"
    And I open my profile management page
    When I select a GIF profile picture
    Then the profile page shows the validation error "Choose a PNG or JPEG image"
    When I select an oversized PNG profile picture
    Then the profile page shows the validation error "no larger than 5 MB"
    And no profile picture is saved for "profile-image-validation"
