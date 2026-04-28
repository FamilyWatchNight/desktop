# BDD Testing Architecture

This directory implements a three-layered BDD testing approach inspired by John Ferguson Smart's "BDD In Action", adapted for our Electron application's testing needs.

## Layer Overview

### 1. Business Logic Layer (`business-logic/`)
- **Purpose**: Contains Cucumber feature files that describe business requirements in natural language
- **Contents**: `.feature` files with scenarios, organized by workflow (e.g., `smoke/`, `workflows/`)
- **Style**: Business-focused, no technical implementation details
- **Example**: "When a user assigns a role, then permissions are updated"

### 2. Business Flow Layer (`business-flow/personas/`)
- **Purpose**: High-level persona abstractions that represent actors in the system
- **Contents**: Persona classes/methods that orchestrate business actions
- **Style**: Domain-specific, hides technical complexity
- **Dependency**: Calls into Technical Layer, never directly into application code

#### Persona Types
- **Internal System Persona** (`internal-system.ts`): Represents trusted backend operations (jobs, cron, service-to-service calls). Used for testing raw business logic without transport concerns. Methods like `createUser()`, `assignRole()`, `getEffectivePermissions()`.
- **External System Persona** (`external-system.ts`): Represents external API consumers (UI, CLI, third-party integrations). Calls HTTP endpoints with authentication context. Methods like `login()`, `callApiEndpoint()`.
- **User Personas** (`admin-user.ts`, `host-user.ts`, `regular-user.ts`): Represent human actors with specific roles. Orchestrate complete user journeys through UI or API. Methods like `performAction()`, `navigateToPage()`.

### 3. Technical Layer (`technical/`)
- **Purpose**: Low-level technical helpers for interacting with application internals
- **Contents**: Direct service hooks, API clients, UI automation
- **Style**: Technical primitives, close to application code
- **Subdirectories**:
  - `hooks/`: Direct service/database test hooks
  - `api/` (future): HTTP API transport helpers
  - `page-objects/` (future): UI automation helpers
- **Dependency**: Called by Business Flow Layer, contains no business logic

## Dependency Rules
- Business Flow → Technical Layer (personas call hooks)
- Business Logic → Business Flow (scenarios use personas)
- No reverse dependencies allowed
- Unit tests (`tests/unit/`) remain independent

## Current Implementation Status

### Stage 2 (RBAC Business Logic)
- **Business Logic**: Feature files for role assignment and permission checking
- **Business Flow**: `internal-system.ts` persona for trusted backend operations
- **Technical**: `hooks/` with direct service calls (no transport layer yet)

### Stage 3 (API Transport)
- **Business Logic**: Feature files for authenticated API interactions
- **Business Flow**: `external-system.ts` persona for HTTP API calls with auth
- **Technical**: `api/` with HTTP client helpers and request/response handling

### Stage 4 (UI Flows)
- **Business Logic**: Feature files for end-to-end user journeys
- **Business Flow**: User personas (`admin-user.ts`, `host-user.ts`, `regular-user.ts`) for UI interactions
- **Technical**: `page-objects/` with UI automation helpers and DOM manipulation

## Implementation Guidelines

### Writing New Tests
1. Start with business requirements in `business-logic/` feature files
2. Implement persona methods in `business-flow/personas/`
3. Add technical helpers in `technical/hooks/` if needed
4. Keep layers separated; personas should not know about database schemas

## References
- "BDD In Action" by John Ferguson Smart (Chapter 7: Layered Architecture)
- Our AGENTS.md for testing workflow guidelines