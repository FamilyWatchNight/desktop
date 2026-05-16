<!--
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
-->

# Phase 1 Proposal: Core Layout Components + Test Pages

## Goal

Implement reusable layout components that eliminate page structure repetition and establish semantic building blocks for consistent page layouts. These foundational components will be used by all subsequent pages and component phases.

This phase focuses on:

- creating semantic layout components (`Page`, `Section`, `PageTitle`, `SectionTitle`)
- establishing test pages for layout component validation
- creating BDD feature tests for layout component behavior
- migrating existing pages to use the new components
- validating page structure consistency across the application

---

## Scope

This proposal covers only Phase 1 work:

1. Core layout component specifications and implementation
2. Component styling approach and SCSS organization
3. Test page implementation for each layout component
4. BDD feature files and step definitions
5. Migration strategy for existing pages (BackgroundTasksPage, SettingsPage, StyleboardPage)
6. Validation criteria and success metrics

---

## Problem Statement

Currently, every page in the application repeats the same layout boilerplate:

```tsx
// Repeated in BackgroundTasksPage, SettingsPage, StyleboardPage
<div className="page centered" data-testid="page-*">
  <div className="page-container">
    <h1 className="page-title">{title}</h1>
    {/* page content */}
  </div>
</div>
```

And sections repeat:

```tsx
// Repeated in BackgroundTasksPage, SettingsPage
<section className="section">
  <h2 className="section-title">{sectionTitle}</h2>
  {/* section content */}
</section>
```

**Issues**:

- Changes to page layout require updates in multiple files
- No semantic differentiation between page titles, section titles, and regular headings
- Styling inconsistencies introduce visual bugs
- Difficult to enforce accessibility standards across pages
- Testing page structure requires inspecting DOM rather than component contracts

---

## Phase 1 Deliverables

### 1. Component Specifications

#### `Page.tsx`

**Purpose**: Root container for pages with consistent centered layout, title placement, and container structure.

**File**: `src/renderer/components/elements/layout/Page.tsx`

**Props Interface**:

```tsx
export interface PageProps {
  /** Page title displayed at the top */
  title?: string;

  /** Main page content */
  children: React.ReactNode;

  /** Whether to apply centered layout styling */
  centered?: boolean;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}
```

**Responsibilities**:

- Render semantic `<main>` element with `.page` class
- Render `.page-container` wrapper for content
- Optionally render page title as `<h1>` using `PageTitle` component
- Apply centered layout when `centered={true}`
- Support custom className for variants

**JSDoc Example**:

````tsx
/**
 * Page component — semantic page container with consistent layout.
 *
 * @example
 * ```tsx
 * <Page title="Settings" centered testId="page-settings">
 *   <Section title="Display">{/* content */}</Section>
 * </Page>
 * ```
 */
````

**Rendered Output**:

```html
<main class="page centered" data-testid="page-settings">
  <div class="page-container">
    <h1 class="page-title">Settings</h1>
    {/* children */}
  </div>
</main>
```

---

#### `Section.tsx`

**Purpose**: Semantic section grouping with optional title and consistent spacing.

**File**: `src/renderer/components/elements/layout/Section.tsx`

**Props Interface**:

```tsx
export interface SectionProps {
  /** Optional section title */
  title?: string;

  /** Section content */
  children: React.ReactNode;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}
```

**Responsibilities**:

- Render semantic `<section>` element with `.section` class
- Optionally render section title as `<h2>` using `SectionTitle` component
- Apply consistent section spacing and borders
- Support custom className for variants

**JSDoc Example**:

````tsx
/**
 * Section component — semantic section grouping with optional title.
 *
 * @example
 * ```tsx
 * <Section title="Active Task" testId="active-task-section">
 *   {/* task content */}
 * </Section>
 * ```
 */
````

**Rendered Output**:

```html
<section class="section" data-testid="active-task-section">
  <h2 class="section-title">Active Task</h2>
  {/* children */}
</section>
```

---

#### `PageTitle.tsx`

**Purpose**: Standardized page heading component ensuring consistent typography and accessibility.

**File**: `src/renderer/components/elements/layout/PageTitle.tsx`

**Props Interface**:

```tsx
export interface PageTitleProps {
  /** Title text or content */
  children: React.ReactNode;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}
