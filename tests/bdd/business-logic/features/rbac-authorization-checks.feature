@integration @rbac @rbac-authorization-checks
Feature: RBAC authorization checks
  As an internal service for enforcing access control
  I want to verify permissions are correctly assigned and checked
  So that authorization decisions are accurate

  Background:
    Given the application is running with a test database

  Scenario: Applying the can-admin role to a user grants them all permissions
    Given a user exists with the role "admin" assigned
    Then the user should have all defined permissions

  Scenario: Users with assigned roles have correct permissions
    Given a user exists with no roles assigned
    And a custom role exists
    When I assign the role to the user
    Then the user should have exactly the permissions originally assigned to the role

  Scenario: Setting empty permissions on an assigned role removes user's existing permissions
    Given a custom role exists
    And a user exists with only the role assigned
    When I update the role's permissions to be empty
    Then the user should have no permissions

  Scenario: Users with multiple roles receive the union of role permissions
    Given a user exists with no roles assigned
    And a role "tester-role-1" exists with the permissions "can-vote, can-rate"
    And a role "tester-role-2" exists with the permissions "can-vote, can-hide-show, can-unhide-show"
    When I assign the role "tester-role-1" to the user
    And I assign the role "tester-role-2" to the user
    Then the user's roles should be exactly "tester-role-1, tester-role-2"
    And the permissions for the user should be exactly "can-vote, can-rate, can-hide-show, can-unhide-show"
