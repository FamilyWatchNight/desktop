# Family Watch Night - Comprehensive Architecture Analysis

## Executive Summary

Family Watch Night is a TypeScript-based Electron desktop application with a sophisticated dual-mode API architecture. The main distinctive feature is that core business logic is completely decoupled from the IPC/HTTP exposure layer—services are business-logic containers that know nothing about Electron or web communication, which are instead exposed through parallel HTTP and IPC adapters. This allows the same logic to be tested and used via multiple channels.

---

## 1. Key Services and Their Responsibilities

Located in `src/main/services/`, services are stateless, framework-agnostic classes that encapsulate core business logic:

### **MovieService**
- **Responsibility**: Manage movie CRUD operations
- **Key Methods**:
  - `create(movieData)` → inserts and returns ID
  - `getById(id)`, `getByWatchmodeId()`, `getByTmdbId()` → queries
  - `getAll()` → returns all movies sorted by normalized title
  - `update(id, movieData)`, `delete(id)` → mutations
  - `searchByTitle(searchTerm)` → full-text search using LIKE queries
- **Pattern**: Delegates to database models (`db.getModels().movies.*`)
- **No coupling**: Does not call IPC or HTTP, just accesses database layer

### **SettingsService**
- **Responsibility**: Manage application settings persistence
- **Key Methods**:
  - `get(key)`, `set(key, value)` → individual setting operations
  - `load()` → returns all settings as object
  - `save(settings)` → batch update all settings
- **Pattern**: Wraps `SettingsManager` (electron-store wrapper)
- **Use case**: Web port, locale preferences, UI state

### **BackgroundTaskService**
- **Responsibility**: Coordinate long-running asynchronous tasks
- **Key Methods**:
  - `enqueue(taskType, args)` → adds task to queue, returns taskId or error
  - `getState()` → returns `{active, queue}` current state
  - `cancelActive()`, `removeQueued(taskId)` → task lifecycle management
  - `setNotifyFn(fn)` → subscribe to state changes (called on progress updates)
- **Pattern**: Delegates to `background-task-manager` module
- **Integration**: Used by import tasks (TMDB, Watchmode data)

### **LocalizationService**
- **Responsibility**: Multi-language translation file management
- **Key Methods**:
  - `getLocaleFile(namespace, language)` → reads JSON locale file
  - `saveMissingKey(namespace, language, key, value)` → records missing translations (dev mode only)
- **Pattern**: File I/O with security validation (prevents path traversal)
- **Security**: Uses `assertPathInsideAllowedDirs()` to validate all file paths
- **Interesting detail**: Implements write-queue per file to prevent race conditions

---

## 2. Main Process Architecture

The main process orchestrates the entire application. Key files and their roles:

### **[index.ts](index.ts)** - Application Entry Point
```
app.on('ready'):
  1. Initialize i18n with locale (test/dev/app.getLocale())
  2. Initialize database
  3. Initialize settings manager
  4. Create tray icon with context menu
  5. Create app window
  6. Register IPC handlers
  7. Start HTTP server on configured port
```
- **Tray integration**: Double-click/click to focus window, quit option
- **Test mode**: Sets `app.testHooks` for integration testing when NODE_ENV=test

### **[window-manager.ts](window-manager.ts)** - Window Lifecycle
- Singleton pattern: reuses existing window if not destroyed
- Creates BrowserWindow with:
  - Context isolation + preload script for security
  - Loads dev URL (`ELECTRON_START_URL` for dev) or built index.html
- Hooks into `background-task-manager` to notify window of task updates
- Sends updates via `mainWindow.webContents.send('background-task-update', ...)`

### **[preload.ts](preload.ts)** - IPC Surface Definition
Defines and exposes all available IPC channels via `contextBridge`:
```typescript
window.electron = {
  app: { getAppVersion, getAppLocale, getServerPort, ... },
  backgroundTasks: { enqueueBackgroundTask, getBackgroundTasks, ... },
  movies: { create, getById, getAll, ... },
  settings: { loadSettings, saveSettings, ... }
}
```
- **Security model**: contextBridge prevents renderer from accessing full Node.js API
- **Dual mode**: Each method maps to an ipcRenderer.invoke() call
- **Test mode**: When NODE_ENV=test, exposes `window.testApi` for test hooks

### **[server.ts](server.ts)** - Express Server Setup
- **Security layers**:
  1. Rate limiting: 100 requests/minute per client
  2. Host validation: only accepts localhost or 127.0.0.1 (prevents DNS rebind attacks)
