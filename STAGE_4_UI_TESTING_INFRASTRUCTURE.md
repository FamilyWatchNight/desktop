# Stage 4: Basic UI Testing Infrastructure — Detailed Implementation Plan

## Overview
This document outlines the detailed implementation plan for Stage 4 (Basic UI Testing Infrastructure) as outlined in USER_SECURITY_IMPLEMENTATION_PLAN.md. This plan establishes the foundation for UI testing with dual transport support (Electron + Browser).

## UI Testing Levels & Granularity

### Two Levels of UI Testing

**1. Component-Level Testing**: Validates that individual UI components work correctly
- Tests component behavior in isolation
- Uses test-only pages that are excluded from production builds
- Focuses on component interactions and state changes
- Example: Testing that nested containers and input fields properly handle keyboard navigation.

**2. User Experience Testing**: Validates end-to-end workflows and user journeys
- Tests complete user workflows across multiple pages
- Uses domain-level language ("navigate to settings") rather than implementation details ("click settings menu")
- Focuses on what the user accomplishes, not how they accomplish it
- Example: Testing that a user can successfully update their profile

### Test-Only Pages
Similar to test hooks, we'll create test-only pages that are only available when building for testing:
- Component test pages: Isolated component testing environments
- Excluded from production builds (like `src/main/testing-active` vs `src/main/testing`)
- Accessible via special routes when `NODE_ENV=testing`

---

## 1. **Playwright Setup & Configuration**

**Files to create/modify:**
- `package.json`: Add Playwright dependencies
  ```
  "@playwright/test": "^1.40.0" (dev dependency)
  ```
- `tests/bdd/technical/playwright-config.ts`: Centralized Playwright configuration
  - Configure for both Electron and browser contexts
  - Handle screenshots/video artifacts on failure
  - Set appropriate timeouts for UI interactions

**Key configuration decisions:**
- Use `@playwright/test` (not just the base library) for better integration with Cucumber
- Create separate launch profiles for `RENDER_LOCATION=electron` vs `RENDER_LOCATION=browser`
- Store launch context in World for reuse across steps

---

## 2. **Transport Abstraction Layer**

**New file: `tests/bdd/technical/transport/UIDriver.ts`**
- Abstract interface for interacting with UI regardless of transport
- Methods: `navigate(url)`, `click(selector)`, `type(selector, text)`, `waitForSelector()`, `screenshot()`, etc.
- **ElectronUIDriver**: Launches Electron app via IPC, targets the renderer window
- **BrowserUIDriver**: Launches Express server, opens browser context, targets HTTP endpoint

**Configuration via environment variable:**
```
RENDER_LOCATION=electron  # Use Electron BrowserWindow + IPC
RENDER_LOCATION=browser   # Use external browser + HTTP
```

**World integration:**
```typescript
// In hooks (tests/bdd/technical/hooks.ts)
setWorldConstructor(CustomWorld)
// World.uiDriver: UIDriver (set based on RENDER_LOCATION)
// World.page: Playwright Page (for browser) or similar for Electron
```

---

## 3. **Page Objects Architecture**

**Directory: `tests/bdd/technical/page-objects/`**

**Base class: `BasePage.ts`**
```typescript
export abstract class BasePage {
  constructor(protected world: World) {}
  abstract readonly selectors: { [key: string]: string }

  async navigate(path: string): Promise<void>
  async click(name: string): Promise<void>
  async waitForVisible(name: string): Promise<void>
  async screenshot(name: string): Promise<void>
  // ...common methods
}
```

**Concrete page objects:**
- `HomePage.ts`: Selectors and methods for main window (menu, basic layout)
- `SettingsPage.ts`: Selectors and methods for Settings view
- `MenuPanel.ts`: Reusable component for navigation menu

**Example structure:**
```typescript
export class HomePage extends BasePage {
  readonly selectors = {
    menu: '[data-testid="main-menu"]',
    settingsButton: '[data-testid="menu-settings"]',
    appTitle: 'h1:has-text("Family Watch Night")',
  }

  async openSettings(): Promise<SettingsPage> {
    await this.click('settingsButton')
    return new SettingsPage(this.world)
  }
}
```

---

## 4. **User Persona Architecture & Scenario Tracking**

### Base User Persona

**File: `tests/bdd/business-flow/personas/UserPersona.ts`**

Create a base `UserPersona` class or abstract class that defines the shared contract for all UI user personas.

```typescript
export abstract class UserPersona {
  constructor(protected world: World) {}

  abstract launchApplication(): Promise<void>
  abstract navigateToSettings(): Promise<void>
  abstract openProfile(): Promise<void>
  abstract submitForm(selector: string, data: Record<string, string>): Promise<void>
}
```

### Unauthenticated User Persona