```

**Responsibilities**:

- Render semantic `<h1>` with `.page-title` class
- Apply consistent page title typography
- Support nested elements (e.g., icon + text)

**Usage**:

```tsx
// Typically used by Page component, but can be used standalone
<PageTitle testId="page-title">Settings</PageTitle>

// With icon
<PageTitle>
  <SettingsIcon /> Settings
</PageTitle>
```

---

#### `SectionTitle.tsx`

**Purpose**: Standardized section heading component ensuring consistent typography and accessibility.

**File**: `src/renderer/components/elements/layout/SectionTitle.tsx`

**Props Interface**:

```tsx
export interface SectionTitleProps {
  /** Title text or content */
  children: React.ReactNode;

  /** Optional CSS class name for additional styling */
  className?: string;

  /** Test identifier for automation */
  testId?: string;
}
```

**Responsibilities**:

- Render semantic `<h2>` with `.section-title` class
- Apply consistent section title typography
- Support nested elements

**Usage**:

```tsx
// Typically used by Section component, but can be used standalone
<SectionTitle testId="section-title">API Keys</SectionTitle>
```

---

#### `index.ts` (Barrel Export)

**File**: `src/renderer/components/elements/layout/index.ts`

```tsx
export { Page, type PageProps } from './Page';
export { Section, type SectionProps } from './Section';
export { PageTitle, type PageTitleProps } from './PageTitle';
export { SectionTitle, type SectionTitleProps } from './SectionTitle';
```

---

### 2. Component Styling

#### Styling Approach

- All layout component styling lives in `src/renderer/styles/components/elements/layout.scss`
- Styling is encapsulated within components (no external style leakage)
- Existing SCSS patterns and variables are reused
- BEM methodology for class naming (`page`, `page-container`, `page-title`, etc.)

#### SCSS Structure

**File**: `src/renderer/styles/components/elements/layout.scss`

```scss
// Page Component
.page {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 2rem;
  gap: 1rem;

  &.centered {
    align-items: center;
    justify-content: flex-start;
  }
}

.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
  text-align: left;

  .page.centered & {
    text-align: center;
  }
}

// Section Component
.section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 4px;
  background-color: var(--color-bg-secondary);

  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}
```

#### Integration

- Import `layout.scss` in main stylesheet or component entry point
- Ensure color variables are defined in `src/renderer/styles/variables.scss`
- Test styling with both light and dark themes

---

### 3. Test Pages

#### `PageTestPage.tsx`

**Purpose**: Interactive test page for validating `Page` component behavior and props.

**File**: `src/renderer/testing-active/PageTestPage.tsx`

**Structure**:

```tsx
import React, { useState } from 'react';
import { Page } from '../components/elements';
import {
  TestPageLayout,
  TestControls,
  TestRendering,
  TestValidation,
} from '../testing-active/test-page-utils';

export default function PageTestPage(): React.ReactElement {
  const [props, setProps] = useState({
    title: 'Test Page',
    centered: true,
    className: '',
  });

  const updateProp = (key: string, value: unknown): void => {
    setProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <TestPageLayout testId="page-test-page">
      {/* Controls section for manipulating props */}
      <TestControls>
        <label>
          Title:
          <input
            type="text"
            value={props.title}
            onChange={(e) => updateProp('title', e.target.value)}
            data-testid="page-test-title-input"
          />
        </label>

        <label>
          Centered:
          <input
            type="checkbox"
            checked={props.centered}
            onChange={(e) => updateProp('centered', e.target.checked)}
            data-testid="page-test-centered-input"
          />
        </label>

        <label>
          Class Name:
          <input
            type="text"
            value={props.className}
            onChange={(e) => updateProp('className', e.target.value)}
            data-testid="page-test-className-input"
          />
        </label>
      </TestControls>

      {/* Rendering section showing the component */}
      <TestRendering>
        <Page
          title={props.title}
          centered={props.centered}
          className={props.className}
          testId="page-component-under-test"
        >
          <p>Page content goes here.</p>
        </Page>
      </TestRendering>

      {/* Validation section for checking results */}
      <TestValidation>
        <div data-testid="page-test-validation-title">
          Title Rendered: {props.title ? 'Yes' : 'No'}
        </div>
        <div data-testid="page-test-validation-centered">
          Centered Class Applied: {props.centered ? 'Yes' : 'No'}
        </div>
      </TestValidation>
    </TestPageLayout>
  );
}
```

**Test Controls Provided**:

- Title text input
- Centered checkbox
- Optional className input
- (Future) Children content editor

---

#### `SectionTestPage.tsx`

**Purpose**: Interactive test page for validating `Section` component behavior.

**File**: `src/renderer/testing-active/SectionTestPage.tsx`

**Similar structure to PageTestPage**:

- Section title input
- Visibility toggle
- Validation section

---

#### Test Page Utilities

**File**: `src/renderer/testing-active/test-page-utils.tsx`

```tsx
import React from 'react';

