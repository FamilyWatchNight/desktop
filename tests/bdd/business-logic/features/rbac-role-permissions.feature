@integration @rbac @rbac-role-permissions
Feature: RBAC role permissions
  As an internal service for enforcing access control
  I want to assign and update permissions for roles
  So that users will receive the correct access based on their roles

  Background:
    Given the application is running with a test database

  Scenario: Creating a role with explicit permissions
    When I create a role with the permissions "can-host, can-vote"
    Then the role should have the permissions "can-host, can-vote"

  Scenario: Clearing a role's permissions removes associated access
    Given a role exists with the permissions "can-host, can-vote"
    When I update the role's permissions to be empty
    Then the role should have no permissions

  Scenario: Updating a role's permissions replaces the old permissions with the new ones
    Given a role exists with the permissions "can-host, can-vote"
    When I update the role's permissions to be "can-vote, can-rate, can-update-profile"
    Then the role should have the permissions "can-vote, can-rate, can-update-profile"

