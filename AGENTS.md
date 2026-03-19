# Family Watch Night

A cross-platform app for managing movie selection for a Family Watch Night

## Agent Workflow Guidance

**CRITICAL: Agents should err on the side of asking for human guidance. Before considering any work complete, check in via HumanAgent Chat.**

### Checkpoint Strategy
- **After each major change**: Ask for feedback on the direction and implementation
- **Before completing a task**: Verify the solution matches expectations, ask if anything should be adjusted
- **On scope questions**: If unsure whether to expand/reduce scope, ask first
- **Implementation choices**: When multiple valid approaches exist, surface them for human decision-making
- **Documentation Updates**: Always use HumanAgent Chat to propose documentation changes before implementing them

**Never assume work is done. Always ask.**

### Interaction Patterns

**HumanAgent Chat Usage:**
- **Documentation Changes**: All updates to AGENTS.md, DECISIONS.md, ARCHITECTURE_ANALYSIS.md must be proposed and refined in HumanAgent Chat before implementation
- **Complex Decisions**: When multiple valid approaches exist, surface them in HumanAgent Chat for human decision-making
- **Scope Clarification**: Use HumanAgent Chat to confirm understanding of requirements and scope before proceeding with implementation

### Testing Validation Flow
When writing tests:
1. **Before writing the first test**: Ask to validate the test approach and confirm test coverage strategy
2. **Before each additional test**: Ask to validate the previous test worked as intended
3. **Never assume test completeness**: Verify sufficient coverage with human before marking done
4. **Test Architecture Awareness**: Understand test levels (@smoke, @integration, unit) and their purposes
5. **Isolation Verification**: Confirm test stores and databases are properly isolated between runs
6. **Data Persistence Patterns**: Use established module variable patterns for test data
7. **Service Interface Matching**: Ensure service methods match test hook expectations

See Testing section below for specific constraints.

---

# Architecture

- Typescript-based Electron app whose UI is exposed both using Electron's built-in renderer and via HTTP using an express server.
- Main process logic is not exposed to the renderer directly through IPC. Instead, it is bundled into a service under `./src/main/services`. Then, it is exposed through both IPC and HTTP through classes in `./src/main/api-server`. The renderer process consumes those services using either an IPC or HTTP client that exists in `./src/renderer/api-client`.

## Core Services (`./src/main/services/`)
- **MovieService**: Movie database CRUD and search
- **SettingsService**: Application settings persistence
- **BackgroundTaskService**: Async task management (imports, etc.)
- **LocalizationService**: i18n and locale management

Each service is pure business logic, completely decoupled from transport (IPC or HTTP).

## Dual Transport Pattern (HTTP + IPC)

The same service instances are exposed through TWO transports:
- **HTTP** (via Express): Exposed on a configurable port (in settings), localhost-only with rate-limiting (100 req/min)
  - Intended for browser access (when complete)
- **IPC** (Electron): For native app communication between main and renderer processes
  - Used when accessing the app through the Electron window

The renderer's API client automatically detects its environment and selects the appropriate transport. This means the same React components are designed to work seamlessly whether launched in Electron or in a browser.

**Note**: The HTTP-based UI is not yet functional. For testing, use Cucumber feature tests and Jest unit tests.

## Database
- **better-sqlite3**: Embedded, synchronous, platform-specific storage paths
- **Migrations-based**: Auto-run migrations on startup from `./src/main/db/migrations/`
- **Models layer**: Handles type conversion (e.g., boolean ↔ 0/1)

## Main Process Files
- **index.ts**: Startup orchestration (i18n → DB → tray → window → servers)
- **window-manager.ts**: Keeps window singleton, enforces preload security
- **api-server.ts**: HTTP + IPC server setup
- **ipc-handlers.ts**: Registers IPC event handlers
- **server.ts**: Express setup with rate limiting and security

---

# Testing

### Test Structure
- **Unit tests** (Jest): Located in `./tests/unit/`, for isolated business logic
  - Execute: `npm run test:unit`
- **Feature tests** (Cucumber/BDD): Located in `./tests/features/`, for end-to-end workflows
  - Execute: `npm run tests:features`
  - Test fixtures in `./tests/integration/support/`
  - These are the preferred format for new integration tests

### Test File Locations & Patterns
- ✅ **DO**: Write new integration tests as Cucumber feature files under `./tests/features/`
- ❌ **DON'T**: Write new tests in `./tests/integration/` (direct Playwright tests)
- **Rationale**: Project is migrating away from direct Playwright toward Cucumber BDD

