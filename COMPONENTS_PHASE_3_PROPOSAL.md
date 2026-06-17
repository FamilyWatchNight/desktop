# Phase 3 Proposal — Navigation & Button Components

## Summary

Phase 3 delivers reusable navigation and button components plus dedicated test pages and BDD scenarios. It includes `MenuItem`, `ExpandableMenuSection`, `Button`, and `ButtonGroup`, icon assets, SCSS, and integration changes to AppLayout and the testing registration so the renderer uses the new components and exposes test pages for BDD-driven UI validation.

## Goals

- Provide semantic, accessible, and themeable navigation components.
- Centralize menu badge and expand/collapse logic.
- Standardize button variants and spacing across the app.
- Provide test pages that let QA and BDD scenarios exercise navigation and button behavior.
- Migrate `AppLayout` to use new components with minimal runtime risk.

## Deliverables

- Components:
  - `src/renderer/components/elements/navigation/MenuItem.tsx`
  - `src/renderer/components/elements/navigation/ExpandableMenuSection.tsx`
  - `src/renderer/components/elements/buttons/Button.tsx`
  - `src/renderer/components/elements/buttons/ButtonGroup.tsx`
- Icons: `src/renderer/components/elements/icons/icons.tsx` (exports named icons)
- Styles: SCSS files under `src/renderer/styles/components/elements/navigation.scss` and `buttons.scss`
- Test pages: `src/renderer/testing-active/MenuItemTestPage.tsx`, `ExpandableMenuSectionTestPage.tsx`, `ButtonTestPage.tsx`
- BDD feature files and step definitions under `tests/bdd/business-logic/features/component-navigation.feature` and `tests/bdd/business-logic/steps/component-navigation.steps.ts`
- AppLayout migration patch that replaces repeated menu markup with `MenuItem` and `ExpandableMenuSection` (small, incremental commit)

## Component API Specifications

All components accept an optional `testId?: string` prop that maps to `data-testid`.

1. `MenuItem`

Props:

- `label: React.ReactNode` — visible label
- `icon?: React.ReactNode` — optional icon element
- `badge?: number` — optional count badge (hidden for `0` or `undefined`)
- `pageId?: string` — optional canonical page identifier registered in the PageRegistry
- `isActive?: boolean` — active state styling (if provided, overrides registry-derived state)
- `onClick?: () => void` — fallback click handler (used if no `pageId` present)
- `className?: string` — optional extra classes for edge-cases
- `testId?: string`

Behavior and accessibility:

- Renders an accessible `button` element by default (or `a` if `href` later added).
- If `pageId` is provided, the component derives `isActive` and navigation behavior from the application's `PageRegistry` (see PageRegistry integration below). When clicked it calls `registry.navigateTo(pageId)`; if an explicit `isActive` prop is provided it takes precedence.
- Keyboard-focusable, exposes `aria-current="page"` when active.
- Badge visually hidden for zero count; `aria-label` on the badge conveys count to screen readers.
- Icon container has `aria-hidden="true"` unless `ariaLabel` provided on the icon.

PageRegistry integration and initialization:

- The app exposes a `PageRegistry` module and React context/hook to enable `MenuItem(pageId)` usage. Suggested files and API:
  - File: `src/renderer/components/pageRegistry.ts` — exports registry implementation and type definitions.
  - Hook: `usePageRegistry()` — returns `{ currentPageId: string | null; navigateTo: (pageId: string) => void; getPageMeta?: (pageId: string) => PageMeta | undefined }`.
  - Provider: `PageRegistryProvider` — created by the registry and mounted at app root (e.g., in `src/renderer/index.tsx` or `src/renderer/App.tsx`) so `MenuItem` can call `usePageRegistry()` safely.

- Registration: pages register themselves on startup via `registry.registerPage(pageId, meta)`; test pages can register stub pages during test setup.
- AppLayout integration: `AppLayout` should ensure registry is initialized before rendering the menu. During migration, swap individual menu items to the `pageId`-based `MenuItem` pattern to validate behavior incrementally.
- Testing: unit tests can stub `usePageRegistry()` to control `currentPageId` and `navigateTo` behavior without wiring the full registry.

2. `ExpandableMenuSection`

Props:

- `label: React.ReactNode`
- `isExpanded?: boolean`
- `onExpandedChange?: (expanded: boolean) => void`
- `children: React.ReactNode`
- `testId?: string`

Behavior and accessibility:

- Manages expand/collapse state when `isExpanded` is uncontrolled.
- Emits `onExpandedChange` on toggle.
- Renders a `button` for the header with `aria-expanded` and a region with `role="region"` and `aria-hidden` toggled.
- Chevron icon rotates using CSS transition.

3. `Button`

Props:

- `variant?: 'primary'|'secondary'|'danger'|'success'|'link'` — visual variants
- `size?: 'small'|'medium'|'large'`
- `disabled?: boolean`
- `onClick?: React.MouseEventHandler<HTMLButtonElement>`
- `type?: 'button'|'submit'|'reset'`
- `className?: string`
- `testId?: string`

