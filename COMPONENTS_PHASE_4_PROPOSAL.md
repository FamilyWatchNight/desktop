<!--
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
-->

# Phase 4 Proposal — Feedback & Container Components

## Goal

Implement the reusable feedback and container components required to standardize status messaging, progress display, badge counts, and list/card layout primitives across the renderer UI.

This phase builds on Phases 0–3 by completing the component library for the remaining common UI patterns used by `BackgroundTasksPage` and other feature pages.

## Scope

Phase 4 focuses on:

- Feedback components: `Message`, `ProgressBar`, `Badge`
- Container components: `Card`, `List`, `ListItem`
- Layout wrapper components: `Stack`, `Grid`, and an optional low-level `Box`/`Container` wrapper
- Test pages for these components in the existing renderer test page infrastructure
- BDD and unit tests for behavior, accessibility, and styling
- Migration of `BackgroundTasksPage` and any other pages that use repeated status / list markup
- SCSS and style tokens for new component families

## Problem Statement

The current codebase still repeats several UI patterns that should be extracted into reusable components:

- status and validation messages rendered manually on multiple pages
- progress bars with inline style logic and duplicated markup
- count badges implemented directly in menu and list code
- repeated list and list-item layouts for task queues and detail lists
- ad hoc cards for grouped content instead of a shared container primitive

This duplication increases maintenance cost, reduces visual consistency, and makes behavior harder to test.

## Deliverables

### Components

Create the following component files:

- `src/renderer/components/elements/feedback/Message.tsx`
- `src/renderer/components/elements/feedback/ProgressBar.tsx`
- `src/renderer/components/elements/feedback/Badge.tsx`
- `src/renderer/components/elements/containers/Card.tsx`
- `src/renderer/components/elements/containers/List.tsx`
- `src/renderer/components/elements/containers/ListItem.tsx`
- `src/renderer/components/elements/layout/Stack.tsx`
- `src/renderer/components/elements/layout/Grid.tsx`
- `src/renderer/components/elements/feedback/index.ts`
- `src/renderer/components/elements/containers/index.ts`
- `src/renderer/components/elements/layout/index.ts`

### Styles

Add dedicated SCSS files:

- `src/renderer/styles/components/elements/feedback.scss`
- `src/renderer/styles/components/elements/containers.scss`
- `src/renderer/styles/components/elements/layout.scss`

If needed, extend shared style variables in the existing component style entrypoints.

### Test Pages

Add renderer test pages under the existing test page registry:

- `src/renderer/testing-active/MessageTestPage.tsx`
- `src/renderer/testing-active/ProgressBarTestPage.tsx`
- `src/renderer/testing-active/BadgeTestPage.tsx`
- `src/renderer/testing-active/CardTestPage.tsx`
- `src/renderer/testing-active/ListTestPage.tsx`
- `src/renderer/testing-active/StackTestPage.tsx`
- `src/renderer/testing-active/GridTestPage.tsx`

Register these pages through `src/renderer/testing-active/index.ts`.

### Tests

Add or extend tests in both unit and BDD layers:

- unit test coverage for new components in `tests/unit/`
- BDD feature files under `tests/bdd/business-logic/features/`
- step definitions under `tests/bdd/business-logic/steps/`

## Component Specifications

### `Message`

**Purpose:** centralize inline status and alert messages with semantic variants.

**Props:**

- `type?: 'success' | 'error' | 'info' | 'warning'`
- `children: React.ReactNode`
- `testId?: string`
- `className?: string`

**Behavior:**

- renders a semantic wrapper such as `<div role="status">`
- applies variant styles for success, error, info, warning
- uses a stable `data-testid` when provided
- supports optional custom class names for visual variants

**Accessibility:**

- includes `role="status"` and `aria-live="polite"`
- non-focusable by default, but usable within forms and task UIs

### `ProgressBar`

**Purpose:** unify determinate and indeterminate progress display.

**Props:**

- `current?: number`
- `max?: number`
- `isIndeterminate?: boolean`
- `showLabel?: boolean`
- `size?: 'small' | 'medium' | 'large'`
- `testId?: string`
- `className?: string`

**Behavior:**

- when `isIndeterminate=true`, render an animated indeterminate track
- when `current` and `max` are provided, compute percentage and render a width-based fill
- when `showLabel=true`, render a visible label such as `32%`
- gracefully handle missing values by rendering a low-impact indeterminate state

**Accessibility:**

