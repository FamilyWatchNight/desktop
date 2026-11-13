# Family Watch Night Architecture

## Executive Summary

Family Watch Night is a TypeScript-based Electron application with a React renderer. Its renderer API has IPC and HTTP implementations, allowing the UI to use either transport. Authentication and authorization requirements are handled by the relevant main-process services and route adapters.

Tests include Jest unit tests and Cucumber feature specifications. Playwright provides browser and Electron UI automation for feature tests. See [Testing Architecture](#3-testing-architecture) below for details.

---

## 1. Key Services and Their Responsibilities

Services live in `src/main/services/`. Their responsibilities vary; consult the source for current method signatures and authentication requirements.

### **MovieService**

- **Responsibility**: Authenticated movie lookups by ID and external catalog ID, and title search. The service does not currently expose create, update, or delete operations.

### **SettingsService**

- **Responsibility**: Application settings persistence

### **BackgroundTaskService**

- **Responsibility**: Authenticated task enqueueing, state retrieval, cancellation, and queued-task removal through the background task manager. Administrative permission is required.

### **UserService**

- **Responsibility**: User creation, authentication, user details, and profile-related operations. See the service for the current API.

### **RoleService**

- **Responsibility**: Role-based access control (RBAC): create, update, delete roles and manage permission assignments

### **LocalizationService**

- **Responsibility**: Multi-language translation file management
- **Key Details** (security-critical pattern):
  - **File I/O with security validation**: Uses `assertPathInsideAllowedDirs()` to prevent path traversal
  - **Race condition protection**: Implements write-queue per file when saving missing keys
  - **Input validation**: Strictly validates language codes and key namespaces before file operations
- **Security Pattern**: LocalizationService demonstrates the defense-in-depth approach used throughout the codebase

---

## 2. Main Process Architecture

The main process orchestrates the entire application. Key files and their roles:

### **[src/main/index.ts](src/main/index.ts)** - Application Entry Point

```
app.on('ready'):
  1. Initialize i18n with locale (test/dev/app.getLocale())
  2. Initialize database
  3. Initialize settings manager
  4. Create tray icon with context menu
  5. Register IPC handlers
  6. Start localhost HTTP/WebSocket server on configured port
```

- **Tray integration**: Clicking the tray icon opens or focuses the application window; the menu also offers quit.
- **Test mode**: Attaches test hooks to the Electron app and exposes test-only IPC support when `NODE_ENV=test`.

### **[src/main/window-manager.ts](src/main/window-manager.ts)** - Window Lifecycle

- Singleton pattern: reuses existing window if not destroyed
- Creates BrowserWindow with:
  - Context isolation + preload script for security
  - Loads dev URL (`ELECTRON_START_URL` for dev) or built index.html
- Registers the window with the IPC notification adapter, which is used by the event notification manager.

### **[src/main/preload.ts](src/main/preload.ts)** - IPC Surface Definition

Defines a typed preload API via `contextBridge`:

```typescript
window.electron = {
  app: { ... },
  auth: { ... },
  backgroundTasks: { ... },
  movies: { ... },
  settings: { ... },
  users: { ... }
}
```

- **Security model**: contextBridge prevents renderer from accessing full Node.js API
- **Dual mode**: Each method maps to an ipcRenderer.invoke() call
- **Test mode**: When NODE_ENV=test, exposes `window.testApi` for test hooks

### **[src/main/server.ts](src/main/server.ts)** - Express Server Setup

- **Security layers**:
  1. Rate limiting: 100 requests/minute per client
  2. Host validation: only accepts `localhost` or `127.0.0.1`
- **Routes and assets**: Serves the built renderer at `/`, registers JSON API routes, and serves static files from `dist/renderer`. WebSocket notifications share the HTTP server.
- **Binding and port**: Binds to `localhost`; the port is configurable via settings (default 3000).

### **[src/main/database.ts](src/main/database.ts)** - SQLite Management

- **Platform-specific app data paths**:
  - Windows: `%APPDATA%/FamilyWatchNight/sqlite/`
  - macOS: `~/Library/Application Support/FamilyWatchNight/sqlite/`
  - Linux: `~/.config/FamilyWatchNight/sqlite/`
- **Initialization**:
  1. Creates `FamilyWatchNight.db` if not exists
  2. Runs all SQL migration files in order
  3. Instantiates models
- **Testing**: Supports in-memory database for fast test execution
- **Exports**: `initDatabase()`, `initMockDatabase()`, `getModels()`, `closeDatabase()`

### **[src/main/api-server.ts](src/main/api-server.ts)** - Re-export Hub

Barrel file re-exporting HTTP routes, WebSocket setup and broadcasts, IPC window/broadcast helpers, and IPC handler registration.
`server.ts` uses it for HTTP routes and WebSocket setup; `window-manager.ts` uses it to register the window with the IPC notification adapter.

### **[src/main/api-server/ipc/index.ts](src/main/api-server/ipc/index.ts)** - IPC Orchestrator

- Registers handler groups for:
  - `registerAppIpcHandlers()`
  - `registerAuthIpcHandlers()`
  - `registerBackgroundTaskIpcHandlers()`
  - `registerMovieIpcHandlers()`
  - `registerSettingsIpcHandlers()`
  - `registerUserIpcHandlers()`
- **Test mode**: Registers `test:get-db-status` handler when NODE_ENV=test

### **[src/main/api-server/http/index.ts](src/main/api-server/http/index.ts)** - HTTP Orchestrator

```typescript
registerHttpRoutes(app: Express) {
  registerAppRoutes(app)
  registerAuthRoutes(app)
  registerBackgroundTaskRoutes(app)
  registerMovieRoutes(app)
  registerSettingsRoutes(app)
  registerUserRoutes(app)
}
```

Each function adds routes to the Express app using its corresponding HTTP route module.

### **[src/main/background-task-manager.ts](src/main/background-task-manager.ts)** - Task Queue Engine

Manages task lifecycle without using a queue library:

```
State machine:
  • queue: [] (pending tasks)
  • active: null (running)

enqueue() → adds to queue, starts processing if idle
processQueue() → takes first queued task, sets as active
runTask() → executes with TaskContext (progress reporting, cancellation)
  When complete → active = null → processQueue() (runs next queued task)
```

- **Progress reporting**: Tasks call `context.reportProgress({current, max, description})`
- **Cancellation**: Active task can be cancelled, next task starts immediately
- **Notifications**: Calls `notifyFn()` on state changes (observed by window-manager)

---

## 3. Testing Architecture

Feature tests use a **three-layer BDD structure** to separate business-facing scenarios from technical implementation details:

1. **Business Logic Layer** (`tests/bdd/business-logic/`): Cucumber feature files and step definitions.
2. **Business Flow Layer** (`tests/bdd/business-flow/personas/`): Personas that compose actions for feature steps.
3. **Technical Layer** (`tests/bdd/technical/`): Test hooks, Playwright page objects, and infrastructure.

**Key principle**: Business Logic steps must not directly call the Technical layer. All interactions route through personas, which maintain a stable domain-facing API.

### Test Infrastructure Flow

1. **Test Hooks Implementation** (`src/main/testing-active/TestHooksImpl.ts`):
   - Exposes service-level operations for test consumption
   - Instantiates actual services (MovieService, RoleService, etc.) for testing
   - Implements a `TestHooks` interface defining all available test operations

2. **Build Integration**:
   - `npm run build:main:for-integration-testing` copies `src/main/testing-active/` to `src/main/testing/` before compilation
   - This ensures test operations are only available during `NODE_ENV=test`
   - Production builds use `src/main/testing-noop/` stub instead

3. **Technical Hooks Layer** (`tests/bdd/technical/hooks/*.ts`):
   - Classes like `Roles`, `Users`, etc. wrap TestHooks through the `withTestHooks` cross-process utility
   - Adapt synchronous test operations (running in the main process) to async-compatible calls (for step execution in Node.js)
   - Maintain 1:1 correspondence with service functionality

4. **Business Flow Personas** (`tests/bdd/business-flow/personas/internal-system.ts`):
   - Consume the Technical Hooks Layer to provide domain-aligned methods
   - Express test operations using business language (e.g., `assignRoleToUser` instead of raw API calls)
   - Stable contract for step definitions—changes to technical layer don't require step updates

5. **Test State Store** (`tests/bdd/technical/infrastructure/world.ts`):
   - Provides named state stores scoped to the current Cucumber scenario.
   - Supports keyed and latest-value storage for scenario data.
   - Is cleared between scenarios.

### Example: Adding a Role Feature

- **Feature file** (`tests/bdd/business-logic/features/rbac-role-management.feature`): User-facing scenario
- **Step definition** (`tests/bdd/business-logic/steps/rbac-common.steps.ts`): Calls `getSystemPersona(world).createRole()`
- **Persona** (`tests/bdd/business-flow/personas/internal-system.ts`): Implements `createRole()` → delegates to `world.rolesApi.createRole()`
- **Technical Hooks Layer** (`tests/bdd/technical/hooks/roles.ts`): Calls `withTestHooks()` to invoke the test hook
- **Test hook** (`src/main/testing-active/TestHooksImpl.ts`): Executes the actual `roleService.create()`

Feature files are the specification layer; Playwright is used where browser or Electron UI automation is needed. The test scripts build the app with test hooks before running Cucumber. Unit tests live separately in `tests/unit/` and run with Jest. See [`docs/agents/testing.md`](docs/agents/testing.md) and [`tests/bdd/README.md`](tests/bdd/README.md) for executable guidance.

This layering ensures that:

- Personas provide a stable API for step definitions
- Technical implementation changes don't break step definitions
- State is centralized and scenario-scoped
- Business and technical concerns remain separate

---

## 4. Renderer Process Structure

The renderer is a React SPA that communicates with services via the dual API layer.

### **[App.tsx](src/renderer/App.tsx)** - Root Component

```typescript
export default function App(): React.ReactElement {
  return (
    <AuthProvider>
      <PageRegistryProvider>
        <NavigationProvider>
          <AppLayout />
        </NavigationProvider>
      </PageRegistryProvider>
    </AuthProvider>
  );
}
```

The root component provides authentication, page registry, and navigation contexts.

### **[AppLayout.tsx](src/renderer/components/AppLayout.tsx)** - Main Layout Container

- **API Client**: `createApiClient()` factory instantiates IPC or HTTP client
- **State**:
  - `currentPage`: selected page from the navigation context
  - `activeTask`, `queue`: background task state
  - `menuOpen`: navigation menu state
- **Lifecycle**:
  1. Checks whether users exist and fetches initial background-task state.
  2. Subscribes to background-task updates through the selected API client.
- **Pages**: Home, Profile, Settings, Styleboard, and Background Tasks, plus registered test pages when enabled.

### Renderer UI and Navigation

The renderer initializes Norigin Spatial Navigation and wraps its focus behavior with `NavigationProvider` and `useNavigationFocusable`. The current interaction model supports mouse and keyboard navigation: Tab follows DOM focus order, while Norigin handles arrow-key spatial movement. Registered controls with activation callbacks respond to Enter/Space in arrow-navigation mode. `AppLayout` separates the menu and page content into focus contexts and makes inactive regions inert.

`SlideOverPanel` is the reusable side-panel primitive. Its caller controls open state, side, width, optional initial focus, and whether it requests blocking of page content. `AppLayout` provides a shared content-blocking coordinator that applies `inert` to `.main-content` while one or more active components request blocking; the header remains outside that boundary. This is intentionally distinct from the existing whole-window `Modal` behavior. The navigation menu uses this panel with its legacy 290px width.

The Electron window starts at 1200×800, while the same renderer is served for local browser use. Desktop/laptop layouts are the current product target. Remote/gamepad support is a future goal, and WCAG 2.2 AA is the intended accessibility target; neither remote/gamepad support nor current WCAG conformance is claimed. See [`docs/agents/ui-ux.md`](docs/agents/ui-ux.md) for renderer patterns, constraints, and questions to raise during UI work.

### UI Automation Selectors

- The renderer should assign stable `data-testid` attributes to all actionable and focusable UI controls.
- Use `data-testid` for controls such as buttons, menu items, links, inputs, tabs, and dialog actions.
- Add page root identifiers for page validation, for example `data-testid="page-home"` and `data-testid="page-settings"`.
- Prefer semantic, translation-independent values over visible text or i18n keys.
- This pattern is part of regular UI development and enables Playwright page objects and test automation to remain stable across locales.

### **[api-client/index.ts](src/renderer/api-client/index.ts)** - Transport Selection

`createApiClient()` selects the preload-exposed API in Electron and the HTTP adapter in a browser.

**This is the key architectural pattern**: Same interface, two backends. Enables:

- Electron app's window communicates via IPC
- A browser running on the local machine can use the localhost HTTP server

### **[api-client/http/index.ts](src/renderer/api-client/http/index.ts)** - HTTP Adapter

Implements `ApiClient` interface using `fetch()` to make HTTP calls:

`HttpApiClient` implements `ApiClient` with HTTP-backed `app`, `auth`, `backgroundTasks`, `movies`, `settings`, and `users` clients.

### **[api-client/types.ts](src/renderer/api-client/types.ts)** - API Contract

Defines TypeScript interface that both IPC and HTTP implementations must satisfy:

```typescript
interface ApiClient {
  app: AppApi;
  auth: AuthApi;
  backgroundTasks: BackgroundTaskApi;
  movies: MovieApi;
  settings: SettingsApi;
  users: UserApi;
}
```

Forces consistency between both adapters.

### **Other Components**

- **HomePage.tsx** - Movie search and catalog view
- **ProfilePage.tsx** - Current user's profile
- **SettingsPage.tsx** - Application settings UI
- **StyleboardPage.tsx** - Styleboard UI
- **BackgroundTasksPage.tsx** - Task queue visualization

---

## 5. Database

### **Storage Location**

Platform-specific standard locations stored by `database.ts`:

- Windows: `%APPDATA%\FamilyWatchNight\sqlite\FamilyWatchNight.db`
- macOS: `~/Library/Application Support/FamilyWatchNight/sqlite/FamilyWatchNight.db`
- Linux: `~/.config/FamilyWatchNight/sqlite/FamilyWatchNight.db`

### **Migrations** (`src/main/db/migrations/`)

- Run sequentially at startup via `runMigrations()` in database.ts
- Each migration is read as raw SQL and executed with `db.exec(sql)`
- Migrations are idempotent (use CREATE TABLE IF NOT EXISTS)

### **Models** (`src/main/db/models/`)

**Pattern**: One TypeScript class per table, encapsulating all SQL operations using prepared statements. All models follow consistent patterns:

- **Performance**: Pre-compiled prepared statements with `?` placeholders
- **Type conversion**: SQLite stores numbers and booleans; models convert to/from TypeScript types
- **Query methods**: `create()`, `getById()`, `getAll()`, `update()`, `delete()` with table-specific queries as needed

**Current models**:

- **Users**: User accounts and authentication state
- **UserProfiles**: Extended user data (display name, profile image)
- **Movies**: Movie catalog with TMDB/Watchmode IDs
- **Roles**: Role definitions (system roles like "admin" + custom roles)
- **RolePermissions**: Role-to-permission assignments
- **UserRoles**: Junction table mapping users to assigned roles

See `src/main/db/models/` for full implementations.

### **Testing Database**

In-memory SQLite (`Database(':memory:')`) enables fast test execution without file I/O. Tests call `initMockDatabase()` to get a fresh database with all migrations applied and models instantiated.

## 6. API Server Pattern - Unified Service Exposure

The architecture reflects a core principle: **Business logic lives in services, exposure is decoupled.**

### **Parallel Architecture**

```
Services (Business Logic)
    ↑
    ├─→ HTTP Routes (Express) ──→ HTTP Clients (Fetch)
    │
    └─→ IPC Handlers (Electron) ──→ IPC Client (contextBridge)
```

### **HTTP Route Pattern** (`api-server/http/*.ts`)

The movie routes currently expose lookups by database ID, Watchmode ID, and TMDB ID, plus title search. See [`src/main/api-server/http/movies.ts`](src/main/api-server/http/movies.ts). The shared `route()` helper wraps handler results in a `{ success, data }` envelope and catches errors into `{ success: false, error }`.

**Current integration discrepancy**: `MovieService` requires an `AuthContext`, but the current HTTP and IPC movie handlers call it without one. The preload and renderer API types also still declare movie create, get-all, update, and delete methods that are absent from `MovieService` and the registered handlers. The app code was not changed as part of this documentation update.

### **IPC Handler Pattern** (`api-server/ipc/*.ts`)

The IPC movie handlers expose the same lookup operations through `ipcMain.handle()`. See [`src/main/api-server/ipc/movies.ts`](src/main/api-server/ipc/movies.ts).

**Parallel structure**: HTTP and IPC provide separate adapters for the renderer API. The exact method sets and response shapes are defined by the current adapters and API-client types.

### **Service Instance Management**

Some IPC handlers share service instances from `api-server/ipc/instances.ts`; HTTP route modules instantiate their own services.

### **Why This Pattern?**

1. **Transport separation**: Renderer components use an API client rather than calling IPC or HTTP directly.
2. **Parallel adapters**: The Electron preload API and HTTP API expose operations to the same renderer.
3. **Focused testing**: Cucumber features can exercise service hooks and UI flows through the test harness.

---

### API Callbacks using Event Notification Manager

The current notification manager forwards background-task state changes across IPC and HTTP/WebSocket transports. It is not a general registration framework for arbitrary services.

#### **Roles and Responsibilities**

- **Event source**
  - `background-task-manager` exposes `setNotifyFn(fn)` and invokes the callback when task state changes.

- **Event notification manager**
  - `src/main/event-notification-manager.ts` registers a callback with `background-task-manager`.
  - The callback forwards `background-task-update` events through the IPC and HTTP notification broadcasters.

- **Transports**
  - **IPC transport** (`api-server/ipc/notifications.ts`) implements `broadcast(eventType, data)` to send IPC messages to renderer windows.
  - **HTTP/WebSocket transport** (`api-server/http/notifications.ts`) implements `broadcast(eventType, data)` to send updates over WebSockets to connected clients.

#### **Sample Event Flow**

1. `background-task-manager` emits an update via the callback supplied by the event notification manager.
2. `event-notification-manager` forwards the state with `broadcastIpc()` and `broadcastHttp()`.
3. Renderer clients receive updates via chosen transport.

---

## 7. Build and Development Setup

### **Package.json Scripts**

| Script                   | Purpose                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `npm run dev`            | **Main dev command** - runs 3 processes in parallel (build watch, vite, electron debug) |
| `npm run build:main`     | Compiles TypeScript, generates app-info.json, copies migrations                         |
| `npm run build:renderer` | Vite build for React + CSS                                                              |
| `npm run test:unit`      | Jest unit tests                                                                         |
| `npm run test:smoke`     | Cucumber smoke profile                                                                  |
| `npm run test:component` | Cucumber component profile                                                              |
| `npm run test:features`  | Full Cucumber feature suite                                                             |
| `npm run build`          | Production: clean + build main + build renderer + package with electron-builder         |

### **Key Dependencies**

| Category      | Package                              | Usage                   |
| ------------- | ------------------------------------ | ----------------------- |
| **Framework** | electron                             | Desktop runtime         |
| **Server**    | express 5.x                          | HTTP API                |
| **Database**  | better-sqlite3                       | Embedded SQLite         |
| **Renderer**  | react 19.x, react-i18next            | UI framework + i18n     |
| **i18n**      | i18next, i18next-fs-backend          | Localization            |
| **Testing**   | jest, playwright, @cucumber/cucumber | Testing frameworks      |
| **Build**     | vite, electron-builder, typescript   | Compilation + packaging |

### **Build Modes**

#### **Production Build** (`npm run build`)

```
1. Clean dist/
2. Build main (uses testing-noop stubs)
3. Build renderer with vite
4. Package with electron-builder
```

#### **Feature-Test Build**

```
npm run build:main:for-integration-testing
```

Uses `testing-active` implementations instead of no-op stubs, enabling test hooks access.

#### **Development Mode** (`npm run dev`)

```
concurrently:
  • npm run build:main:watch - TypeScript watch mode
  • npm run renderer:vite - Vite dev server (hot reload on port 5173)
  • npm run electron:debug - Launch Electron pointing to http://localhost:5173
    with V8 debugger on port 5858 and Chrome DevTools on 9222
```

### **Development Workflow**

1. Run `npm run dev`
2. **Vite hot reload**: Edit React components → browser auto-refreshes
3. **Main process reload**: electron-reloader watches src/main → restarts Electron
4. **Debugger**: Can attach Node.js debugger to port 5858

### **Testing Workflow**

```bash
# Unit tests (no build required)
npm run test:unit

# Smoke tests (basic health checks)
npm run test:smoke

# Component profile
npm run test:component

# All Cucumber tests
npm run test:features

# Unit and feature tests
npm run test
```

---

## 8. Common Patterns and Conventions

### **Pattern: Service-First Architecture**

- Main-process services centralize domain and application operations.
- HTTP routes and IPC handlers adapt those operations to their transports.
- Some concerns, such as task queueing, are implemented in modules outside the service directory.

### **Pattern: Prepared Statements with Type Conversion**

```typescript
run(watchmode_id, tmdb_id, ..., has_video) {
  const result = stmt.run(watchmode_id, tmdb_id, ..., has_video ? 1 : 0)
  return result.lastInsertRowid as number
}
```

SQLite stores booleans as 0/1; model converts to/from boolean.

### **Pattern: Barrel Exports**

Each module directory has `index.ts` re-exporting key classes:

```typescript
// src/main/services/index.ts
export { MovieService } from './MovieService';
export { SettingsService } from './SettingsService';
// ...
```

Enables clean imports: `import { MovieService } from './services'`

### **Pattern: Task Registry**

```typescript
// src/main/tasks/task-registry.ts
const TASK_REGISTRY = {
  'import-tmdb': ImportTmdbTask,
  'import-watchmode': ImportWatchmodeTask,
} as const;

type TaskRegistryType = keyof typeof TASK_REGISTRY;
```

Provides type-safe task enqueueing: `enqueue('import-tmdb', args)`

### **Pattern: Test Hooks via Electron**

```typescript
// In test:
const appWithTestHooks = app as typeof app & { testHooks?: TestHooks };
appWithTestHooks.testHooks.db.initMockDatabase();

// In main process:
if (process.env.NODE_ENV === 'test') {
  appWithTestHooks.testHooks = getTestHooks();
}
```

Allows test context to access main process state directly.

### **Pattern: Security Validation**

```typescript
export function assertPathInsideAllowedDirs(unsafePath: string, safeRoot?: string): string {
  // Validates path doesn't escape allowed root
  // Handles symlink attacks
  // Throws if invalid
}
```

Used by LocalizationService and other file operations.

### **Pattern: Locale Normalization**

```typescript
function normalizeLanguage(language: string): string {
  // Validate: alphabetic language codes only
  // Reject malformed regions
  // Return normalized 'll' or 'll-RR' format
}
```

Security: Prevents injection attacks in locale strings.

---

## 9. Test Layout and Commands

- Jest unit tests live in `tests/unit/` and run with `npm run test:unit`.
- Cucumber features live in `tests/bdd/business-logic/features/`; steps, personas, and technical helpers are in sibling `business-logic/`, `business-flow/`, and `technical/` directories.
- Cucumber is the feature specification and orchestration layer. Playwright remains the UI automation library for browser and Electron scenarios.
- Feature commands build the application with test hooks before running Cucumber: `npm run test:features` runs the full feature suite, while `npm run test:smoke` and `npm run test:component` select profiles. Browser and Electron variants are available as `npm run test:features:browser` and `npm run test:features:electron`.
- The Cucumber world maintains scenario-scoped state; hooks reset that state and isolate app data between scenarios.

See [`docs/agents/testing.md`](docs/agents/testing.md) for test responsibilities, locations, and invocation details.

---

## Architecture Strengths

1. **Transport separation**: Renderer components use an API client instead of directly depending on IPC or HTTP.
2. **Testability**: Unit and feature tests exercise service operations and UI flows through separate harnesses.
3. **Local browser support**: A browser on the same machine can use the localhost HTTP API.
4. **Security**: Context isolation, path validation, rate limiting, localhost-only
5. **Performance**: Prepared statements, in-memory DB for tests, no ORMs
6. **Type safety**: Full TypeScript, pre-compiled queries
7. **Internationalization**: i18next-based localization and locale resources

---

## Areas for Future Enhancement

1. **Error Types**: Consider typed error responses instead of generic messages
2. **API Documentation**: OpenAPI spec generation from Express routes
3. **Database Versioning**: Add explicit schema version tracking
4. **Caching**: Add service-level caching for frequently accessed data
5. **Logging**: Structured logging (pino/winston) instead of console.log
6. **Process Management**: Currently single active task; could support task priorities or parallel execution

---

## Quick Reference: Common Operations

### Adding a New Feature

1. **Create service**: `src/main/services/NewFeatureService.ts`
2. **Add HTTP route**: `src/main/api-server/http/new-feature.ts`
3. **Add IPC handler**: `src/main/api-server/ipc/new-feature.ts`
4. **Add renderer client**: `src/renderer/api-client/http/new-feature.ts`
5. **Use in component**: `const result = await apiClient.newFeature.doThing()`

### Adding Database Migration

1. Create `src/main/db/migrations/NNN_description.sql`
2. Database initialization will run it automatically
3. Queries through `db.getModels().tableName.method()`

### Running Unit and Feature Tests

```bash
npm run test         # Runs unit tests followed by the Cucumber feature suite
```

### Debugging

- **Main process**: V8 debugger on port 5858
- **Renderer**: Chrome DevTools on port 9222 or F12 in window
- **IPC calls**: Add console.log in preload.ts or registerIpcHandlers