export const TestPageLayout: React.FC<{
  children: React.ReactNode;
  testId: string;
}> = ({ children, testId }) => (
  <div className="test-page" data-testid={testId}>
    <h1>Component Test Page</h1>
    {children}
  </div>
);

export const TestControls: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="test-controls" data-testid="test-controls">
    <h2>Controls</h2>
    {children}
  </div>
);

export const TestRendering: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="test-rendering" data-testid="test-rendering">
    <h2>Rendering</h2>
    {children}
  </div>
);

export const TestValidation: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="test-validation" data-testid="test-validation">
    <h2>Validation</h2>
    {children}
  </div>
);
```

---

### 4. BDD Feature Tests

#### Feature File: `page-component.feature`

**File**: `tests/bdd/business-logic/features/components/page-component.feature`

```gherkin
Feature: Page Layout Component
  As a developer
  I want to use the Page component to structure pages consistently
  So that page layouts are uniform and maintainable

  Background:
    Given I am a tester user
    And I navigate to the Page test page

  Scenario: Page renders with title
    When I set the title property to "Test Page"
    Then the Page component should display the title "Test Page"
    And the title should use the "page-title" CSS class

  Scenario: Page renders centered when centered is true
    When I set the centered property to true
    Then the Page component should have the "centered" CSS class
    And the Page component should have the "page" CSS class

  Scenario: Page renders without centered class when centered is false
    When I set the centered property to false
    Then the Page component should not have the "centered" CSS class
    And the Page component should have the "page" CSS class

  Scenario: Page renders children content
    Then the Page component should render child content
    And the child content should be visible

  Scenario: Page applies custom className
    When I set the className property to "custom-page-class"
    Then the Page component should have the "custom-page-class" CSS class

  Scenario: Page uses semantic main element
    Then the Page component should use the "main" HTML element
```

---

#### Feature File: `section-component.feature`

**File**: `tests/bdd/business-logic/features/components/section-component.feature`

```gherkin
Feature: Section Layout Component
  As a developer
  I want to use the Section component to group related content
  So that page sections are semantically structured

  Background:
    Given I am a tester user
    And I navigate to the Section test page

  Scenario: Section renders with title
    When I set the title property to "API Keys"
    Then the Section component should display the title "API Keys"
    And the title should use the "section-title" CSS class

  Scenario: Section renders without title when title is not provided
    When I set the title property to ""
    Then the Section component should not display a title element

  Scenario: Section renders children content
    Then the Section component should render child content
    And the child content should be visible

  Scenario: Section uses semantic section element
    Then the Section component should use the "section" HTML element
    And the section should have the "section" CSS class

  Scenario: Section applies custom className
    When I set the className property to "custom-section-class"
    Then the Section component should have the "custom-section-class" CSS class
```

---

### 5. Step Definitions

#### File: `tests/bdd/business-logic/steps/component-testing.ts`

```tsx
import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../support/world';
import { TesterPersona } from '../../business-flow/personas/tester';

Given('I am a tester user', async function (this: World) {
  this.persona = new TesterPersona(this);
  this.world.getStateStore('tester').set('personaType', 'tester');
});

When('I navigate to the {word} test page', async function (this: World, componentName: string) {
  await this.persona.navigateToTestPage(componentName);
});

When(
  'I set the {word} property to {string}',
  async function (this: World, propName: string, value: string) {
    const selector = `[data-testid="${componentName}-test-${propName}-input"]`;
    const page = this.persona.page;

    // Handle checkboxes differently than text inputs
    const element = await page.$(`input[type="checkbox"]${selector}`);
    if (element) {
      const isChecked = await element.isChecked?.();
      const shouldBeChecked = value === 'true';
      if (isChecked !== shouldBeChecked) {
        await element.click();
      }
    } else {
      // Text input
      await page.fill(selector, value);
    }
  },
);