- uses `role="progressbar"`
- includes `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for determinate progress
- includes `aria-busy="true"` for indeterminate state

### `Badge`

**Purpose:** reusable count/status badge for menus, lists, and inline labels.

**Props:**

- `value: string | null` # when `null` the badge is hidden; when empty string `""` the badge is shown with no contents
- `label?: string`
- `testId?: string`
- `className?: string`

**Behavior:**

- hidden when `value === null`
- displays `value` visually when non-null (empty string `""` shows the badge with no text)
- optionally renders `aria-label` using `label` if provided
- supports a compact visual style for placement inside other components

**Accessibility:**

- uses `aria-label` to expose the count if the badge is decorative
- uses `role="status"` when needed for dynamic count updates

### `Card`

**Purpose:** generic visual container with padding, border, and optional title.

**Props:**

- `title?: React.ReactNode`
- `children: React.ReactNode`
- `testId?: string`
- `className?: string`
- `footer?: React.ReactNode`

**Behavior:**

- renders a consistent container for grouped content
- optional header and footer slots for structured cards
- supports custom class names for layout variants

### `List`

**Purpose:** semantic list wrapper for grouped items.

**Props:**

- `children: React.ReactNode`
- `testId?: string`
- `className?: string`
- `isOrdered?: boolean`

**Behavior:**

- renders either `<ul>` or `<ol>` based on `isOrdered`
- applies consistent spacing and list styling
- supports an optional `className` for list variants

### `ListItem`

**Purpose:** reusable list item wrapper with optional actions.

**Props:**

- `children: React.ReactNode`
- `actions?: React.ReactNode`
- `testId?: string`
- `className?: string`
- `status?: 'normal' | 'subtle' | 'highlight'`

**Behavior:**

- renders a semantically correct `<li>` element
- arranges content and actions with flex layout
- supports a `status` prop for contextual styling

### Layout Wrapper Strategy

Purpose: implement explicit layout primitives that provide clear one-dimensional and two-dimensional container semantics while keeping `List` reserved for semantic lists.

What this project will implement:

- `Stack`: a first-class one-dimensional layout wrapper for vertical or horizontal spacing. `Stack` accepts `direction` (`"row" | "column"`), `gap`, `align`, and `justify` props.
- `Grid`: a first-class two-dimensional layout wrapper that maps to CSS Grid. `Grid` accepts `columns` (number or CSS template), `rows`, `gap`, and `autoFlow` props.
- `Box` (optional low-level wrapper): a minimal wrapper that forwards style props when callers need fine-grained control without creating new semantic meaning.

Why we implement this explicitly:

- Explicit components (`Stack`, `Grid`) make intent clear in code and are easier to document and test than a single `layout="..."` prop.
- `List` / `ListItem` remain semantic HTML list primitives with accessibility semantics; they are not replaced by generic layout wrappers.
- `Stack` and `Grid` will be implemented so they can later accept keyboard/coordinate navigation hooks without changing their external API.

Implementation note:

`Stack` should expose `direction`, `gap`, `wrap`, `align`, and `justify` props. `Grid` should expose `columns`, `rows`, `gap`, `autoFlow`, and `alignItems`/`justifyItems` props. Keep DOM output minimal (single wrapper element) to simplify focus and keyboard behavior.

## Test Page Specifications

Each test page should provide interactive controls for the component props and display the rendered component live.

### MessageTestPage

- toggles for `type` variants
- text input for message content
- a rendered preview area
- test ID output for automation

### ProgressBarTestPage

- current / max numeric controls
- selector for determinate vs indeterminate mode
- checkbox for `showLabel`
- rendered progress bar preview
- selector for `size` (`small|medium|large`)

### BadgeTestPage

- text input for `value` (string) and a toggle to set `null` (hidden)
- optional label text input
- preview inside a `MenuItem` or `ListItem`

### CardTestPage

- title input
- footer content toggle
- example card body content

### ListTestPage

- list type toggle (`ul` / `ol`)
- add/remove item controls
- example `ListItem` actions
- preview of nested `Badge` and `ProgressBar`

## Testing Strategy

### Unit tests

Add Jest/RTL tests for each new component that assert:

- correct rendering of expected markup and class names
- ARIA roles and accessibility attributes
- variant behavior and conditional rendering
- `ProgressBar` determinate/indeterminate handling
- `Badge` visibility for null and non-null `value`
- `Card` optional header/footer rendering
- `ListItem` action layout when actions are provided

### BDD tests

Create feature coverage for the new components in `tests/bdd/business-logic/features/`:

- `component-feedback.feature`
- `component-containers.feature`

Example scenarios:

- `Message` displays success and error variants with correct live region behavior
- `ProgressBar` updates percent when current and max change
- indeterminate `ProgressBar` emits `aria-busy=true`
- `Badge` only renders when `value` is non-null and announces the value through `aria-label` when provided
- `Card` renders a header and footer when props are supplied
- `List` and `ListItem` display actions consistently

Implement step definitions in `tests/bdd/business-logic/steps/component-feedback.steps.ts` and `component-containers.steps.ts` using the existing `TesterPersona` pattern.

### Integration tests

Use the new components to replace repeated markup in `BackgroundTasksPage` and validate:

- task queue and active task UI remain unchanged visually
- status messages use `Message` instead of manual markup
- progress and badges use the new primitives
- `Card` is used for grouped content blocks when appropriate

## Migration Plan

### Phase 4 staging

1. Component scaffolding
   - add feedback and container component files and exports
   - add SCSS styles and register them in the renderer style entrypoints

2. Unit tests and test pages
   - implement test pages and add unit coverage for all new components
   - validate interactive preview pages manually in development

3. `BackgroundTasksPage` migration
   - replace manual message blocks with `Message`
   - replace inline progress markup with `ProgressBar`
   - replace count badges with `Badge`
   - replace task queue markup with `List` / `ListItem`
   - optionally wrap discrete sections in `Card`

4. BDD coverage
   - add feature files and step definitions for all new components
   - run component test page scenarios and page migration scenarios

5. Final polish
   - verify styles, accessibility, and existing navigation/page behavior
   - update any documentation or README references to the new components

### Files to change

- `src/renderer/components/elements/feedback/Message.tsx`
- `src/renderer/components/elements/feedback/ProgressBar.tsx`
- `src/renderer/components/elements/feedback/Badge.tsx`
- `src/renderer/components/elements/containers/Card.tsx`
- `src/renderer/components/elements/containers/List.tsx`
- `src/renderer/components/elements/containers/ListItem.tsx`
- `src/renderer/components/elements/layout/Stack.tsx`
- `src/renderer/components/elements/layout/Grid.tsx`
- `src/renderer/components/elements/feedback/index.ts`
- `src/renderer/components/elements/containers/index.ts`
- `src/renderer/components/elements/layout/index.ts`
- `src/renderer/testing-active/MessageTestPage.tsx`
- `src/renderer/testing-active/ProgressBarTestPage.tsx`
- `src/renderer/testing-active/BadgeTestPage.tsx`
- `src/renderer/testing-active/CardTestPage.tsx`
- `src/renderer/testing-active/ListTestPage.tsx`
- `src/renderer/testing-active/StackTestPage.tsx`
- `src/renderer/testing-active/GridTestPage.tsx`
- `src/renderer/testing-active/index.ts`
- `src/renderer/styles/components/elements/feedback.scss`
- `src/renderer/styles/components/elements/containers.scss`
- `tests/unit/feedback.*.test.tsx`
- `tests/unit/containers.*.test.tsx`
- `tests/bdd/business-logic/features/component-feedback.feature`
- `tests/bdd/business-logic/features/component-containers.feature`
- `tests/bdd/business-logic/steps/component-feedback.steps.ts`
- `tests/bdd/business-logic/steps/component-containers.steps.ts`
- `src/renderer/components/pages/BackgroundTasksPage.tsx`

## Acceptance Criteria

- New feedback and container components are implemented and exported consistently with the existing component library.
- New render tests exist for each component and cover their variant behavior and accessibility semantics.
- Renderer test pages for all new components are available and registered.
- `BackgroundTasksPage` uses the new primitives instead of repeated markup.
- BDD scenarios for feedback and container components pass locally.
- No regressions in the existing UI component suite or page navigation after migration.

## Risks and Mitigations

- Risk: visual drift when migrating `BackgroundTasksPage` markup. Mitigation: keep migration incremental and visually compare before-and-after sections.
- Risk: missing ARIA semantics on progress or badges. Mitigation: enforce required props and add explicit unit tests for `role`, `aria-valuenow`, `aria-label`, and `aria-live`.
- Risk: style collisions with existing pages. Mitigation: scope class names and align variables with the existing component style system.

## Timeline Estimate

- Component implementation and initial tests: 2 days
- Test page and BDD coverage: 1 day
- BackgroundTasksPage migration and validation: 1 day
- Final polish and review: 0.5 day

## Next Steps

1. Review and approve this Phase 4 proposal.
2. Create the new component files and SCSS modules.
3. Add renderer test pages and register them in the active testing module.
4. Migrate `BackgroundTasksPage` to use the new primitives.
5. Run unit and BDD tests to verify the implementation.
