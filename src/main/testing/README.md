# Important

MANDATORY: Do not add, remove, or modify any source code in this directory.

This directory is populated using one of the following pre-build scripts:
- `./scripts/use-testing-active.js`
- `./scripts/use-testing-noop.js`

For builds that will support integration testing, the `use-testing-active.js` prebuild script
will copy the active test hooks from `./src/main/testing/testing-active/`. For all other builds (especially production builds), the `use-testing-noop.js` prebuild script will copy the empty test hooks from `/src/main/testing/testing-noop/`.