- **Routes**:
  - `/api/*` - service endpoints
  - `/dist/*` - built renderer assets
  - `/*` - static files from assets/
  - Default handler - serves index.html (SPA routing)
- **Port**: Configurable via settings (default 3000)

### **[database.ts](database.ts)** - SQLite Management
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

### **[api-server.ts](api-server.ts)** - Re-export Hub
Simple barrel file re-exporting HTTP and IPC handler registration functions:
```typescript
export { registerHttpRoutes, registerAppRoutes, registerIpcHandlers }
```
Used by `index.ts` to cleanly register all handlers.

### **[api-server/ipc/index.ts](api-server/ipc/index.ts)** - IPC Orchestrator
- Removes all handlers before re-registering (idempotent, safe for reloads)
- Imports and chains handler registration:
  - `registerAppIpcHandlers()`
  - `registerBackgroundTaskIpcHandlers()`
  - `registerMovieIpcHandlers()`
  - `registerSettingsIpcHandlers()`
- **Test mode**: Registers `test:get-db-status` handler when NODE_ENV=test

### **[api-server/http/index.ts](api-server/http/index.ts)** - HTTP Orchestrator
```typescript
registerHttpRoutes(app: Express) {
  registerAppRoutes(app)
  registerBackgroundTaskRoutes(app)
  registerMovieRoutes(app)
  registerSettingsRoutes(app)
}
```
Each function adds routes to the Express app using the centralized service instances.

### **[background-task-manager.ts](background-task-manager.ts)** - Task Queue Engine
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

### **[ipc-handlers.ts](ipc-handlers.ts)** - LEGACY
This file is being refactored into modular handlers. Currently contains duplicated Movie/Settings/BackgroundTask handlers that should migrate to `api-server/ipc/` structure.

---

## 3. Renderer Process Structure

The renderer is a React SPA that communicates with services via the dual API layer.

### **[App.tsx](src/renderer/App.tsx)** - Root Component
```typescript
export default function App() {
  return <AppLayout />
}
```
Simple render of main layout component.

### **[AppLayout.tsx](src/renderer/components/AppLayout.tsx)** - Main Layout Container
- **API Client**: `createApiClient()` factory instantiates IPC or HTTP client
- **State**:
  - `currentPage`: home, settings, background-tasks
  - `activeTask`, `queue`: background task state
  - `menuOpen`: hamburger menu state
- **Lifecycle**: 
  1. On mount: fetches initial background task state via `apiClient.backgroundTasks.getBackgroundTasks()`
  2. Subscribes to updates via `apiClient.backgroundTasks.onBackgroundTaskUpdate(callback)`
- **Pages**: HomePage, SettingsPage, BackgroundTasksPage (imported conditionally)

### **[api-client/index.ts](src/renderer/api-client/index.ts)** - Transport Selection
```typescript
function createApiClient(): ApiClient {
  if (typeof window !== 'undefined' && (window as any).electron) {
    return (window as any).electron  // IPC mode: use preload-exposed API
  }
  return createHttpApiClient()  // HTTP mode: direct REST calls
}
```
**This is the key architectural pattern**: Same interface, two backends. Enables:
- Testing via HTTP while Electron is building
- Browser-based testing without Electron
- Graceful fallback if IPC not available

### **[api-client/http/index.ts](src/renderer/api-client/http/index.ts)** - HTTP Adapter
Implements `ApiClient` interface using `fetch()` to make HTTP calls:
```typescript
export function createHttpApiClient(): ApiClient {
  return {
    app: new HttpAppApi(),
    backgroundTasks: new HttpBackgroundTaskApi(),
    movies: new HttpMovieApi(),
    settings: new HttpSettingsApi()
  }
}
```
Each class contains methods like `getAll()` that `fetch('/api/movies')`.

### **[api-client/types.ts](src/renderer/api-client/types.ts)** - API Contract
Defines TypeScript interface that both IPC and HTTP implementations must satisfy:
```typescript
interface ApiClient {
  app: AppApi
  backgroundTasks: BackgroundTasksApi
  movies: MoviesApi
  settings: SettingsApi
}
```
Forces consistency between both adapters.

### **Other Components**
- **HomePage.tsx** - Movie list/search, likely imports tasks
- **SettingsPage.tsx** - Application settings UI
- **BackgroundTasksPage.tsx** - Task queue visualization

