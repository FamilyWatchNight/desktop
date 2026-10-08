# Copyright (c) 2026 Steve Dwire
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3.

@ui
@auth
Feature: Login Roster and Password Authentication

  Scenario: Login roster only includes eligible users and accepts password login
    Given the system role "admin" exists
    And the system role "host" exists
    And a user exists with username "admin-user" and password "adminpass"
    And the user has the role "admin"
    And a user exists with username "host-user" and password "hostpass"
    And the user has the role "host"
    And a user exists with username "no-role-user" and password "norolepass"

    When I open the app window as an unauthenticated user
    Then the login overlay should be visible
    And the login roster should include "admin-user"
    And the login roster should include "host-user"
    And the login roster should not include "no-role-user"

    When I click the login user "admin-user"
    Then the login password form should be visible
    When I click the login-cancel-button
    Then the login roster should include "admin-user"
    And the login roster should include "host-user"

    When I click the login user "host-user"
    Then the login password form should be visible
    When I enter "hostpass" into the login password field
    And I submit the login form
    Then the login overlay should be hidden
