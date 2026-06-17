<!--
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
-->

# React Components Library Proposal

## Overview

This proposal outlines the creation of a reusable React components library in `src/renderer/components/elements/` to reduce code repetition across pages and establish consistent semantic building blocks for the UI.

---

## Current State Analysis

### Existing Repetition Patterns

#### 1. Layout Repetition

**Location**: Every page (BackgroundTasksPage, SettingsPage, StyleboardPage)

```tsx
// Current pattern repeated in each page
<div className="page centered" data-testid="page-*">
  <div className="page-container">
    <h1 className="page-title">{title}</h1>
    {/* page content */}
  </div>
</div>
```

**Impact**: All pages manually construct identical structure. Changes to page layout require updates in multiple files.

#### 2. Section Grouping

**Location**: BackgroundTasksPage, SettingsPage

```tsx
// Repeated pattern
<section className="section">
  <h2 className="section-title">{sectionTitle}</h2>
  {/* section content */}
</section>
```

**Impact**: Section structure is hardcoded in pages, limiting semantic clarity.

#### 3. Form Groups

**Location**: SettingsPage

```tsx
// Repeated 3 times for each setting
<div className="form-group">
  <label htmlFor="fieldId" data-testid="settings-*-label">{label}</label>
  <input type="..." id="fieldId" data-testid="settings-*-input" {...} />
</div>
```

**Impact**: Form structure inconsistency, difficult to change styling/validation globally.

#### 4. Status Messages

**Location**: SettingsPage, BackgroundTasksPage

```tsx
// Message display with type variants
{
  statusMessage && (
    <div className={`message ${statusType}`} data-testid="...">
      {statusMessage}
    </div>
  );
}
```

**Impact**: Status display logic duplicated across pages.

#### 5. Progress Indication

**Location**: BackgroundTasksPage

```tsx
// Progress bar rendering logic
<div className="progress-bar-wrap">
  <div className={`progress-bar-fill ${isIndeterminate ? 'indeterminate' : ''}`}
    style={isIndeterminate ? {} : { width: `${progressPercent}%` }}
  />
</div>
<div className="progress-text">{progressPercent}%</div>
```

**Impact**: Complex logic mixed with display; difficult to reuse or test independently.

#### 6. List Items

**Location**: BackgroundTasksPage (queued tasks)

```tsx
// Repeated for each queue item
{
  queue.map((task) => (
    <li key={task.id} className="queued-item" data-testid="...">
      <span className="queued-item-label">{task.label}</span>
      <button type="button" className="btn-danger" onClick={() => removeQueuedTask(task.id)}>
        {t('button.removeTask')}
      </button>
    </li>
  ));
}
```

**Impact**: List item structure hardcoded per page; difficult to create consistent list experiences.

#### 7. Menu Items

**Location**: AppLayout.tsx

```tsx
// Menu item pattern repeated for home, background-tasks, styleboard, settings
<button
  className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
  onClick={() => navigateTo('home')}
  data-testid="menu-home"
>
  <svg className="menu-icon" {...}>...</svg>
  <span>{t('menu.home')}</span>
</button>

// System menu with badge
<button className={`menu-item ${currentPage === 'background-tasks' ? 'active' : ''}`} ...>
  <svg className="menu-icon" {...}>...</svg>
  <span>{t('menu.backgroundTasks')}</span>
  {(activeTask || queue.length > 0) && (
    <span className="menu-badge">{(activeTask ? 1 : 0) + queue.length}</span>
  )}
</button>
```

**Impact**: Menu item logic duplicated; changes to active state styling or badge logic require updates in multiple places.

#### 8. Expandable Sections

**Location**: AppLayout.tsx (system menu)

```tsx
// Expand/collapse logic mixed with rendering
<button
  type="button"
  className="menu-system-toggle"
  onClick={() => setSystemExpanded(!systemExpanded)}
  aria-expanded={systemExpanded}
>
  <span className="menu-system-chevron" aria-hidden="true">
    <svg>...</svg>
  </span>
  <span>{t('menu.system')}</span>
</button>
<div id="menu-system-items" className="menu-system-items">
  {/* nested items */}
</div>
```