---

## 4. Database Setup

### **Storage Location**
Platform-specific standard locations stored by `database.ts`:
- Windows: `%APPDATA%\FamilyWatchNight\sqlite\FamilyWatchNight.db`
- macOS: `~/Library/Application Support/FamilyWatchNight/sqlite/FamilyWatchNight.db`
- Linux: `~/.config/FamilyWatchNight/sqlite/FamilyWatchNight.db`

### **Migrations** (`src/main/db/migrations/`)
- **001_create_movies_table.sql** - Initial schema
- Run sequentially at startup via `runMigrations()` in database.ts
- Each migration is read as raw SQL and executed with `db.exec(sql)`
- Migrations are idempotent (use CREATE TABLE IF NOT EXISTS)

### **Models** (`src/main/db/models/`)
Pattern: One TypeScript class per table, encapsulating all SQL operations.

#### **MoviesModel**
```typescript
interface Movie {
  id: number
  watchmode_id: string | null
  tmdb_id: string | null
  original_title: string | null
  normalized_title: string | null  // Stored normalized for searching
  year: string | null
  popularity: number | null
  has_video: boolean
}

class MoviesModel {
  private insertStmt, getByIdStmt, updateStmt, deleteStmt, searchByTitleStmt
  
  constructor(db: Database) {
    this.initStatements()  // Pre-compiles all prepared statements
  }
  
  create(movieData: MovieData): number
  getById(id: number): Movie | null
  getByWatchmodeId(watchmodeId: string): Movie | null
  getByTmdbId(tmdbId: string): Movie | null
  getAll(): Movie[]
  update(id: number, movieData: MovieData): boolean
  delete(id: number): boolean
  searchByTitle(searchTerm: string): Movie[]  // Uses LIKE + normalized_title
}
```

**Key design decisions**:
- **Prepared statements**: All queries use `?` placeholders and `.prepare()` for performance
- **Type conversion**: `boolean` stored as 0/1 in SQLite, converted to boolean in `create()/getById()`
- **Normalization**: `normalized_title` uses diacritics removal for case-insensitive searching
- **No ORM**: Direct SQL via better-sqlite3 for performance and control

### **Testing Database**
```typescript
initMockDatabase(testDb?: Database | null) {
  if (!testDb) {
    db = new Database(':memory:')  // In-memory SQLite
  } else {
    db = testDb
  }
  runMigrations()  // Runs against in-memory DB
  initModels()
}
```
Enables fast test execution without file I/O.

---

## 5. API Server Pattern - Unified Service Exposure

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

Example from [movies.ts](src/main/api-server/http/movies.ts):
```typescript
const movieService = new MovieService()

export function registerMovieRoutes(app: Express) {
  app.post('/api/movies', route((req) => movieService.create(req.body)))
  app.get('/api/movies/:id', route((req) => movieService.getById(Number(req.params.id))))
  app.get('/api/movies', route((req) => 
    req.query.searchTerm 
      ? movieService.searchByTitle(String(req.query.searchTerm))
      : movieService.getAll()
  ))
  app.put('/api/movies/:id', route((req) => ({
    success: movieService.update(Number(req.params.id), req.body)
  })))
  app.delete('/api/movies/:id', route((req) => ({
    success: movieService.delete(Number(req.params.id))
  })))
}
```

The `route()` wrapper:
```typescript
function route(handler: (req: Request) => any) {
  return async (req: Request, res: Response) => {
    try {
      const result = await handler(req)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: (error as Error).message })
    }
  }
}
```
Provides consistent error handling across all routes.

### **IPC Handler Pattern** (`api-server/ipc/*.ts`)

Example from [movies.ts](src/main/api-server/ipc/movies.ts):
```typescript
const movieService = new MovieService()

export function registerMovieIpcHandlers() {
  ipcMain.handle('movies-create', (_event, movieData) => movieService.create(movieData))
  ipcMain.handle('movies-get-by-id', (_event, id) => movieService.getById(id))
  ipcMain.handle('movies-get-all', () => movieService.getAll())
  ipcMain.handle('movies-search-by-title', (_event, searchTerm) => 
    movieService.searchByTitle(searchTerm)
  )
  ipcMain.handle('movies-update', (_event, id, movieData) => ({
    success: movieService.update(id, movieData)
  }))
  ipcMain.handle('movies-delete', (_event, id) => ({
    success: movieService.delete(id)
  }))
}
```

