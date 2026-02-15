Files in this directory are copied into `./src/main/testing/` during the `./scripts/use-testing-active.js` pre-build script when building the application for integration testing.

The functions defined in this directory may `import` from `./src/tests/integration/support/**` to add functions that are not part of the main application but run inside the main application process only to support integration testing, such as creating mocks of classes that are defined in or imported from `./src/main/**`.

# Important

None of the logic defined in this directory will be included in a production build of the application.

MANDATORY: In this directory, do not include ANY logic that will be required for normal production runtime behavior.