**File: `tests/bdd/business-flow/personas/UnauthenticatedUserPersona.ts`**

The unauthenticated persona extends `UserPersona` and currently reuses the base behavior without overrides, providing semantic clarity for scenario setup.

```typescript
export class UnauthenticatedUserPersona extends UserPersona {
  async launchApplication(): Promise<void> {
    await openWindow(this.world)
  }

  async navigateToSettings(): Promise<void> {
    // Use page objects / UI utilities to perform navigation
  }

  async openProfile(): Promise<void> {
    // Not applicable for unauthenticated users, or may throw / skip
  }

  async submitForm(selector: string, data: Record<string, string>): Promise<void> {
    // If needed for unauthenticated flows
  }
}
```

### Scenario Persona Tracking

The `CustomWorld` should track the active persona for a scenario:

```typescript
export interface CustomWorld {
  uiDriver: UIDriver
  renderLocation: 'electron' | 'browser'
  scenario: Scenario
  currentUserPersona?: UserPersona
  page?: Page
  app?: ElectronApp
}
```

A `Given` step establishes the persona for the scenario. Later steps can refer to "the user" and delegate to `world.currentUserPersona`.

```typescript
Given('I launch the app as an unauthenticated user', async function() {
  this.currentUserPersona = new UnauthenticatedUserPersona(this)
  await this.currentUserPersona.launchApplication()
})

When('the user navigates to the Settings page', async function() {
  await this.currentUserPersona?.navigateToSettings()
})
```

### Persona Agnosticism in Steps

- `When` and `Then` steps should never assume a specific persona type.
- They should only use the shared contract on `world.currentUserPersona`.
- This keeps steps reusable across future personas like AdminUser and HostUser.

---

## 4.5 **UI Testing Utilities Module**

**File: `tests/bdd/technical/infrastructure/ui-utils.ts`**

Module with exported utility functions for UI testing concerns, parallel to `utils.ts` (system test hooks utilities).

```typescript
// Page verification and waiting
export async function verifyPageIsVisible(world: World, pageName: string): Promise<void>
export async function waitForPageToLoad(world: World): Promise<void>
export async function waitForElement(world: World, selector: string): Promise<void>

// Screenshots and artifacts
export async function takeScreenshot(world: World, name: string): Promise<void>
export async function captureFailureScreenshot(world: World, scenario: Scenario): Promise<void>

// Window management (unified for both Electron and browser transports)
export async function openWindow(world: World): Promise<void> {
  if (world.renderLocation === 'electron') {
    // Open/create the main Electron window
  } else {
    // Open external browser window to Express server
  }
}

export async function closeWindow(world: World): Promise<void> {
  if (world.renderLocation === 'electron') {
    // Close the main Electron window
  } else {
    // Close the external browser window
  }
}
```

**Usage in step definitions:**
```typescript
import { verifyPageIsVisible } from '../technical/infrastructure/ui-utils'
```

---

## 5. **Feature Files & Step Definitions**

**Directory structure:**
```
tests/bdd/business-logic/
  features/
    smoke/
      ui-infrastructure.feature
    steps/
      ui-infrastructure.steps.ts
```

**Feature file: `ui-infrastructure.feature`**
```gherkin
Feature: Basic UI Infrastructure
  As a user
  I want the application UI to be stable and responsive
  So that I can interact with the app reliably

  Scenario: Application launches successfully
    Given I launch the app as an unauthenticated user
    Then the main window is visible
    And the menu is displayed

  Scenario: User can navigate to Settings page
    Given I launch the app as an unauthenticated user
    When the user navigates to the Settings page
    Then the Settings page is visible
    And the page displays the expected content
```

**Step definitions: `ui-infrastructure.steps.ts`**
```typescript
import { verifyPageIsVisible } from '../technical/infrastructure/ui-utils'

Given('I launch the app as an unauthenticated user', async function() {
  const user = new UnauthenticatedUser(this)
  await user.launchApplication()  // Persona method delegates to openWindow utility
})

When('the user navigates to the Settings page', async function() {
  const user = new UnauthenticatedUser(this)
  await user.navigateToSettings()  // Domain-level action
})

Then('the Settings page is visible', async function() {
  await verifyPageIsVisible(this, 'settings')
})
```

**Key principle:** Steps use persona methods (domain language), not page objects or technical details.

---

## 6. **Test Hooks Infrastructure**

**File: `tests/bdd/technical/hooks.ts`** (extend existing)