Behavior:

- Variant controls background/border and text color using SCSS variables.
- Applies focus ring and accessible `:focus-visible` styles.
- Supports `aria-*` passthrough via rest props.

4. `ButtonGroup`

Props:

- `children: React.ReactNode`
- `align?: 'left'|'center'|'right'`
- `spacing?: 'compact'|'normal'`
- `testId?: string`

Behavior:

- Horizontal flex container with consistent spacing and wrap behavior.

## Styling & Theming

- Add SCSS variables/mixins to `src/renderer/styles/components/_variables.scss` if missing: button colors, spacing tokens, badge sizes, chevron transition timing.
- New files:
  - `src/renderer/styles/components/elements/navigation.scss`
  - `src/renderer/styles/components/elements/buttons.scss`
  - Optional `_icons.scss` for icon sizing utilities
- Components add internal classnames (BEM-like) to avoid global collisions. Example: `.fw-menu-item`, `.fw-expandable-section`, `.fw-button`, `.fw-button-group`.

## Test Pages

- Create interactive test pages under `src/renderer/testing-active/` to manipulate props and observe behavior:
  - `MenuItemTestPage.tsx`: controls for label text, badge count, isActive toggle, and click handler that logs events to the page
  - `ExpandableMenuSectionTestPage.tsx`: controls for toggling `isExpanded`, adding/removing children, and keyboard interaction testing
  - `ButtonTestPage.tsx`: controls for variant, size, disabled state, and usage inside `ButtonGroup`

- Register them via the existing test page registry API used in Phase 0-2 (call `registerTestPages` and `buildTestingMenu`).

## BDD & Unit Tests

- Scope and distinction:
  - Unit tests (layout-only):
    - Render `MenuItem` with props and assert presence of label, icon, badge text, and classnames for `isActive`.
    - Assert ARIA attributes: `aria-current`, `aria-expanded` for section header, badge `aria-label`.
    - Stub `usePageRegistry()` to assert that clicking a `MenuItem` with `pageId` calls `navigateTo(pageId)` (mocking the hook).
    - Snapshot tests for markup and class names.
    - Small, fast tests for `Button` variants and `ButtonGroup` spacing.

  - BDD / Integration tests (complex interactions):
    - Keyboard navigation across menu items in the real `AppLayout` (focus movement, Enter/Space triggers navigation).
    - Expand/collapse behavior across nested `ExpandableMenuSection` items (state persistence, ARIA announcements).
    - End-to-end navigation flow that verifies the view changes when `registry.navigateTo(pageId)` occurs.
    - Visual/regression checks when migrating `AppLayout` items to the new components.

- BDD feature `component-navigation.feature` scenarios (examples):
  - MenuItem highlights when `isActive` set via registry current page.
  - Badge count updates and is announced to assistive tech.
  - Expandable section toggles with mouse and keyboard and fires `onExpandedChange`.
  - Button variants present correct styling and `disabled` blocks clicks.

- Implement step definitions under `tests/bdd/business-logic/steps/component-navigation.steps.ts` using existing `TesterPersona` / `UserPersona` patterns. Use `TesterPersona` to register test pages with the `PageRegistry` during scenario setup.

- Unit tests (Jest/React Testing Library) to implement:
  - `MenuItem` accessibility attributes, registry-derived `isActive`, and click behavior (mock `usePageRegistry()`).
  - `ExpandableMenuSection` keyboard handling and ARIA toggles.
  - `Button` variant classes and disabled behavior.

## AppLayout Migration Strategy

Objective: Replace duplicated menu markup with `MenuItem` and `ExpandableMenuSection` while keeping the change small and reversible.

Steps:

1. Create components and tests behind feature branch `feat/modularize-navigation`.
2. Add `MenuItem` and `ExpandableMenuSection` files and SCSS; do not modify `AppLayout` yet.
3. Add test pages and BDD tests that target the new components directly.
4. Make an incremental change in `AppLayout` that imports `MenuItem` and swaps one menu item (e.g., Home) to use it. Run `npm run build:main` and run unit tests.
5. Swap remaining menu items and system section behind a single smaller commit.
6. Run full test suite and BDD scenarios.

Rollback: Keep each swap as its own commit so reverting is trivial if issues appear.

## Files To Create / Modify

- New/created files:
  - `src/renderer/components/elements/navigation/MenuItem.tsx`
  - `src/renderer/components/elements/navigation/ExpandableMenuSection.tsx`
  - `src/renderer/components/elements/buttons/Button.tsx`
  - `src/renderer/components/elements/buttons/ButtonGroup.tsx`
  - `src/renderer/components/elements/icons/icons.tsx` (or extend existing icons file)
  - `src/renderer/testing-active/MenuItemTestPage.tsx`
  - `src/renderer/testing-active/ExpandableMenuSectionTestPage.tsx`
  - `src/renderer/testing-active/ButtonTestPage.tsx`
  - `src/renderer/styles/components/elements/navigation.scss`
  - `src/renderer/styles/components/elements/buttons.scss`
  - `tests/bdd/business-logic/features/component-navigation.feature`
  - `tests/bdd/business-logic/steps/component-navigation.steps.ts`

