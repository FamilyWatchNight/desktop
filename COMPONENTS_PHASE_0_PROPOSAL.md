<!--
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
-->

# Phase 0 Proposal: Renderer Component Test Infrastructure

## Goal

Establish a narrow test infrastructure for renderer component test pages that mirrors the main process test hook pattern.

This phase focuses on:

- a dynamic page registration contract for renderer test pages
- a clean active/noop module swap mechanism
- AppLayout integration with minimal runtime branching
- build-time wiring via existing test module scripts

---

## Scope

This proposal covers only Phase 0 work:

1. Renderer test module contract and registry design
2. `testing-active` and `testing-noop` module structure
3. AppLayout and page router integration approach
4. Build script extension for renderer test module selection
5. Target example pages and initial files to create

---

## Phase 0 Deliverables

### 1. Dynamic Page Registry

Create a shared page registry that can be populated at runtime.

**Contract**:

```ts
export interface PageRegistry {
  registerPage(route: string, component: React.ComponentType, label: string): void;
  getPage(route: string): React.ComponentType | undefined;
  getPages(): Array<{ route: string; label: string }>;
}
```

**Responsibilities**:

- `AppLayout` uses `getPage(currentPage)` to resolve pages dynamically
- `testing-active` registers renderer-only test pages into the registry
- `testing-noop` does nothing

### 2. Renderer Testing Module Contract

The renderer testing module should export a small public contract:

```ts
export interface TestingModule {
  registerTestPages?: (registry: PageRegistry) => void;
  buildTestingMenu?: () => React.ReactNode | null;
}
```

**Active module behavior**:

- registers page routes for test pages
- returns a React node for the test menu section

**No-op module behavior**:

- `registerTestPages` is a no-op
- `buildTestingMenu` returns `null`

This avoids runtime `NODE_ENV` branches in AppLayout.

---

### 3. Module Structure

```
src/renderer/components/testing-active/
├── index.ts
├── PageTestPage.tsx
├── SectionTestPage.tsx
└── ...

src/renderer/components/testing-noop/
└── index.ts

src/renderer/components/testing/
└── index.ts   # symlinked from active or noop by build scripts
```

`testing-active/index.ts` exports the real implementation.
`testing-noop/index.ts` exports the empty stubs.

---

### 4. AppLayout Integration

**Approach**:

- Import the shared `testing` module from `src/renderer/components/testing`
- Call `buildTestingMenu?.()` to optionally render a test menu section
- Use the shared `PageRegistry` to resolve dynamic pages in `renderPage()`

**Example**:

```tsx
import * as testing from '../components/testing';

const testMenuSection = testing.buildTestingMenu?.();

const renderPage = (): React.ReactElement => {
  const pageComponent = pageRegistry.getPage(currentPage);
  if (pageComponent) return React.createElement(pageComponent);
  switch (currentPage) {
    case 'home':
      return <HomePage />;
    // ...
    default:
      return <HomePage />;
  }
};
```

Because `testing-noop` returns `null`, AppLayout remains clean and free of explicit environment checks.

---

### 5. Build Script Wiring

Extend existing scripts that already swap main process test code:

- `scripts/use-testing-active.js`
- `scripts/use-testing-noop.js`

**New behavior**:

- link or copy `src/renderer/components/testing-active` to `src/renderer/components/testing` when tests are active
- link or copy `src/renderer/components/testing-noop` to `src/renderer/components/testing` when tests are inactive

This preserves the existing swap-based test setup and centralizes the test page inclusion decision in build-time wiring.

---

## Why Phase 0 First?

This narrow scope is meant to establish the infrastructure before building any reusable UI components:

- prevents premature coupling of page registration and component implementation
- enables future component test pages to plug into the same registry
- reduces AppLayout complexity with a single optional module contract
- mirrors the existing main-process test hook architecture for consistency

---

## Next Step After Approval

Once Phase 0 is approved, the next work items will be:

- implement the test registry module
- create `testing-active/index.ts` and `testing-noop/index.ts`
- add an initial test page such as `PageTestPage.tsx`
- wire AppLayout to the registry and optional menu
- validate with a minimal BDD tester persona and feature