**Parallel structure**: Same service calls, same response shapes, different transport.

### **Service Instance Management**

Each API adapter file creates its own service instance:
```typescript
// api-server/http/movies.ts
const movieService = new MovieService()

// api-server/ipc/movies.ts  
const movieService = new MovieService()
```

These can be extracted to shared `instances.ts` for single-instance pattern (currently some files use this approach).

### **Why This Pattern?**

1. **Services are testable**: Mock database, inject dependencies
2. **Dual-mode testing**: Test via HTTP without Electron, then via IPC with Electron
3. **Clean separation**: Services don't know about HTTP/IPC mechanics
4. **Port flexibility**: Can be run as standalone server, or headless daemon
5. **Framework-agnostic**: Services work with any UI framework

---

## 6. Build and Development Setup

### **Package.json Scripts**

| Script | Purpose |
|--------|---------|
| `npm run dev` | **Main dev command** - runs 3 processes in parallel (build watch, vite, electron debug) |
| `npm run build:main` | Compiles TypeScript, generates app-info.json, copies migrations |
| `npm run build:renderer` | Vite build for React + CSS |
| `npm run test:unit` | Jest unit tests |
| `npm run test:integration` | Playwright tests (requires build for integration testing) |
| `npm run test:features` | Cucumber BDD tests |
| `npm run build` | Production: clean + build main + build renderer + package with electron-builder |

### **Key Dependencies**

| Category | Package | Usage |
|----------|---------|-------|
| **Framework** | electron 41.x | Desktop runtime |
| **Server** | express 5.x | HTTP API |
| **Database** | better-sqlite3 12.x | Embedded SQLite |
| **Renderer** | react 19.x, react-i18next | UI framework + i18n |
| **i18n** | i18next, i18next-fs-backend | Multi-language support |
| **Testing** | jest, playwright, @cucumber/cucumber | Testing frameworks |
| **Build** | vite, electron-builder, typescript | Compilation + packaging |

### **Build Modes**

#### **Production Build** (`npm run build`)
```
1. Clean dist/
2. Build main (uses testing-noop stubs)
3. Build renderer with vite
4. Package with electron-builder
```

#### **Integration Testing Build**
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

# Integration tests (Playwright + full Electron app)
npm run test:integration

# Feature tests (Cucumber + test fixtures)
npm run test:features

# All tests
npm run test
```

---

## 7. Common Patterns and Conventions

### **Pattern: Service-First Architecture**
- All business logic lives in `src/main/services/`
- Services are stateless, framework-agnostic
- IPC/HTTP are thin adapters over services
- **Benefit**: Easy to test, refactor, or change transports

### **Pattern: Idempotent IPC Handler Registration**
```typescript
export function registerIpcHandlers() {
  // Remove all old handlers first
  channels.forEach(ch => {
    try { ipcMain.removeHandler(ch) } catch { }
  })
  
  // Guard against initializing twice
  if (handlersRegistered) return
  handlersRegistered = true
  
  // Register new handlers
  registerAppIpcHandlers()
  // ...
}
```
Allows hot-reload and multiple calls safely.

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
export { MovieService } from './MovieService'
export { SettingsService } from './SettingsService'
// ...
```
Enables clean imports: `import { MovieService } from './services'`

### **Pattern: Error Wrapping in HTTP**
```typescript
app.post('/api/movies', route((req) => movieService.create(req.body)))

// route() wrapper:
async (req, res) => {
  try {
    const result = await handler(req)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}
```
All HTTP errors are caught and formatted consistently.

### **Pattern: Task Registry**
```typescript
// src/main/tasks/task-registry.ts
const TASK_REGISTRY = {
  'import-tmdb': ImportTmdbTask,
  'import-watchmode': ImportWatchmodeTask,
} as const

type TaskRegistryType = keyof typeof TASK_REGISTRY
```
Provides type-safe task enqueueing: `enqueue('import-tmdb', args)`