- Modified files:
  - `src/renderer/components/AppLayout.tsx` (incremental swaps)
  - `src/renderer/testing-active/index.ts` (register new test pages)

## Accessibility Considerations

- `MenuItem` must set `aria-current="page"` when active.
- `ExpandableMenuSection` header button sets `aria-expanded` and toggles `aria-hidden` on the content region.
- Badges should include `aria-label="X notifications"` when visible; hide visual-only punctuation from screen readers.
- Buttons must implement `:focus-visible` styles and ensure color contrast meets WCAG 2.1 AA.

## Acceptance Criteria

- New components exist and are covered by unit tests (>= 80% branch coverage for new files).
- Test pages load in development and expose controls to exercise props.
- BDD scenarios for navigation and buttons pass locally.
- `AppLayout` menu uses `MenuItem` and `ExpandableMenuSection` for all items.
- No regressions in existing navigation tests.

## Risks & Mitigations

- Risk: Visual regressions in menu styling. Mitigation: implement incremental migration and review screenshots on each swap.
- Risk: Accessibility regressions. Mitigation: run axe checks in unit tests and validate BDD keyboard scenarios.
- Risk: Merge conflicts with other refactors. Mitigation: keep commits small, document the migration plan in PR description.

## Staged Implementation & Validation

The work will be implemented in small, self-contained stages so each commit can be validated independently. Each stage lists files to add/modify, commit naming suggestions, validation steps, and tests to run.

- Stage 1 — PageRegistry & Hook
  - Commit: `feat/nav-stage-1-page-registry`
  - What: Add `src/renderer/components/pageRegistry.ts`, `usePageRegistry()` hook, `PageRegistryProvider`, and types. Mount the provider at app root (e.g., `src/renderer/App.tsx`).
  - Validation: unit tests for registry APIs, mock registration flow. Smoke-run dev server to ensure no break.
  - Tests: Jest unit tests for registry behavior; no BDD required.

- Stage 2 — Core `MenuItem`, `Button`, `ButtonGroup`
  - Commit: `feat/nav-stage-2-menu-button-core`
  - What: Implement `MenuItem.tsx`, `Button.tsx`, `ButtonGroup.tsx`, basic SCSS tokens, and minimal icons file.
  - Validation: unit tests for rendering, snapshots, `usePageRegistry()` stubbed to assert `navigateTo` is called when a `MenuItem` with `pageId` is clicked.
  - Tests: Jest/RTL unit tests and axe accessibility checks.

- Stage 3 — `ExpandableMenuSection` and icons
  - Commit: `feat/nav-stage-3-expandable-icons`
  - What: Implement `ExpandableMenuSection.tsx`, chevron animation CSS, full `icons.tsx` exports.
  - Validation: unit tests for keyboard handling and ARIA attributes; visual spot-check in dev.
  - Tests: Jest/RTL and axe checks.

- Stage 4 — Test Pages + Registry Integration
  - Commit: `feat/nav-stage-4-test-pages`
  - What: Add `MenuItemTestPage.tsx`, `ExpandableMenuSectionTestPage.tsx`, `ButtonTestPage.tsx` and register them in `src/renderer/testing-active/index.ts` using PageRegistry APIs.
  - Validation: Manually exercise test pages in dev, ensure registry registration is effective, run component-specific BDD features against test pages.
  - Tests: Run BDD subset that targets component test pages (e.g., `npm run test:features -- --tags "@component-nav"`).

- Stage 5 — AppLayout Incremental Migration
  - Commit pattern: `chore/nav-migrate-<item>` (one commit per swapped item)
  - What: Replace one menu item at a time in `src/renderer/components/AppLayout.tsx` with `MenuItem(pageId)`, verify behavior, then proceed to next item. Migrate `ExpandableMenuSection` for system group last.
  - Validation: After each swap run `npm run build:main`, unit tests, and a quick manual navigation validation. Keep commits small for easy rollback.
  - Tests: Run full unit test suite and the BDD navigation scenarios that exercise AppLayout navigation.

- Stage 6 — Final polish, coverage, and PR
  - Commit: `feat/nav-stage-6-finish`
  - What: Complete SCSS refinements, update docs, expand snapshots, ensure coverage thresholds, and tidy exports (barrel `index.ts`).
  - Validation: Full CI run, ensure no regressions, prepare PR description with migration notes and reviewers.
  - Tests: Full test suite (unit + BDD), visual/regression checks if available.

Rollback guidance: Keep each stage as a focused commit. If a regression is found, revert the single offending commit and re-evaluate.

## Next Steps

1. Review and approve this proposal.
2. Assign owner and branch name (suggest `feat/components-navigation`).
3. Implement Phase 3 per TODO plan.

---

Proposal authored to align with earlier component phases and test infrastructure. See [COMPONENTS_PROPOSAL.md](COMPONENTS_PROPOSAL.md) for overall roadmap.