Then(
  'the {word} component should display the title {string}',
  async function (this: World, componentName: string, title: string) {
    const page = this.persona.page;
    const titleElement = await page.$(
      `[data-testid="${componentName}-component-under-test"] .${componentName}-title`,
    );
    const text = await titleElement?.textContent();
    if (text !== title) {
      throw new Error(`Expected title "${title}", but got "${text}"`);
    }
  },
);

Then(
  'the {word} component should have the {string} CSS class',
  async function (this: World, componentName: string, className: string) {
    const page = this.persona.page;
    const element = await page.$(`[data-testid="${componentName}-component-under-test"]`);
    const classes = await element?.getAttribute('class');
    if (!classes?.includes(className)) {
      throw new Error(`Expected CSS class "${className}", but element has classes: "${classes}"`);
    }
  },
);

Then(
  'the {word} component should use the {string} HTML element',
  async function (this: World, componentName: string, elementType: string) {
    const page = this.persona.page;
    const element = await page.$(`[data-testid="${componentName}-component-under-test"]`);
    const tagName = await element?.evaluate((el) => el.tagName.toLowerCase());
    if (tagName !== elementType) {
      throw new Error(`Expected element type "${elementType}", but got "${tagName}"`);
    }
  },
);

Then(
  'the {word} component should render child content',
  async function (this: World, componentName: string) {
    const page = this.persona.page;
    const childContent = await page.$(`[data-testid="${componentName}-component-under-test"] p`);
    if (!childContent) {
      throw new Error('Expected child content not found');
    }
  },
);

Then(
  'the {word} component should not have the {string} CSS class',
  async function (this: World, componentName: string, className: string) {
    const page = this.persona.page;
    const element = await page.$(`[data-testid="${componentName}-component-under-test"]`);
    const classes = await element?.getAttribute('class');
    if (classes?.includes(className)) {
      throw new Error(`Expected CSS class "${className}" to NOT be present`);
    }
  },
);

Then(
  'the {word} component should not display a title element',
  async function (this: World, componentName: string) {
    const page = this.persona.page;
    const titleElement = await page.$(
      `[data-testid="${componentName}-component-under-test"] .${componentName}-title`,
    );
    if (titleElement) {
      throw new Error('Expected title element to not be rendered');
    }
  },
);
```

---

### 6. TesterPersona Extension

**File**: `tests/bdd/business-flow/personas/tester.ts`

```tsx
import { UserPersona } from './user-persona';
import { World } from '../support/world';

export class TesterPersona extends UserPersona {
  /**
   * Navigate to a component test page by name
   * @example
   * await persona.navigateToTestPage('page');  // Navigate to Page test page
   * await persona.navigateToTestPage('section'); // Navigate to Section test page
   */
  async navigateToTestPage(componentName: string): Promise<void> {
    const url = `http://localhost:${process.env.RENDERER_PORT || 3000}/testing/${componentName}`;
    await this.page.goto(url);
    await this.page.waitForSelector(`[data-testid="${componentName}-test-page"]`);
  }

  /**
   * Get the current test component state from the validation section
   */
  async getComponentState(): Promise<Record<string, unknown>> {
    const validationSection = await this.page.$('[data-testid="test-validation"]');
    const state: Record<string, unknown> = {};

    if (validationSection) {
      const lines = await validationSection.$$('[data-testid*="validation"]');
      for (const line of lines) {
        const text = await line.textContent();
        // Parse validation text like "Title Rendered: Yes"
        const [key, value] = text?.split(':') ?? [];
        if (key && value) {
          state[key.trim()] = value.trim();
        }
      }
    }

    return state;
  }

  /**
   * Verify that a CSS class is applied to the test component
   */
  async assertComponentHasClass(componentName: string, className: string): Promise<void> {
    const selector = `[data-testid="${componentName}-component-under-test"]`;
    const element = await this.page.$(selector);
    const classes = await element?.getAttribute('class');

    if (!classes?.includes(className)) {
      throw new Error(`Expected component to have class "${className}", but got: "${classes}"`);
    }
  }