### Validation Flow
Before writing tests:
1. Get approval on test approach and coverage strategy
2. For each test, get validation before moving to the next one
3. Check in before marking test work complete

---

# Documentation Strategy

This project uses structured documentation to prevent stale guidance and capture decisions. Agents should actively maintain these documents during their work.

## Key Documents

- **ARCHITECTURE_ANALYSIS.md**: "Living" documentation of system design, patterns, infrastructure
- **DECISIONS.md**: Record of significant architectural and implementation decisions (created as-needed)
- **AGENTS.md**: This file — agent workflow, conventions, and guidance

## Agent Approach to Documentation

**At the start of work:**
- Check if ARCHITECTURE_ANALYSIS.md and DECISIONS.md are still aligned with the current request
- If you notice a discrepancy between documented decisions and what you're asked to do, raise it via HumanAgent Chat
- The human may want to override the documented decision, update documentation, or clarify the request

**During work:**
- Monitor for architectural changes, new patterns, or significant decisions
- Note what might need documentation updates

**At the end of work:**
- Near completion, mention via HumanAgent Chat: "I notice the following documentation may need updates: [list]"
- Wait for human approval before making changes
- Update ARCHITECTURE_ANALYSIS.md if architecture/patterns changed
- Create or update DECISIONS.md entries only with human guidance
- Handle document updates as the final step before marking work complete

**Key principle:** Documentation updates should happen in HumanAgent Chat discussion, not autonomously.

---

# Development Commands

```pwsh
npm run dev             # Concurrent build:watch + vite + debug (development)
npm run test:unit       # Jest unit tests
npm run tests:features  # Cucumber feature tests
npm run test            # All tests
npm run build           # Production build
```

**Pattern Research**: Before implementing new features, thoroughly examine existing similar implementations to understand established patterns and conventions.

---

# Key Patterns & Conventions

- **Barrel exports**: Each directory exports key classes in `index.ts`
- **Idempotent IPC**: Handlers can be removed/re-added safely
- **Error handling**: HTTP routes consistently wrap and return errors
- **Security**: Path guards prevent traversal, locale normalization prevents injection
- **Task registry**: Use string constants for task type identifiers

## Localization (i18next)

All user-facing text must be translatable:
- Text exposed in UI should use i18next keys, not hardcoded strings
- LocalizationService manages locale switching and translation loading
- Locale files live in `./assets/locales/{locale}/` as JSON (e.g., `en/common.json`, `dev/common.json`)
- When adding UI text, add corresponding translation keys to the appropriate files
- `dev` text is the English text with underscores (___) affixed to the start and end.

## Security

Security is built into the architecture through multiple defense-in-depth layers. All file operations and user input processing should follow established patterns.

### Key Security Functions (`src/main/security/`)
- **`safeJoin(base, ...segments)`** – Safely joins path segments while preventing path traversal attacks
- **`assertPathInsideAllowedDirs(unsafePath, safeRoot?)`** – Protects against path traversal and arbitrary file writes
- Additional functions for normalization and symlink protection

**Always use these functions for file operations.** Do not construct paths manually.

### Security Patterns in Practice
LocalizationService demonstrates comprehensive security:
- **Input validation** → Normalize and strictly validate all user input (language codes, namespaces)
- **Defense-in-depth** → Combine `safeJoin()` + `assertPathInsideAllowedDirs()` for path operations
- **Injection prevention** → Block prototype pollution keys (`__proto__`, `constructor`, `prototype`)
- **Bounds checking** → Enforce length limits (max key length: 1024, max segments: 100)
- **Mode checks** → Verify environment before allowing sensitive operations (e.g., no writes in production)
- **Race condition protection** → Use per-file write queues for concurrent operations

### When Implementing Features
1. **File operations** → Import `src/main/security` and use `safeJoin()`, `assertNoSymlinkEscape()`
2. **User input** → Validate, normalize, and bounds-check all inputs before use
3. **IPC surface** → Minimize exposure in `preload.ts`, only expose necessary functions
4. **HTTP server** → Relies on localhost-only host validation and rate limiting (100 req/min)

### Suggesting Security Improvements
If you identify security gaps or missing validation patterns:
1. Flag via HumanAgent Chat before implementing
2. Propose additions to `src/main/security/` library for reusable functions
3. Reference CodeQL findings or security best practices in your proposal

See [DECISIONS.md](DECISIONS.md#4--security-first-architecture-with-defense-in-depth) for architectural security decisions.