**Impact**: Expand/collapse state management and styling duplicated; difficult to create consistent collapsible experiences.

---

## Proposed Component Architecture

### Directory Structure

```
src/renderer/components/elements/
├── index.ts                          # Barrel export
├── layout/
│   ├── Page.tsx
│   ├── Section.tsx
│   ├── PageTitle.tsx
│   └── SectionTitle.tsx
├── forms/
│   ├── FormGroup.tsx
│   ├── FormInput.tsx
│   └── FormLabel.tsx
├── feedback/
│   ├── Message.tsx
│   ├── ProgressBar.tsx
│   └── Badge.tsx
├── containers/
│   ├── ListItem.tsx
│   ├── List.tsx
│   └── Card.tsx
├── navigation/
│   ├── MenuItem.tsx
│   └── ExpandableMenuSection.tsx
├── buttons/
│   ├── Button.tsx
│   └── ButtonGroup.tsx
├── icons/
│   ├── Icon.tsx
│   └── icons.tsx                     # Icon definitions
└── types.ts                          # Shared component types
```

---

## Component Specifications

### Layout Components

#### `Page.tsx`

**Purpose**: Semantic page wrapper with consistent layout.

**Props**:

```tsx
interface PageProps {
  children: React.ReactNode;
  title?: string;
  centered?: boolean;
  testId?: string;
}
```

**Usage**:

```tsx
<Page title="Settings" centered testId="page-settings">
  <Section title="API Keys">{/* content */}</Section>
</Page>
```

**Benefits**:

- Eliminates repetitive `.page` + `.page-container` wrapping
- Consistent page title handling
- Centered layout option built-in

---

#### `Section.tsx`

**Purpose**: Semantic section grouping with optional title.

**Props**:

```tsx
interface SectionProps {
  children: React.ReactNode;
  title?: string;
  testId?: string;
}
```

**Usage**:

```tsx
<Section title="Active Task">{/* section content */}</Section>
```

**Benefits**:

- Eliminates `.section` + `.section-title` boilerplate
- Semantic structure
- Optional title rendering

---

#### `PageTitle.tsx` / `SectionTitle.tsx`

**Purpose**: Standardized heading components for accessibility and styling consistency.

**Props**:

```tsx
interface PageTitleProps {
  children: React.ReactNode;
  testId?: string;
}
```

---

### Form Components

#### `FormGroup.tsx`

**Purpose**: Wrapper for label + input with consistent styling.

**Props**:

```tsx
interface FormGroupProps {
  label: string;
  labelTestId?: string;
  children: React.ReactNode;
  testId?: string;
}
```

**Usage**:

```tsx
<FormGroup label="Web Port" labelTestId="settings-webport-label">
  <FormInput
    type="number"
    placeholder="3000"
    value={webPort}
    onChange={(e) => setWebPort(e.target.value)}
    testId="settings-webport-input"
  />
</FormGroup>
```

**Benefits**:

- Consistent label positioning and styling
- Child flexibility (input, select, textarea, etc.)
- Removes `.form-group` boilerplate

---

#### `FormInput.tsx`

**Purpose**: Standardized input wrapper with consistent styling.

**Props**:

```tsx
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  testId?: string;
  // All standard HTML input attributes supported
}
```

**Usage**:

```tsx
<FormInput
  type="password"
  value={apiKey}
  onChange={(e) => setApiKey(e.target.value)}
  testId="settings-api-key-input"
/>
```

**Benefits**:

- Applies consistent focus/border styling
- Removes inline style duplication
- Enables global input behavior changes

---

### Feedback Components

#### `Message.tsx`

**Purpose**: Status/alert message with type variants.

**Props**:

```tsx
interface MessageProps {
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info';
  testId?: string;
}
```

**Usage**:

```tsx
{
  statusMessage && (
    <Message type={statusType} testId="settings-status">
      {statusMessage}
    </Message>
  );
}
```

**Benefits**:

- Eliminates manual className construction
- Type-safe message variants
- Centralized styling logic

---

#### `ProgressBar.tsx`

**Purpose**: Semantic progress indicator with determinate/indeterminate modes.

**Props**:

