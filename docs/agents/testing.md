# Agent Testing Guide

- Unit tests live in `tests/unit/`; run them with the `Run All Unit Tests` task through `runTask`.
- For Cucumber tests, follow the [BDD testing guide](bdd-testing.md), which names the full-suite and targeted-feature tasks.

## Validation

- Before the first test, agree with the user on the test approach and coverage.

## Test quality

Test observable behavior with specific outcomes. Avoid placeholder tests, method-existence checks, or non-null assertions that do not meaningfully validate behavior.