### **Pattern: Test Hooks via Electron**
```typescript
// In test:
const appWithTestHooks = app as typeof app & { testHooks?: TestHooks }
appWithTestHooks.testHooks.db.initMockDatabase()

// In main process:
if (process.env.NODE_ENV === 'test') {
  appWithTestHooks.testHooks = getTestHooks()
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

## 8. Testing Patterns

### **Unit Tests** (`tests/unit/`)
- Framework: Jest
- Focus: Pure logic without Electron
- Example: [movie.normalizeTitle.test.ts](tests/unit/movie.normalizeTitle.test.ts)
```typescript
describe('title normalization', () => {
  test('removes diacritics', () => {
    const result = movies.normalizeTitle('Amélie')
    expect(result).toBe('Amelie')
  })
})
```

### **Integration Tests** (`tests/integration/`)
- Framework: Playwright
- Focus: Full Electron app lifecycle
- Example: [launch.test.ts](tests/integration/launch.test.ts)
```typescript
test('Electron app launches', async () => {
  const app = await electron.launch({ args: ['.'] })
  const window = await app.firstWindow()
  await app.close()
})
```
Tests without relying on IPC, uses subprocess interaction.

### **Feature Tests** (`tests/features/`)
- Framework: Cucumber + Playwright
- Focus: Business scenarios in natural language
- Example: [import-movies.feature](tests/features/import-movies.feature)
```gherkin
Scenario: Movies in both databases are properly merged
  Given the application is running with a test database
  And stub Watchmode data is loaded from [CSV]
  And stub TMDB data is loaded from [JSON]
  Then I should see 23 movies in the database
```

### **Test Infrastructure**

#### **Test Mode Activation**
```bash
# Build for integration testing
npm run build:main:for-integration-testing
# Sets NODE_ENV=test, loads testing-active stubs

# Run tests with NODE_ENV set
NODE_ENV=test npm run test:features
```

#### **Test Database**
```typescript
// In test setup
const Database = require('../infrastructure/db')
await db.initMockDatabase()  // In-memory SQLite
```

#### **Test Fixtures**
- [test-double-data/](tests/test-double-data/) - Stub CSV/JSON data
- [domains/db.ts](tests/features/domains/db.ts) - Data setup helpers
- [domains/movies.ts](tests/features/domains/movies.ts) - Movie test helpers

#### **World Context** (Cucumber)
```typescript
// tests/features/infrastructure/world.ts
export class CustomWorld extends World {
  public app!: ElectronApplication
  public page!: Page
  public database!: Database
  // ... shared test context
}
```
Provides shared fixture state across step definitions.

### **Test Mocking Strategy**

1. **Database**: Use in-memory SQLite, pre-populated with test data
2. **Background Tasks**: Mock TaskContext provided by test harness
3. **IPC Events**: Playwright waits for IPC messages sent by main process
4. **HTTP**: Can test HTTP layer independently without Electron (faster)
5. **File I/O**: Uses real temp directory for LocalizationService tests

### **Common Patterns**

| Pattern | Purpose |
|---------|---------|
| `withTestHooks(app, fn)` | Run code with access to main process internals |
| Stub CSV/JSON | Pre-load test database with realistic data |
| Scenario tagging | @import @tmdb @missing-data for test organization |
| Wait for condition | Playwright: `page.waitForFunction()` for async state |

---

## Architecture Strengths

1. **Clean separation of concerns**: Services don't know about transport layer
2. **Testability**: Services tested independently, then with IPC, then with HTTP
3. **Flexibility**: Can run as desktop app, web app, or headless service
4. **Security**: Context isolation, path validation, rate limiting, localhost-only
5. **Maintainability**: Parallel HTTP/IPC patterns make it clear what's exposed
6. **Performance**: Prepared statements, in-memory DB for tests, no ORMs
7. **Type safety**: Full TypeScript, pre-compiled queries
8. **Internationalization**: Multi-language support with fallback handling

---

## Areas for Future Enhancement

1. **IPC Legacy Handler**: `src/main/ipc-handlers.ts` should be removed (migrate to modular handlers)
2. **Shared Instances**: Some HTTP/IPC handler files create duplicate service instances (could use `instances.ts`)
3. **Error Types**: Consider typed error responses instead of generic messages
4. **API Documentation**: OpenAPI spec generation from Express routes
5. **Database Versioning**: Add explicit schema version tracking
6. **Caching**: Add service-level caching for frequently accessed data
7. **Logging**: Structured logging (pino/winston) instead of console.log
8. **Process Management**: Currently single active task; could support task priorities or parallel execution

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

### Running Full Test Suite

```bash
npm run test         # Runs all three test types in sequence
```

### Debugging

- **Main process**: V8 debugger on port 5858
- **Renderer**: Chrome DevTools on port 9222 or F12 in window
- **IPC calls**: Add console.log in preload.ts or registerIpcHandlers
