@integration @background-tasks
Feature: Background Task Event Notifications

  Background:
    Given the application is running with a test database
    And event recording is cleared

  Scenario: Controlled task progress generates precise event sequence
    When a background task "progress-test" is enqueued
    And I set the task progress to current=0, max=100, description="Initializing"
    Then the most recent "background-task-update" event should have active task with status="running", current=0, max=100
    And "progress-test" should be the active task

  Scenario: Multiple progress updates are tracked separately
    When a background task "multi-step" is enqueued
    And I set the task progress to current=25, max=100, description="Quarter way"
    And I set the task progress to current=50, max=100, description="Halfway"
    And I set the task progress to current=75, max=100, description="Three quarters"
    Then exactly 6 "background-task-update" events should be recorded
    And the most recent "background-task-update" event should have active task with status="running", current=75, max=100

  Scenario: Task completion generates final event with no active task
    When a background task "completion-test" is enqueued
    And I set the task progress to current=0, max=100, description="Starting"
    And I set the task progress to current=100, max=100, description="Done"
    And I complete the task
    Then the most recent "background-task-update" event should have no active task

  Scenario: Multiple queued tasks show correct labels as active
    When a background task "first-task" is enqueued
    And a background task "second-task" is enqueued
    Then "first-task" should be the active task
    And the most recent "background-task-update" event should have 1 queued tasks
    When I complete the task
    Then "second-task" should be the active task
    And the most recent "background-task-update" event should have 0 queued tasks

  @auth
  Scenario: BackgroundTaskService.enqueue requires can-admin permission
    Given event recording is cleared
    
    Given I run unauthenticated
    When I attempt to enqueue a background task "test-task"
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to enqueue a background task "test-task"
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to enqueue a background task "test-task"
    Then no error should be thrown

  @auth
  Scenario: BackgroundTaskService.getState requires can-admin permission
    Given event recording is cleared
    And a background task "state-test" is enqueued
    
    Given I run unauthenticated
    When I attempt to get the background task state
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to get the background task state
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to get the background task state
    Then no error should be thrown

  @auth
  Scenario: BackgroundTaskService.cancelActive requires can-admin permission
    Given event recording is cleared
    And a background task "cancel-test" is enqueued
    
    Given I run unauthenticated
    When I attempt to cancel the active background task
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to cancel the active background task
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to cancel the active background task
    Then no error should be thrown

  @auth
  Scenario: BackgroundTaskService.removeQueued requires can-admin permission
    Given event recording is cleared
    And a background task "first" is enqueued
    And a background task "second" is enqueued
    And a background task "third" is enqueued
    
    Given I run unauthenticated
    When I attempt to remove the queued background task
    Then an AuthenticationError should be thrown
    
    Given I run without the permissions "can-admin"
    When I attempt to remove the queued background task
    Then an AuthorizationError should be thrown
    
    Given I run with the permissions "can-admin"
    When I attempt to remove the queued background task
    Then no error should be thrown