```tsx
interface ProgressBarProps {
  current?: number;
  max?: number;
  isIndeterminate?: boolean;
  showLabel?: boolean;
  testId?: string;
}
```

**Usage**:

```tsx
<ProgressBar current={task.current} max={task.max} showLabel testId="background-tasks-progress" />
```

**Benefits**:

- Encapsulates progress calculation logic
- Handles both determinate and indeterminate states
- Removes inline conditional styling

---

#### `Badge.tsx`

**Purpose**: Count/status badge for UI components.

**Props**:

```tsx
interface BadgeProps {
  count: number;
  testId?: string;
}
```

**Usage**:

```tsx
{
  taskCount > 0 && <Badge count={taskCount} testId="menu-tasks-badge" />;
}
```

**Benefits**:

- Reusable badge component for menu items, lists, notifications
- Consistent styling
- Optional count display

---

### Container Components

#### `List.tsx`

**Purpose**: Container for list items with consistent spacing/styling.

**Props**:

```tsx
interface ListProps {
  children: React.ReactNode;
  testId?: string;
}
```

**Usage**:

```tsx
<List testId="queued-tasks-list">
  {queue.map((task) => (
    <ListItem key={task.id} testId={`task-${task.id}`}>
      {/* item content */}
    </ListItem>
  ))}
</List>
```

---

#### `ListItem.tsx`

**Purpose**: Semantic list item with action button support.

**Props**:

```tsx
interface ListItemProps {
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    testId?: string;
  }>;
  testId?: string;
}
```

**Usage**:

```tsx
<ListItem
  actions={[
    {
      label: t('button.removeTask'),
      onClick: () => removeQueuedTask(task.id),
      variant: 'danger',
      testId: `remove-task-${task.id}`,
    },
  ]}
  testId={`queued-task-${task.id}`}
>
  <span>{task.label}</span>
</ListItem>
```

**Benefits**:

- Eliminates manual list item structure
- Consistent action button layout
- Flex layout for label + actions automatically handled

---

#### `Card.tsx`

**Purpose**: Generic container for discrete content (scalable for future features).

**Props**:

```tsx
interface CardProps {
  children: React.ReactNode;
  title?: string;
  testId?: string;
  className?: string;
}
```

---

### Navigation Components

#### `MenuItem.tsx`

**Purpose**: Menu item with icon, label, optional badge, and active state.

**Props**:

```tsx
interface MenuItemProps {
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  isActive?: boolean;
  onClick?: () => void;
  testId?: string;
}
```

**Usage**:

```tsx
<MenuItem
  label={t('menu.home')}
  icon={homeIcon}
  isActive={currentPage === 'home'}
  onClick={() => navigateTo('home')}
  testId="menu-home"
/>

<MenuItem
  label={t('menu.backgroundTasks')}
  badge={activeTask ? 1 + queue.length : queue.length}
  isActive={currentPage === 'background-tasks'}
  onClick={() => navigateTo('background-tasks')}
  testId="menu-background-tasks"
/>
```

**Benefits**:

- Encapsulates menu item styling (active state, hover, badge positioning)
- Eliminates conditional className logic
- Icon and badge handling standardized

---

#### `ExpandableMenuSection.tsx`

**Purpose**: Collapsible menu section with chevron animation.

**Props**:

```tsx
interface ExpandableMenuSectionProps {
  label: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  testId?: string;
}
```

**Usage**:

```tsx
<ExpandableMenuSection
  label={t('menu.system')}
  isExpanded={systemExpanded}
  onExpandedChange={setSystemExpanded}
  testId="menu-system"
>
  <MenuItem label="Background Tasks" ... />
  <MenuItem label="Styleboard" ... />
</ExpandableMenuSection>
```

**Benefits**:

- Encapsulates expand/collapse logic
- Chevron animation handled internally
- ARIA attributes for accessibility
- Reusable for other collapsible sections

---

### Button Components

#### `Button.tsx`

**Purpose**: Semantic button wrapper with variant support.

**Props**:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info';
  testId?: string;
}
```

**Usage**:

```tsx
<Button variant="primary" onClick={handleSave} testId="settings-save">
  Save Settings
</Button>