  /**
   * Verify that a CSS class is NOT applied to the test component
   */
  async assertComponentNotHasClass(componentName: string, className: string): Promise<void> {
    const selector = `[data-testid="${componentName}-component-under-test"]`;
    const element = await this.page.$(selector);
    const classes = await element?.getAttribute('class');

    if (classes?.includes(className)) {
      throw new Error(
        `Expected component NOT to have class "${className}", but it does: "${classes}"`,
      );
    }
  }
}
```

---

### 7. Migration Strategy

#### Target Pages for Phase 1

1. **BackgroundTasksPage**
2. **SettingsPage**
3. **StyleboardPage**

#### Migration Steps

**Step 1: Update Component Imports**

Before:

```tsx
import React from 'react';
import { useI18n } from '../i18n-context';
```

After:

```tsx
import React from 'react';
import { useI18n } from '../i18n-context';
import { Page, Section } from '../components/elements/layout';
```

---

**Step 2: Replace Page Wrapper**

Before:

```tsx
const BackgroundTasksPage: React.FC = () => {
  return (
    <div className="page centered" data-testid="page-background-tasks">
      <div className="page-container">
        <h1 className="page-title">{t('page.backgroundTasks')}</h1>
        {/* content */}
      </div>
    </div>
  );
};
```

After:

```tsx
const BackgroundTasksPage: React.FC = () => {
  return (
    <Page title={t('page.backgroundTasks')} centered testId="page-background-tasks">
      {/* content */}
    </Page>
  );
};
```

---

**Step 3: Replace Section Wrappers**

Before:

```tsx
<section className="section">
  <h2 className="section-title">{t('section.activeTask')}</h2>
  {/* content */}
