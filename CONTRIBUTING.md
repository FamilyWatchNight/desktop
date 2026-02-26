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

# Release Process (Manual for now)

1. Use `npm version X.Y.Z --no-git-tag-version` to update `package.json` and `package-lock.json`.
1. Commit this change to a new branch, named `release-vX.Y.Z` and submit a PR to merge that branch to `main`.
1. Wait for the CI checks on the new branch to pass.
1. Merge the PR, and wait for those CI checks to pass.
1. Create a tag `vX.Y.Z` from the `main` branch at the merge point.
   - `git checkout main`
   - `git pull`
   - `git tag vX.Y.Z`
   - `git push origin vX.Y.Z`
1. Create a new Artifact (Windows only for now)
   - `npm run clean; npm run build`
   - _If Windows Defender complains about the new executable touching private data and fails the build, grant it permission, then re-run the build._
1. Create a new Release
   - __Github__ -> __Releases__ -> __Draft a new Release__
   - Select the recently created tag
   - __Generate Release Notes__
   - Attach the `Family Watch Night Setup X.Y.Z.exe` generated from the previous step
   - __Publish__ the Release

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

Similar to `npm run dev` except it builds the application with the integration testing hooks included. This allows you to execute the integration tests on the live app with the debugger attached.

## Other scripts

`clean`

Removes the contents of the `./dist` directory so that no lingering artifacts from previous development builds can influence the current behavior.

`build:main:raw`

Builds the electron main application. This is not meant to be called directly, as it depends on either `./scripts/use-testing-noop.js` or `./scripts/use-testing-active.js` to have run first.

`build:main`

Calls `/scripts/use-testing-noop.js` to plug in the empty test hooks, then calls `build:main:raw` to build the electron main application as it would be built for a production environment.

`build:main:for-integration-testing`

Calls `./scripts/use-testing-active.js` to plug in the active integration testing hooks, then calls `build:main:raw` to build the electron main application with support for integration testing and its mocks.

`build:renderer`

Builds only the electron renderer process. This is not meant to be called directly. It's used by other build scripts.

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

Runs the three scripts listed below to execute unit tests, then integration tests, then feature tests.

`test:unit`

Uses jest to execute only the unit tests from `./src/tests/unit`.

`test:integration`

Builds the main application with integration testing hooks and executes the Playwright integration tests from `./src/tests/integration`.

`test:features`

Builds the main application with integration testing hooks and executes the Cucumber feature tests from `./src/tests/features`.

`build`

Creates a completely clean build of the full production-ready application without integration testing hooks.

Creates an installer package that can be used to install the application on a system of the same type (Windows / Mac / Linux) on which the script is run.

`pack`

Creates a completely clean build of the full production-ready application in a separate directory. Does not create an installer

`postinstall`

Utility script used by electron to ensure that all of the app dependencies are included in the packaged electron application.