<Button variant="danger" onClick={handleCancel} testId="cancel-task">
  Cancel
</Button>
```

**Benefits**:

- Eliminates className logic for button variants
- Consistent button styling across app
- Type-safe variant selection

---

#### `ButtonGroup.tsx`

**Purpose**: Container for related buttons with flex layout.

**Props**:

```tsx
interface ButtonGroupProps {
  children: React.ReactNode;
  testId?: string;
}
```

**Usage**:

```tsx
<ButtonGroup testId="settings-actions">
  <Button variant="primary" onClick={saveSettings}>
    Save
  </Button>
  <Button variant="secondary" onClick={handleCancel}>
    Cancel
  </Button>
</ButtonGroup>
```

**Benefits**:

- Removes `.button-group` boilerplate
- Consistent spacing between buttons
- Flex layout handled automatically

---

## Growth-Oriented Components (Future-Ready)

These components are sensible to implement now with scalable structure, even if not immediately used:

### `Modal.tsx`

**Purpose**: Dialog/modal wrapper for confirmations, settings, etc.

**Future Usage Examples**:

- Delete confirmation dialogs
- Movie detail modals
- Advanced search modals

---

### `Tabs.tsx` / `TabPanel.tsx`

**Purpose**: Tab container with panel switching.

**Future Usage Examples**:

- Settings pages with multiple tabs (General, Advanced, About)
- Movie details with tabs (Info, Reviews, Related)

---

### `Icon.tsx`

**Purpose**: Semantic icon wrapper extracting SVG logic.

**Future Benefits**:

- Icon size/color variants
- Icon library consistency
- Icon animation support

---

### `Select.tsx`

**Purpose**: Standardized dropdown/select wrapper.

**Future Usage Examples**:

- Language selection in settings
- Movie filter dropdowns
- Sort/display options

---

## Implementation Guidelines

### Principles

1. **Props Over Styling**: Components accept data props, not `className` overrides (encapsulation)
2. **Accessibility**: Built-in ARIA attributes, semantic HTML, keyboard navigation where applicable
3. **Testability**: All components support optional `testId` props; `data-testid` attributes automatically applied
4. **Consistency**: All components use consistent spacing, colors, and interactions
5. **Flexibility**: Child components used for composition where appropriate (e.g., `FormGroup` accepts children)

### File Placement & Naming

- Each component in its own file (one component per file)
- PascalCase file names matching component exports
- Types defined in component file or shared `types.ts`
- `index.ts` barrel export for easy imports

### Styling Approach

- Component styling stays in SCSS files in `src/renderer/styles/components/elements/`
- Directory structure mirrors component structure
- Components apply `className` internally; no external styling leakage
- Existing SCSS patterns (e.g., `@mixin make-button-color`) reused for consistency

### Testing Strategy: Component Test Pages

Following the same pattern used for main process test hooks, component testing will use **test-only pages** that exist only in testing builds. The test page registration and menu rendering should be driven by the active renderer testing module, while the noop module provides no pages or menu entries.

#### Directory Structure

```
src/renderer/testing-active/     # Active test pages and registration helpers
├── index.ts                                 # Exports registration function and menu builder
├── PageTestPage.tsx                         # Tests Page component
├── SectionTestPage.tsx                      # Tests Section component
├── FormGroupTestPage.tsx                    # Tests FormGroup component
├── FormInputTestPage.tsx                    # Tests FormInput component
├── MessageTestPage.tsx                      # Tests Message component
├── ProgressBarTestPage.tsx                  # Tests ProgressBar component
├── ButtonTestPage.tsx                       # Tests Button component
├── MenuItemTestPage.tsx                     # Tests MenuItem component
└── ExpandableMenuSectionTestPage.tsx        # Tests ExpandableMenuSection component

src/renderer/testing/             # Symlink/auto-copied at build time from active or noop
└── index.ts