```typescript
// Before all scenarios
BeforeAll(async function() {
  // Determine RENDER_LOCATION from environment
  const renderLocation = process.env.RENDER_LOCATION || 'browser'

  // Initialize appropriate driver
  // This sets world.uiDriver based on renderLocation
})

// Before each scenario
Before(async function(scenario: Scenario) {
  this.scenario = scenario
  // Initialize fresh UI context for each test
  // Start Express server if RENDER_LOCATION=browser
  // Prepare Electron if RENDER_LOCATION=electron
})

// After each scenario
After(async function(scenario: Scenario) {
  // Capture screenshot on failure
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.uiDriver.screenshot(`${scenario.title}-failure`)
    // Attach to report
  }
  // Clean up: close browser/Electron context
  // Clear temp files
})
```

**New hook: `tests/bdd/technical/app-lifecycle.ts`**
- Manages starting/stopping Express server for browser transport
- Manages launching/closing Electron for electron transport
- Coordinates with existing test infrastructure

---

## 7. **Configuration & Environment Setup**

**Add to `tests/bdd/technical/world.ts` (extend existing):**
```typescript
export interface CustomWorld {
  uiDriver: UIDriver
  renderLocation: 'electron' | 'browser'
  scenario: Scenario
  currentUserPersona?: UserPersona
  page?: Page // Playwright Page for browser
  app?: ElectronApp // Playwright Electron app context
}
```

**Render location environment variable**
- Use `RENDER_LOCATION` to control the UI transport mode.
- Read it in the test hooks with `process.env.RENDER_LOCATION || 'electron'`.
- Default to `electron` when not set, so existing feature test behavior remains unchanged.
- `cross-env` is already used in package scripts, so it is the preferred mechanism to set this variable.

**Script to run with different transports:**
```json
{
  "scripts": {
    "test:features": "npm run build:main:for-integration-testing && cross-env NODE_ENV=test cucumber-js",
    "test:features:browser": "npm run build:main:for-integration-testing && cross-env NODE_ENV=test RENDER_LOCATION=browser cucumber-js",
    "test:features:electron": "npm run build:main:for-integration-testing && cross-env NODE_ENV=test RENDER_LOCATION=electron cucumber-js",
    "test:features:headed": "npm run build:main:for-integration-testing && cross-env NODE_ENV=test RENDER_LOCATION=browser HEADLESS=false cucumber-js"
  }
}
```

**Notes:**
- Do not rely on `.env.example` for runtime configuration unless `dotenv` loading is explicitly added to the test hook setup.
- If needed in the future, `.env` support can be added separately, but the current proposal relies on the established `cross-env` pattern.

---

## 8. **Directory Structure Summary**

```
tests/bdd/
├── business-flow/
│   └── personas/
│       ├── index.ts
│       └── UnauthenticatedUser.ts
│
├── business-logic/
│   ├── features/
│   │   ├── smoke/
│   │   │   └── ui-infrastructure.feature
│   │   └── steps/
│   │       ├── ui-infrastructure.steps.ts
│   │       └── hooks.ts (already exists)
│   └── steps/
│
├── technical/
│   ├── hooks.ts (extend existing)
│   ├── app-lifecycle.ts (NEW)
│   ├── playwright-config.ts (NEW)
│   ├── infrastructure/
│   │   ├── utils.ts (existing - system test hooks)
│   │   └── ui-utils.ts (NEW - UI testing utilities)
│   ├── page-objects/
│   │   ├── index.ts
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── SettingsPage.ts
│   │   └── MenuPanel.ts
│   └── world.ts (extend existing)
```

---

## 9. **Implementation Checklist**

- [ ] Add Playwright dependency to `package.json`
- [ ] Create `UIDriver` abstract base and implementations (Electron + Browser)
- [ ] Create base `BasePage` and concrete page objects (HomePage, SettingsPage, MenuPanel)
- [ ] Add UI testing utilities module in `tests/bdd/technical/infrastructure/ui-utils.ts`
- [ ] Create `UserPersona` base class and `UnauthenticatedUserPersona` in `tests/bdd/business-flow/personas/`
- [ ] Create `ui-infrastructure.feature` and step definitions
- [ ] Extend test hooks to initialize UI driver based on `RENDER_LOCATION`
- [ ] Add UI window management utilities (`openWindow` / `closeWindow`) for both transports
- [ ] Update `CustomWorld` with `currentUserPersona` and render location tracking
- [ ] Add npm scripts for running tests with different transports via `cross-env`
- [ ] Run smoke test with both `RENDER_LOCATION=browser` and `RENDER_LOCATION=electron`

---

## 10. **Success Criteria**

✅ Feature tests pass with `RENDER_LOCATION=browser`
✅ Feature tests pass with `RENDER_LOCATION=electron`
✅ Settings page is accessible via menu in both transports
✅ Screenshots captured on failure
✅ Three-layer BDD architecture maintained (features → personas → page objects)
✅ No test flakiness due to timing issues
✅ Clear separation between domain logic (personas) and technical details (page objects)