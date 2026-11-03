# Decisions

This document records decisions whose rationale may help guide future changes. See `docs/agents/implementation.md` and `docs/agents/testing.md` for current implementation guidance.

## 1. Cucumber Features Specify Behavior; Playwright Automates the UI

**Decision**: Use Cucumber feature files as the business-readable specification and orchestration layer for feature tests. Use Playwright where browser or Electron UI automation is needed; Jest remains the unit-test runner.

**Rationale**: Feature files make expected behavior reviewable, while Playwright supplies the browser and Electron interaction needed to exercise UI scenarios. This separates scenario intent from automation mechanics without excluding UI automation.

## 2. Localize User-Facing Text

**Decision**: User-visible UI text and errors that cross a service or transport boundary use i18next keys, with matching English and development locale entries.

**Rationale**: Centralized locale resources make user-facing language consistent and make missing translations visible. The implementation guide documents the repository's translation conventions.

## 3. Expose Renderer Operations Through IPC and HTTP Adapters

**Decision**: Keep IPC and HTTP adapters for renderer operations, backed by the main-process services where applicable.

**Rationale**: The Electron renderer and browser-rendered UI can use the same API-client contract while choosing the transport available in their environment. This separation also keeps transport details out of renderer components.

## 4. Apply Defense in Depth to Sensitive Operations

**Decision**: Sensitive file operations and user input are validated at relevant boundaries, with narrowly exposed IPC capabilities and additional HTTP-server controls.

**Rationale**: A single validation layer is not sufficient for operations involving filesystem paths, localization data, IPC, or network requests. Security controls should be composed so one missed check does not become the only barrier. See `docs/agents/security.md` for current implementation requirements.

## 5. Route Background-Task Notifications Through a Shared Manager

**Decision**: The event notification manager connects background-task state changes to the IPC and HTTP/WebSocket broadcasters.

**Rationale**: Centralizing the current event wiring avoids duplicating transport dispatch and keeps background-task notifications consistent across renderer transports. The current manager handles background-task updates; it is not a general event-registration framework.

**Trade-off**: The manager must be initialized after the server and IPC notification facilities are available.
