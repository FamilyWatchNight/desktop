# Agent Testing Guide

Use this guide when changing or running tests. For the BDD layer model and dependency rules, see `tests/bdd/README.md`.

## BDD step and page-object responsibilities

- Describe user goals and business intent in feature files and business-logic steps, not individual inputs or layout details.
- Put selectors and low-level UI interactions in technical page objects.
- Compose reusable user workflows in business-flow personas. Common actions such as signing in and out belong in the shared `UserPersona` and shared UI steps.
- Reserve element-specific feature steps for component tests that explicitly validate individual controls.
- Business Logic steps must go through personas rather than calling Technical-layer helpers directly.

## UI testing levels

- **Component tests** validate controls using test-only pages excluded from production builds. Build these as real app pages with production layout components and live controls; source them from `src/renderer/testing-active/components/pages/` and register them in `src/renderer/testing-active/index.tsx`.
- **User-experience tests** validate complete user journeys and page transitions using domain-level language.

## UI selector contract

- Give interactive controls and page roots stable, semantic `data-testid` values.
- Keep IDs independent of visible text and translations; use the stable IDs directly in feature files and page objects.
- Treat these IDs as a UI contract, not just a testing convenience.

## Test locations and commands

- Unit tests live in `tests/unit/`; run them with `npm run test:unit`.
- Cucumber features live in `tests/bdd/business-logic/features/`; steps in `tests/bdd/business-logic/steps/`; personas in `tests/bdd/business-flow/personas/`; and page objects and infrastructure in `tests/bdd/technical/`.
- Run feature tests through npm scripts, not `cucumber-js` directly, so required testing pages and build hooks are applied.
- `npm run test:features` runs the full feature suite; use `npm run test:features:electron` for Electron and `npm run test:features:browser` for Browser.
- To select a feature subset, pass tags through the npm script, for example: `npm run test:features -- --tags "@ui and @form-controls"`.

## Scenario state

Store scenario-specific data through `world.getStateStore(namespace)`. Use keyed state for multiple instances and last-created state for unkeyed access; keep state namespaced per scenario.

## Main-process test hooks

Service logic runs in the Electron main process and cannot be tested through Jest unit tests. Integration hooks live in `src/main/testing-active`; `InternalSystemPersona` reaches them through `tests/bdd/technical/hooks/`. Only serializable data crosses the Cucumber-to-Electron hook boundary.

Build-generated files under `src/main/testing/` are overwritten. Make changes to their corresponding source files in `src/main/testing-active/` instead. Renderer component test pages are likewise sourced from `src/renderer/testing-active/` and copied into `src/renderer/testing/` for integration builds.

## Validation

- Before the first test, agree with the user on the test approach and coverage.
- After each scenario, check that it worked as intended before proceeding.
- Verify test state isolation, persona contracts, and the separation between Business Logic and Technical layers.
- For UI features, validate both Electron and Browser transports.
- When changing `src/main/testing-active/TestHooksImpl.ts` or related hooks, run `npm run build:main:for-integration-testing` before feature tests.

## Test quality

Test observable behavior with specific outcomes. Avoid placeholder tests, method-existence checks, or non-null assertions that do not meaningfully validate behavior.
