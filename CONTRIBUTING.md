# Important Contributor Agreement

By submitting a contribution, you agree that it will be licensed
under the GNU General Public License v3.0.

# Branching Model

- `main` is the default branch and is protected from direct commits
- All changes must go through a PR
- All CI build checks must pass
- Squash Merges only
- To preserve history of smaller commits for larger PRs, create an `archive/...` tag at the tip of the PR's branch before deleting
- Delete branches after merging to `main`

# Versioning Policy

- Use Semantic Versioning
- Releases are tagged `vX.Y.Z`
- Version in `package.json` must match tag

# Release Process

1. (One time only) Make sure npm is set to sign tags: `npm config set sign-git-tag true`
1. Make sure your workspace is fully synchronized with the `main` branch where the new version should be created.
1. Use `npm version X.Y.Z` to update `package.json` and `package-lock.json` and create the new version tag.
1. Synchronize changes and push tags to origin
1. At https://github.com/FamilyWatchNight/desktop/actions, review and approve the pending deployment to the `release` environment.
1. After the CI build completes, open the newly created Release.
1. **Generate Release Notes** and make any changes or clarifications
1. **Publish** the Release.

# First-Time Launch for Developers

`nvm use 24.11.1`

`npm install`

`npm run dev`

# npm scripts and their purposes

## Common development scripts (`npm run...`)

`dev`

Builds the application (without integration testing hooks) for active development. It runs the following scripts concurrently

- `build:main:watch` -- Builds the electron main process with a watcher to rebuild and restart the main process whenever main process source code changes.
- `renderer:vite` -- Builds the electron renderer process with a watcher to Fast Refresh the React process whenever the React source code changes.
- `electron:debug` -- Supports breakpoints and stepwise debugging of the electron main app (on port 5858), and the React app running in Chrome (on port 9222)

`dev:test`

Similar to `npm run dev` except it builds the application with test hooks included. This supports running and debugging Cucumber feature tests against the live app.

## Other scripts

`clean`

Removes the contents of the `./dist` directory so that no lingering artifacts from previous development builds can influence the current behavior.

`build:main:raw`

Builds the electron main application. This is not meant to be called directly, as it depends on either `./scripts/use-testing-noop.js` or `./scripts/use-testing-active.js` to have run first.

`build:main`

Calls `./scripts/use-testing-noop.js` to plug in the empty test hooks, then calls `build:main:raw` to build the electron main application as it would be built for a production environment.

`build:main:for-integration-testing`

Calls `./scripts/use-testing-active.js` to plug in the active test hooks, then calls `build:main:raw`. The Cucumber feature-test scripts use this build.

`build:renderer`

Builds the electron renderer process with no-op test hooks. It is also used by production build scripts.

`build:main:watch`

Builds the electron main process with a watcher to rebuild and restart the main process whenever main process source code changes. This does NOT call either of the `use-testing-*` scripts, so one of the other `build:main` scripts should be called first.

This script is one of three that execute concurrently in `npm run dev`.

`renderer:vite`

Builds the electron renderer process with a watcher to Fast Refresh the React process whenever the React source code changes.

This script is one of three that execute concurrently in `npm run dev`.

`electron:debug`

Supports breakpoints and stepwise debugging of the electron main app (on port 5858), and the React app running in Chrome (on port 9222)

This script is one of three that execute concurrently in `npm run dev`.

`test`

Runs `test:unit` followed by `test:features`.

`test:unit`

Uses Jest to run unit tests from `tests/unit/`.

`test:features`

Builds the main and renderer applications with test hooks, then runs the Cucumber feature tests from `tests/bdd/business-logic/features/`. Playwright provides browser and Electron UI automation where needed. See `docs/agents/testing.md` for test locations and available scripts.

`build`

Creates a completely clean build of the full production-ready application without integration testing hooks.

Creates an installer package that can be used to install the application on a system of the same type (Windows / Mac / Linux) on which the script is run.

`pack`

Creates a completely clean build of the full production-ready application in a separate directory. Does not create an installer

`postinstall`

Utility script used by electron to ensure that all of the app dependencies are included in the packaged electron application.
