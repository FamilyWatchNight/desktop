# Agent BDD Testing Guide

Use this guide when writing or running Cucumber feature tests. For the human-facing layer overview, see `tests/bdd/README.md`.

## Step and page-object responsibilities

- Describe user goals and business intent in feature files and Business Logic steps, not individual inputs or layout details.
- Compose reusable user workflows in Business Flow personas. Common actions such as signing in and out belong in the shared `UserPersona` and shared UI steps.
- Keep Business Logic steps going through personas rather than calling Technical-layer helpers directly.
- Keep selectors and low-level UI interactions in technical PageObjects.

## Test locations and commands

- Cucumber features live in `tests/bdd/business-logic/features/`; steps in `tests/bdd/business-logic/steps/`; personas in `tests/bdd/business-flow/personas/`; and PageObjects and infrastructure in `tests/bdd/technical/`.
- Run feature tests through npm scripts, not `cucumber-js` directly, so required testing pages and build hooks are applied.
- `npm run test:features` runs the full feature suite; use `npm run test:features:electron` for Electron and `npm run test:features:browser` for Browser.
- To select a feature subset, pass tags through the npm script, for example: `npm run test:features -- --tags "@ui and @form-controls"`.

## Scenario state

Store scenario-specific data through `world.getStateStore(namespace)`. Use keyed state for multiple instances and last-created state for unkeyed access; keep state namespaced per scenario.

## Main-process test hooks

Service logic runs in the Electron main process and cannot be tested through Jest unit tests. Integration hooks live in `src/main/testing-active`; `InternalSystemPersona` reaches them through `tests/bdd/technical/hooks/`. Only serializable data crosses the Cucumber-to-Electron hook boundary.

Build-generated files under `src/main/testing/` are overwritten. Make changes to their corresponding source files in `src/main/testing-active/` instead.

## Validation

- Before the first test, agree with the user on the test approach and coverage.
- After each scenario, check that it worked as intended before proceeding.
- Verify test state isolation, persona contracts, and the separation between Business Logic and Technical layers.
- When changing `src/main/testing-active/TestHooksImpl.ts` or related hooks, run `npm run build:main:for-integration-testing` before feature tests.

## UI BDD tests

When writing BDD tests that exercise the UI, follow the [UI BDD testing guidance](bdd-ui-testing.md) for UI test levels, selector conventions, and PageObject assertions.
