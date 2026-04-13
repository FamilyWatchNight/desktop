@integration @rbac @rbac-role-management
Feature: RBAC role management
  As an internal service for enforcing access control
  I want to create and manage roles
  So that roles can be assigned, renamed, duplicated, and deleted safely

  Background:
    Given the application is running with a test database

  Scenario: Creating a new role registers it in the system
    When I create a role
    Then the role should not be marked as a system role

  Scenario: Changing a role's hidden status doesn't change its display name
    Given a role exists with display name "Role To Hide" and hidden status "false"
    When I hide the role
    Then the role should be marked as hidden
    And the role should have display name "Role To Hide"

  Scenario: Changing a hidden role's name dosn't remove its hidden status
    Given a role exists with display name "Role To Rename" and hidden status "true"
    When I rename the role to have display name "Renamed Role"
    And the role should have display name "Renamed Role"
    And the role should be marked as hidden

  Scenario: Changing a role's name and hidden status together should reflect both changes
    Given a role exists with display name "Editable Role" and hidden status "false"
    When I rename the role to have display name "Updated Role" and hidden status "true"
    And the role should have display name "Updated Role"
    And the role should be marked as hidden

  Scenario: Duplicating a role creates a new custom role with the same permissions and hidden status and an updated name
    Given a role "base-role" exists with display name "Base Role" and hidden status "false"
    And the role "base-role" has permissions "can-view-movies, can-comment"
    When I duplicate the role "base-role" to create a new role "copy-of-base-role"
    Then the role "copy-of-base-role" should have the permissions "can-view-movies, can-comment"
    And the role "copy-of-base-role" should have display name "Copy of Base Role"
    And the role "copy-of-base-role" should not be marked as a system role
    And the role "copy-of-base-role" should not be marked as hidden
    When I hide the role "base-role"
    And I duplicate the role "base-role" to create a new role "copy2-of-base-role"
    Then the role "copy2-of-base-role" should have the permissions "can-view-movies, can-comment"
    And the role "copy2-of-base-role" should have display name "Copy of Base Role (2)"
    And the role "copy2-of-base-role" should not be marked as a system role
    And the role "copy2-of-base-role" should be marked as hidden

  Scenario: A system role cannot be deleted, even if no users have it assigned
    Given no users have the system role "admin" assigned
    When I delete the system role "admin"
    Then deleting the role should fail

  Scenario: A custom role assigned to a user cannot be deleted
    Given a custom role exists
    And a user exists with the role assigned
    When I delete the role
    Then deleting the role should fail

  Scenario: A custom role not assigned to any user can be deleted
    Given a custom role exists
    And no users have the role assigned
    When I delete the role
    Then deleting the role should succeed