src/renderer/testing-noop/        # No-op module (production/test-disabled)
├── index.ts                                 # Exports empty registration function and no menu
```

#### Module Contract

The `testing` module should expose a small runtime contract that lets AppLayout and page registration logic remain unaware of build mode details.

```ts
export interface TestingModule {
  registerTestPages?: (registry: PageRegistry) => void;
  buildTestingMenu?: () => React.ReactNode | null;
}
```

- `testing-active/index.ts` exports the real registration functions
- `testing-noop/index.ts` exports stubs that do nothing and return `null`

This means AppLayout and page routing can simply import the same `testing` module and use its public contract without branching on `NODE_ENV`.

#### Test Page Registration

A shared page registry is used to keep page routing dynamic:

```ts
interface PageRegistry {
  registerPage: (route: string, component: React.ComponentType, label: string) => void;
  getPage: (route: string) => React.ComponentType | undefined;
  getPages: () => Array<{ route: string; label: string }>;
}
```

`testing-active` registers its own pages on startup:

```ts
export function registerTestPages(registry: PageRegistry): void {
  registry.registerPage('testing/page', PageTestPage, 'Page Test');
  registry.registerPage('testing/section', SectionTestPage, 'Section Test');
  // ... more pages
}

export function buildTestingMenu(): React.ReactNode {
  return (
    <ExpandableMenuSection label="Testing" testId="menu-testing">
      <MenuItem label="Page" onClick={() => navigateTo('testing/page')} />
      <MenuItem label="Section" onClick={() => navigateTo('testing/section')} />
      {/* ... more test page links ... */}
    </ExpandableMenuSection>
  );
}
```

`testing-noop` exports empty defaults:

```ts
export function registerTestPages(registry: PageRegistry): void {
  // No-op
}

export function buildTestingMenu(): React.ReactNode | null {
  return null;
}
```

#### AppLayout Integration

`AppLayout.tsx` should import the renderer testing module and use its contract directly:

```tsx
import * as testing from '../testing';

const testMenuSection = testing.buildTestingMenu?.();

return (
  <div className="app-layout" data-testid="app-layout">
    {/* existing structure */}
    <div className="side-menu" data-testid="side-menu">
      <div className="menu-content">
        {/* ... other menu sections ... */}
        {testMenuSection}
      </div>
    </div>
```

Because `testing-noop` returns `null`, AppLayout does not need any `NODE_ENV` logic.

#### Page Resolution

A dynamic registry should back `renderPage()`:

```tsx
const registeredPage = pageRegistry.getPage(currentPage);
return registeredPage ? React.createElement(registeredPage) : <HomePage />;
```

During initialization, the app loads the registry and invokes `testing.registerTestPages(pageRegistry)` so test pages can be added only when the active module is present.

#### Test Page Pattern

Each test page follows a consistent structure to enable property manipulation and behavior validation:

```tsx
// Example: PageTestPage.tsx
import React, { useState } from 'react';
import { Page } from '../elements';

export default function PageTestPage(): React.ReactElement {
  const [props, setProps] = useState({
    title: 'Test Page Title',
    centered: true,
  });

  const updateProp = (key: string, value: unknown): void => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div data-testid="page-test-page-root">
      {/* Control Section: Manipulate component properties */}
      <section className="test-controls" data-testid="page-test-controls">
        <h2>Component Controls</h2>

        <div className="control-group">
          <label htmlFor="page-test-title">Title:</label>
          <input
            id="page-test-title"
            type="text"
            value={props.title}
            onChange={(e) => updateProp('title', e.target.value)}
            data-testid="page-test-title-input"
          />
        </div>

        <div className="control-group">
          <label htmlFor="page-test-centered">Centered:</label>
          <input
            id="page-test-centered"
            type="checkbox"
            checked={props.centered}
            onChange={(e) => updateProp('centered', e.target.checked)}
            data-testid="page-test-centered-checkbox"
          />
        </div>
      </section>

      {/* Rendering Section: Component under test */}
      <section className="test-rendering" data-testid="page-test-rendering">
        <h2>Component Output</h2>
        <Page {...props} data-testid="page-component-under-test">
          <div>Sample content for testing</div>
        </Page>
      </section>

      {/* Validation Section: Display state for assertions */}
      <section className="test-validation" data-testid="page-test-validation">
        <h2>Validation Outputs</h2>
        <p data-testid="page-is-centered">Centered: {props.centered ? 'Yes' : 'No'}</p>
        <p data-testid="page-title-text">Title: {props.title}</p>
        <p data-testid="page-has-title">{props.title ? 'Title exists' : 'No title'}</p>
      </section>
    </div>
  );
}
```

#### Build Script Integration

Extend existing `scripts/use-testing-active.js` and `scripts/use-testing-noop.js`:

```javascript
// scripts/use-testing-active.js (excerpt)
const fs = require('fs');
const path = require('path');

