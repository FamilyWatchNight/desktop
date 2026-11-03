# BDD Testing Architecture

This directory implements a three-layer BDD testing approach for the application. Cucumber feature files are the business-readable specification and orchestration layer; Playwright remains the UI automation library for browser and Electron scenarios.

## Layer Overview

### 1. Business Logic Layer (`business-logic/`)

- **Purpose**: Contains Cucumber feature files that describe business requirements in natural language
- **Contents**: `.feature` files containing scenarios, located in `business-logic/features/`
- **Style**: Business-focused, no technical implementation details
- **Example**: "When a user assigns a role, then permissions are updated"

### 2. Business Flow Layer (`business-flow/personas/`)

- **Purpose**: High-level persona abstractions that represent actors in the system
- **Contents**: Persona classes/methods that orchestrate business actions
- **Style**: Domain-specific, hides technical complexity
- **Dependency**: Calls into Technical Layer, never directly into application code

#### Persona Types

- **Internal System Persona** (`internal-system.ts`): Provides service-oriented operations for feature steps.
- **User Persona** (`UserPersona.ts`): Composes user-facing actions and workflows.
- **Specialized Personas** (`ProfileManagementPersona.ts`, `TesterPersona.ts`, `UnauthenticatedUserPersona.ts`): Support focused profile, test, and unauthenticated-user scenarios.

### 3. Technical Layer (`technical/`)

- **Purpose**: Low-level technical helpers for interacting with application internals
- **Contents**: Direct service hooks, API clients, UI automation
- **Style**: Technical primitives, close to application code
- **Subdirectories**:
  - `hooks/`: Direct service/database test hooks
  - `page-objects/`: Playwright UI automation helpers
- **Dependency**: Called by Business Flow Layer, contains no business logic

## Dependency Rules

- Business Flow → Technical Layer (personas call hooks)
- Business Logic → Business Flow (scenarios use personas)
- No reverse dependencies allowed
- Unit tests (`tests/unit/`) remain independent

## Current Implementation

- Feature files and step definitions are under `business-logic/`.
- Business-flow personas include service-oriented and user-oriented workflows.
- Technical helpers include main-process test hooks, scenario infrastructure, and Playwright page objects.
- Feature scripts build the app with test hooks and run Cucumber; `RENDER_LOCATION` selects Browser or Electron UI automation.
- Jest unit tests live outside this BDD tree in `tests/unit/`.

See `docs/agents/testing.md` for current test commands and repository test guidance.

## Implementation Guidelines

### Writing New Tests

1. Start with business requirements in `business-logic/` feature files
2. Implement persona methods in `business-flow/personas/`
3. Add technical helpers in `technical/hooks/` if needed
4. Keep layers separated; personas should not know about database schemas

## References

- "BDD In Action" by John Ferguson Smart (Chapter 7: Layered Architecture)
- Our AGENTS.md for testing workflow guidelines
