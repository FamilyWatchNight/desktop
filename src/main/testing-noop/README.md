Files in this directory are copied into `./src/main/testing/` during the `./scripts/use-testing-noop.js` pre-build script when building the application for production or other non-testing purposes. This directory exists merely to define the existance of interfaces and classes that offer support for integration testing.

# Important

MANDATORY: Any interface defined in this directory must be empty. Any functions defined in this directory must perform no logic and must return an empty or null equivalent of the defined return type.