function linkTestingDirectories() {
  // Main process test hooks (existing logic)
  linkDirectory('src/main/testing-active', 'src/main/testing');

  // Renderer process test pages (new logic)
  linkDirectory('src/renderer/testing-active', 'src/renderer/testing');
}

function linkDirectory(source, target) {
  const isSymlink = fs.lstatSync(target).isSymbolicLink?.() ?? false;
  if (isSymlink) fs.unlinkSync(target);
  fs.symlinkSync(path.resolve(source), path.resolve(target));
}

linkTestingDirectories();
```

#### AppLayout Modifications Required

To support test page navigation, AppLayout will need these updates:

1. **Import the testing module contract**:

   ```tsx
   import * as testing from '../testing';
   ```

2. **Create a shared page registry** that supports runtime registration.

3. **Use the testing module to build the optional menu section**:

   ```tsx
   const testMenuSection = testing.buildTestingMenu?.();
   ```

4. **Render the menu section if present** without checking `NODE_ENV`.

## Build Configuration Additions

### package.json Scripts

No changes needed — existing build process already handles test hook management via `use-testing-active.js` / `use-testing-noop.js`.

### Environment Variables

- `NODE_ENV=development`: Default behavior for local development
- `NODE_ENV=test`: Enables test page registration if the test module is used
- Avoid relying on `NODE_ENV==='production'` to infer test mode

---

**New Persona: `TesterPersona`** (extends `UserPersona`)

```tsx
// tests/bdd/business-flow/personas/tester.ts
export class TesterPersona extends UserPersona {
  async navigateToTestPage(componentName: string): Promise<void> {
    await this.page.goto(`http://localhost:3000/testing/${kebabCase(componentName)}`);
    // OR navigate via app UI
    // await this.navigateTo(`testing/${componentName}`);
  }

  async setComponentProp(propName: string, value: unknown): Promise<void> {
    // Generic prop setter for test pages
    const testId = `*-test-${propName}-*`; // Matches input data-testid pattern

    if (typeof value === 'boolean') {
      await this.page.check(`[data-testid="${propName}-test-checkbox"]`);
    } else {
      await this.page.fill(`[data-testid*="${propName}-test"]`, String(value));
    }
  }

  async getComponentState(): Promise<Record<string, unknown>> {
    // Read validation section to get current component state
    return await this.page.evaluate(() => {
      const validationSection = document.querySelector('[data-testid*="test-validation"]');
      if (!validationSection) return {};

      const state: Record<string, unknown> = {};
      validationSection.querySelectorAll('[data-testid]').forEach((el) => {
        const testId = el.getAttribute('data-testid') || '';
        const value = el.textContent || '';
        state[testId] = value;
      });
      return state;
    });
  }
}
```

**Example Feature File:**

```gherkin
Feature: Page Component

  Background:
    Given I am a tester user
    When I navigate to the Page test page

  Scenario: Page renders with title
    When I set the "title" property to "My Test Page"
    Then the page component should display title "My Test Page"

  Scenario: Page centers content when centered is true
    When I set the "centered" property to true
    Then the page component should be centered

  Scenario: Page does not center when centered is false
    When I set the "centered" property to false
    Then the page component should not be centered
```

**Step Definitions:**

```tsx
// tests/bdd/business-logic/steps/component-testing.ts
import { When, Then, Given } from '@cucumber/cucumber';
import { World } from '../support/world';

Given('I am a tester user', async function (this: World) {
  this.persona = new TesterPersona(this);
});

When('I navigate to the {word} test page', async function (this: World, componentName: string) {
  await this.persona.navigateToTestPage(componentName);
});