</section>
```

After:

```tsx
<Section title={t('section.activeTask')}>{/* content */}</Section>
```

---

**Step 4: Validate Component Rendering**

- Run component rendering tests
- Compare before/after in browser
- Ensure all CSS classes are applied correctly
- Verify data-testid attributes are present

---

#### Validation Checklist

- [ ] All pages import layout components
- [ ] All page wrappers use `Page` component
- [ ] All sections use `Section` component
- [ ] Page titles use component-provided rendering
- [ ] Section titles use component-provided rendering
- [ ] All testId values are preserved
- [ ] Styling visually matches original
- [ ] No console errors during page navigation

---

### 8. Implementation Order

#### Week 1: Component Development

1. Create `src/renderer/components/elements/layout/` directory structure
2. Implement `Page.tsx` component
3. Implement `Section.tsx` component
4. Implement `PageTitle.tsx` component
5. Implement `SectionTitle.tsx` component
6. Create `index.ts` barrel export
7. Add SCSS styling to `src/renderer/styles/components/elements/layout.scss`
8. Validate component rendering in isolation

#### Week 2: Test Infrastructure

1. Create `PageTestPage.tsx` in `src/renderer/testing-active/`
2. Create `SectionTestPage.tsx` in `src/renderer/testing-active/`
3. Create `test-page-utils.tsx` helper module
4. Register test pages in `testing-active/index.ts`
5. Validate test pages are accessible and interactive
6. Create test page styling in `src/renderer/styles/components/test-pages.scss`

#### Week 3: BDD Tests

1. Create `tests/bdd/business-logic/features/components/` directory
2. Create `page-component.feature` file
3. Create `section-component.feature` file
4. Extend `tests/bdd/business-logic/steps/component-testing.ts` with step definitions
5. Create `TesterPersona` in `tests/bdd/business-flow/personas/tester.ts`
6. Run feature tests against test pages
7. Iterate on scenarios based on test results

#### Week 4: Migration & Validation

1. Migrate `BackgroundTasksPage` to use new components
2. Migrate `SettingsPage` to use new components
3. Migrate `StyleboardPage` to use new components
4. Run existing feature tests to ensure no regressions
5. Run new component tests
6. Visual regression testing (browser comparison)
7. Performance testing (if applicable)

---

## Success Criteria

### Component Implementation

- [ ] All four layout components created and exported
- [ ] Components render without console errors
- [ ] Components apply correct CSS classes
- [ ] Components support all specified props
- [ ] Components are properly typed with JSDoc
- [ ] Components use semantic HTML elements

### Test Pages

- [ ] Test pages are accessible and navigable
- [ ] Test pages support property manipulation
- [ ] Test pages display validation results
- [ ] Test pages have consistent styling
- [ ] Test pages are registered in testing module

### BDD Features

- [ ] All feature scenarios pass
- [ ] Step definitions are reusable
- [ ] TesterPersona works with test pages
- [ ] Feature tests work in both Electron and browser modes
- [ ] Test report is clean (no warnings)

### Migration

- [ ] All existing pages migrated without functional changes
- [ ] Visual appearance matches original
- [ ] All page testIds preserved
- [ ] No console errors after migration
- [ ] Existing BDD tests still pass
- [ ] Component test pages pass all scenarios

### Code Quality

- [ ] Components follow established patterns (see [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md))
- [ ] SCSS follows project conventions
- [ ] No unused variables or imports
- [ ] Component files are properly organized
- [ ] Barrel exports are complete

---

## Validation Flow

**Before starting implementation**:

1. Review this proposal against existing component patterns
2. Confirm styling approach with design system
3. Validate test page structure with test infrastructure team
4. Get approval on migration order and scope

**During implementation**:

1. After component creation, run isolated rendering tests
2. After test pages, validate interactive property manipulation
3. After BDD features, run full feature test suite
4. After migration, run visual regression testing

**Before marking Phase 1 complete**:

1. Run `npm run test:features` — all component tests pass
2. Run `npm run test:features:browser` — all tests pass in browser mode
3. Visual inspection of migrated pages
4. Review code for patterns and consistency
5. Check for accessibility compliance (keyboard navigation, ARIA labels)
6. Document any edge cases or known limitations

---

## Questions & Decisions Needed

1. **Test Page Visibility**: Should test pages be visible in the AppLayout menu for development, or only accessible via direct URL?
   - Option A: Add "Testing" menu section with collapsible test pages
   - Option B: Keep test pages hidden, only accessible via `/testing/{componentName}` URL

2. **Component Variant Strategy**: Should layout components support additional variants (e.g., `Page` with `variant="compact"`), or keep styling unified?
   - Option A: Support variants for future flexibility
   - Option B: Keep styling simple, add variants in later phases if needed

3. **Accessibility Features**: Should we include additional ARIA attributes (e.g., `role="main"` on Page, `role="region"` on Section)?
   - Option A: Include semantically appropriate ARIA attributes
   - Option B: Rely on semantic HTML elements alone

4. **Test Page Controls**: Should test pages support more complex prop manipulation (e.g., content editors), or keep controls simple?
   - Option A: Simple inputs only (text, checkbox)
   - Option B: Rich content editor for testing complex children

5. **CSS Organization**: Should layout component styles be in a separate file or bundled with other element styles?
   - Option A: Separate `src/renderer/styles/components/elements/layout.scss`
   - Option B: Unified `src/renderer/styles/components/elements.scss`

---

## Dependencies & Prerequisites

- Phase 0 (Test Infrastructure) must be complete
- AppLayout must support page registry from Phase 0
- Test page registration must be functional
- Build scripts for test module swapping must be working

---

## Timeline

**Estimated Duration**: ~3-4 weeks (1 sprint per week as specified, plus buffer for validation)

**Critical Path**:

1. Component implementation (5 days)
2. Test page setup (5 days)
3. BDD feature development (5 days)
4. Migration & validation (5 days)

---

## Rollback Plan

If Phase 1 encounters blocking issues:

1. Keep existing page structure in place
2. Create layout components but don't migrate pages
3. Move to Phase 2 with different focus area
4. Return to layout component migration after Phase 2 or 3
5. No data loss or functional regression expected

---

## Next Steps After Approval

Once this proposal is approved:

1. Schedule component design review
2. Create component files and directory structure
3. Implement `Page` and `Section` components
4. Validate styling approach
5. Create test pages and validate test infrastructure
6. Create and iterate on BDD features
7. Begin migration of existing pages
8. Coordinate with Phase 2 planning if overlap is expected

---

## References

- [COMPONENTS_PROPOSAL.md](COMPONENTS_PROPOSAL.md) — Full component library overview
- [COMPONENTS_PHASE_0_PROPOSAL.md](COMPONENTS_PHASE_0_PROPOSAL.md) — Test infrastructure setup
- [ARCHITECTURE_ANALYSIS.md](ARCHITECTURE_ANALYSIS.md) — System architecture and patterns
- [TESTING.md](TESTING.md) — BDD testing patterns and conventions
