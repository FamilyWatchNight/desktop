Files in this directory are copied into `./src/main/testing/` by `./scripts/use-testing-active.js` when building the application for feature testing.

The Cucumber test harness under `tests/bdd/technical/` accesses test-only operations exposed here through the app's test hooks. Keep test-only helpers in this directory or the test harness; do not make production behavior depend on them.

# Important

None of the logic defined in this directory will be included in a production build of the application.

MANDATORY: In this directory, do not include ANY logic that will be required for normal production runtime behavior.