When(
  'I set the {string} property to {string}',
  async function (this: World, propName: string, value: string) {
    // Handle type conversion
    const parsedValue = value === 'true' ? true : value === 'false' ? false : value;
    await this.persona.setComponentProp(propName, parsedValue);
  },
);

Then(
  'the {word} component should display title {string}',
  async function (this: World, componentName: string, expectedTitle: string) {
    const state = await this.persona.getComponentState();
    const titleElement = await this.persona.page.getAttribute(
      '[data-testid="page-title-text"]',
      'textContent',
    );
    expect(titleElement).toContain(expectedTitle);
  },
);

Then('the {word} component should be centered', async function (this: World) {
  const state = await this.persona.getComponentState();
  const isCenteredText = await this.persona.page.textContent('[data-testid="page-is-centered"]');
  expect(isCenteredText).toContain('Yes');
});
```

#### Build Script Integration

Extend existing `scripts/use-testing-active.js` and `scripts/use-testing-noop.js`:

```javascript
// scripts/use-testing-active.js (excerpt)
const fs = require('fs');
const path = require('path');

function linkTestingDirectories() {
  // Main process test hooks (existing logic)
  linkDirectory('src/main/testing-active', 'src/main/testing');

  // Renderer process test pages (new logic)
  linkDirectory('src/renderer/testing-active', 'src/renderer/testing');
}

function linkDirectory(source, target) {
  const isSymlink = fs.lstatSync(target).isSymbolicLink?.() ?? false;
  if (isSymlink) fs.unlinkSync(target);
  fs.symlinkSync(path.resolve(source), path.resolve(target));
}

linkTestingDirectories();
```

#### Test Page Styling

Standardized styles for test control sections:

```scss
// src/renderer/styles/components/test-pages.scss
.test-controls,
.test-rendering,
.test-validation {
  border: 2px solid #666;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);

  h2 {
    font-size: 14px;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #aaa;
  }
}

.control-group {
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;

  label {
    min-width: 120px;
  }

  input {
    flex: 1;
  }
}

.test-rendering {
  border-color: #007acc;
  background: rgba(0, 122, 204, 0.1);
}

