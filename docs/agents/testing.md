# Agent Testing Guide

- For Cucumber feature tests, follow the [BDD testing guide](bdd-testing.md); its UI-only link leads to PageObject and UI assertion conventions when relevant.
- Unit tests live in `tests/unit/`; run them with `npm run test:unit`.

## Validation

- Before the first test, agree with the user on the test approach and coverage.

## Test quality

Test observable behavior with specific outcomes. Avoid placeholder tests, method-existence checks, or non-null assertions that do not meaningfully validate behavior.