.test-validation {
  border-color: #00aa00;
  background: rgba(0, 170, 0, 0.1);

  p {
    font-family: monospace;
    font-size: 12px;
    margin: 0.25rem 0;
    color: #00dd00;
  }
}
```

### Documentation

- JSDoc comments on all component props
- Usage examples in component files or component documentation
- Test page examples demonstrating all props and variations
- Storybook integration (optional future enhancement)

---

## Migration Path

### Phase 0: Test Infrastructure Setup

Priority: High | Duration: ~3 days

- Create test pages directory structure (`src/renderer/testing-active/`, `-noop/`)
- Extend build scripts (`scripts/use-testing-active.js`, `use-testing-noop.js`) to handle renderer test pages
- Create `TesterPersona` class in `tests/bdd/business-flow/personas/`
- Add shared test page styles to `src/renderer/styles/components/test-pages.scss`
- Create `test-page-utils.ts` with helper functions for test page development
- Modify AppLayout to conditionally render test menu section

### Phase 1: Core Layout Components + Test Pages

Priority: High | Duration: ~1 sprint

**Components:**

- Create `Page`, `Section`, `PageTitle`, `SectionTitle` in `src/renderer/components/elements/layout/`

**Test Pages:**

- Create `PageTestPage.tsx`, `SectionTestPage.tsx` in `src/renderer/testing-active/`
- Create feature files: `page-component.feature`, `section-component.feature`
- Create step definitions for layout component testing

**Integration:**

- Migrate existing pages to use new layout components
- Validate page structure consistency

### Phase 2: Form Components + Test Pages

Priority: High | Duration: ~1 sprint

**Components:**

- Create `FormGroup`, `FormInput`, `FormLabel` in `src/renderer/components/elements/forms/`

**Test Pages:**

- Create `FormGroupTestPage.tsx`, `FormInputTestPage.tsx` in `src/renderer/testing-active/`
- Create feature files for form component testing

**Integration:**

- Migrate SettingsPage and future forms to new components
- Test form interactions (focus, validation) via test pages

### Phase 3: Navigation & Button Components + Test Pages

Priority: Medium | Duration: ~1 sprint

**Components:**

- Create `MenuItem`, `ExpandableMenuSection` in `src/renderer/components/elements/navigation/`
- Create `Button`, `ButtonGroup` in `src/renderer/components/elements/buttons/`

**Test Pages:**

- Create test pages for navigation and button components

**Integration:**

- Migrate AppLayout to new navigation components
- Test menu interactions via test pages
- Refactor menu state management if needed

### Phase 4: Feedback & Container Components + Test Pages

Priority: Medium | Duration: ~1 sprint

**Components:**

- Create `Message`, `ProgressBar`, `Badge` in `src/renderer/components/elements/feedback/`
- Create `Stack`, `Row` in `src/renderer/components/elements/containers/`

**Test Pages:**

- Create test pages for each feedback component
- Create stack and row test pages

**Integration:**

- Migrate BackgroundTasksPage to new components
- Validate feedback component behavior via test pages

### Phase 5: Future-Ready Components

Priority: Low | Duration: As needed

- `Modal`, `Tabs`, `Icon`
- Created with scalable structure, test pages included with examples

---

## AppLayout Modifications Required

To support test page navigation, AppLayout will need these updates:

1. **Add Test Menu Section**: Conditionally rendered when not in production:

   ```tsx
   {
     process.env.NODE_ENV !== 'production' && (
       <ExpandableMenuSection label="Testing" testId="menu-testing" isExpanded={false}>
         {/* Links to test pages */}
       </ExpandableMenuSection>
     );
   }
   ```

2. **Extend Navigation Handling**: Add route handler for test pages:

   ```tsx
   // In navigateTo() or similar routing logic
   if (page.startsWith('testing/')) {
     // Load test page component dynamically or conditionally render
   }
   ```

3. **Import Test Pages**: Conditionally import from `testing` directory:
   ```tsx
   // Lazy import that resolves to correct directory at build time
   import * as TestPages from '../testing';
   ```

## Build Configuration Additions

### package.json Scripts

No changes needed — existing build process already handles test hook management via `use-testing-active.js` / `use-testing-noop.js`.

### Environment Variables

- `NODE_ENV=development`: Test menu visible, test pages enabled
- `NODE_ENV=production`: Test menu hidden, test pages use no-op versions
- Optional: `SHOW_TEST_PAGES=true` for explicit control in development

---

## Success Metrics

1. **Code Reduction**: 30-40% reduction in component JSX LOC
2. **Consistency**: All pages follow same layout/form/message patterns
3. **Component Testing**: All reusable components have dedicated test pages with property manipulation
4. **Maintainability**: Changes to styling apply globally through component updates
5. **Developer Velocity**: New pages created 50% faster using established component library
6. **Accessibility**: All components meet WCAG 2.1 AA standards
7. **Test Coverage**: All components have automated BDD tests via test pages

---

## Questions & Decisions Needed

1. **Scope Priority**: Implement Phase 0-2 immediately, or wait for complete design review?
2. **Test Page Complexity**: Include test pages for all components, or start with high-impact ones (Page, Section, FormGroup)?
3. **File Organization**: Keep subdirectories as proposed, or flatten to single `elements/` directory?
4. **Styling Approach**: Component styling in dedicated SCSS files, or co-locate SCSS imports in component files?
5. **Props Flexibility**: Allow `className` prop override for edge cases, or keep styling fully encapsulated?
6. **Icon Handling**: Extract SVG icon logic into `Icon.tsx` component now, or leave as inline SVGs in components?
7. **Test Page Navigation**: Should test pages be navigable via AppLayout menu, or only via direct URL (`/testing/page`)?
8. **Test Page Export**: Should `src/renderer/testing/` exports be used directly in pages, or via a test utilities module?

---

## References

- Current pages: [BackgroundTasksPage](src/renderer/components/pages/BackgroundTasksPage.tsx), [SettingsPage](src/renderer/components/pages/SettingsPage.tsx), [AppLayout](src/renderer/components/AppLayout.tsx)
- Existing styles: [elements.scss](src/renderer/styles/elements.scss), [layout.scss](src/renderer/styles/layout.scss)
- Component hierarchy: [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md)
