# Phase 2 Proposal — Form Component Suite (finalized per discussion)

Status: Draft

## Overview

This document defines Phase 2 for the components work with the clarifications we discussed:

- `Fieldset` is semantic for a `<fieldset>` (grouping related controls) and is intended for heterogeneous groups of inputs (for example, a "Mailing Address" group containing multiple `Input` and `Select` fields).
- `RadioGroup` and `CheckboxGroup` are single-concept controls and will render `<fieldset>`/`<legend>` semantics internally so authors do not need to add an explicit `Fieldset` when those components represent one logical input.
- Provide a `Form` component that manages per-form registry/context and id generation.
- Implement `Input` and a full set of controls: `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, and `Select`.
- Controls require a `label` prop; `labelVisible` controls whether a visible `<label>` is rendered.
- No separate `Label` component initially; future work documents how a `Label` could be added and coordinated by `Form`.

## Goals

- Deliver a consistent, accessible form component suite so pages can be migrated incrementally.
- Provide test pages and BDD coverage for all controls.
- Document the path toward automatic label coordination via the `Form` registry.

## Directory layout

- `src/renderer/components/forms/`
  - `Form.tsx` — form container + registry
  - `Fieldset.tsx` — maps to `<fieldset>`/`<legend>`
  - `Input.tsx` — text-like control with `label` + `labelVisible` support
  - `Checkbox.tsx`, `CheckboxGroup.tsx`
  - `Radio.tsx`, `RadioGroup.tsx`
  - `Select.tsx`
- `src/renderer/styles/components/elements/forms/` — `_form.scss`, `_checkbox.scss`, etc.
  -- `src/renderer/testing-active/FormControlsTestPage.tsx` — comprehensive test page for all controls; includes both controlled and uncontrolled usage examples for each control so both APIs are exercised by UI tests
- `tests/bdd/business-logic/features/` — feature files for core primitives and controls

## API & Behavioral Rules

1. `Form` (recommended wrapper)

- Purpose: provide `<form>` semantics and a per-form registry to coordinate ids and label registrations.
- API surface (high level):
  - `<Form onSubmit={...} autoIdPrefix?: string>{children}</Form>`
  - Exposes context: `{ registerLabel, unregisterLabel, registerField, hasLabel, generateId }`.
- Recommendation: encourage use of `<Form>` for coordinated behavior; components remain usable without it (fallback id generation and label rendering).

2. `Fieldset` (semantic grouping)

- Purpose: represent a logical group of related controls (a heterogeneous collection) and render `<fieldset>` with optional `<legend>` and visual grouping styles. Use `Fieldset` when multiple different inputs (for example, `Input` + `Select` + `Checkbox`) belong to the same conceptual group such as "Mailing Address".

3. Controls: `label` contract and `labelVisible`

- `label` prop is required for each control (string or ReactNode).
- `labelVisible?: boolean` default `true`. When `false` the control exposes the label via `aria-label` (or `aria-labelledby`) instead of rendering a visible `<label>` element.
- Controls accept `id?: string`. If absent, `Form`'s `generateId()` will be used (if `Form` present) or a deterministic fallback is used.
- Group controls that represent a single logical value (e.g., `RadioGroup`, `CheckboxGroup`) will render `<fieldset>`/`<legend>` semantics internally and should be used for option lists rather than manually wrapping primitive inputs.

4. No `Label` initially

- Phase 2 uses the `label` prop only. A `Label` component will be documented for future use and may be added later if desired.

## ARIA and Accessibility Details

Core ARIA/semantic rules (applies to all controls):

- Prefer native semantics: use `<label>`, `<input>`, `<textarea>`, `<select>`, `<fieldset>`, `<legend>` whenever possible.
- If a visible label exists, ensure the control is associated via `for` + `id`, or by wrapping the input.
- If `labelVisible=false`, provide accessible name using `aria-label` or `aria-labelledby`.
- For required fields: set `aria-required="true"` on the control.
- For validation errors: set `aria-invalid="true"` and `aria-describedby` pointing to the error message element.
- For control groups (checkbox group, radio group): use `<fieldset>` + `<legend>` for proper grouping semantics.

## Examples

1. Text input (visible label):

```tsx
<Input id="displayName" label="Display name" value={v} onChange={...} required />
```

DOM concept:

```html
<label for="displayName">Display name</label> <input id="displayName" aria-required="true" />
```

2. Text input (label hidden):

```tsx
<Input id="search" label="Search" labelVisible={false} aria-label="Search" />
```

DOM concept:

```html
<input id="search" aria-label="Search" />
```

3. Radio group (semantic group):

```tsx
<RadioGroup label="Preferred quality" name="quality">
  <Radio value="hd">HD</Radio>
  <Radio value="sd">SD</Radio>
</RadioGroup>
```

## Implementation plan (stages)

Stage 1 — Core primitives (deliverable minimal):

- Implement `Form` (context + id generation) and tests for registry.
- Implement `Fieldset` as `<fieldset>` wrapper.
- Implement `Input` with `label`, `labelVisible`, `id` handling, `aria-invalid`/`aria-describedby` behaviors.
- Add `FormControlsTestPage.tsx` that demonstrates `Input` and `Fieldset`.
- Add BDD feature `form-core.feature` and step definitions.

Stage 2 — Controls (full Phase 2 scope):

- Implement `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Select`.
- Extend test page to include toggles for each control's props (labelVisible, disabled, error, etc.).
- Add BDD features `form-controls.feature` and corresponding step defs.

Stage 3 — Integration & migration:

- Migrate selected Settings fields to use new controls as canonical examples.
- Run local BDD tests and iterate.

Stage 4 — `<Label>` and registry implementation:

- Implement `Label` and the `Form` registry so external labels can be coordinated with controls.
- Add BDD feature `form-labels.feature` and corresponding step definitions covering label association, label suppression, and `labelVisible` behavior.
- Validate that `Input`, `Checkbox`, `Radio`, and `Select` suppress internal labels when an external `Label` component is registered for the same field id.

## Design notes: `Label` via `Form` registry

Concept: `Form` exposes a registry (Map of id -> label metadata). `Label` registers itself with `registerLabel(id)` on mount. `Input` consults `hasLabel(id)` and subscribes to updates; if a label registration exists, `Input` suppresses internal label rendering.

Implementation considerations:

- Use a single `Form` context per form instance (not global), to avoid cross-form collisions and to simplify testing.
- Provide a subscription API so `Input` can react to labels registered after mount, with minimal re-render impact.
- Keep SSR in mind: server-rendered markup should be stable; prefer predictable id generation.

## Id generation & lightweight registry — problem and solution

Problem summary:

- When fields do not receive explicit `id` props, generated ids must be stable and deterministic to avoid hydration mismatches (SSR) and to keep test selectors consistent.
- A field might mount before or after an associated label (mount-order). Without coordination, inputs cannot reliably know whether an external label exists and may render duplicate or missing labels.
- Tests and automated UI checks rely on stable `data-testid`s and ids; ad-hoc ids or DOM-probing solutions lead to brittle tests.

Proposed solution (Stage 1 — lightweight):

- Provide `Form.generateId()` that returns deterministic ids scoped to the `Form` instance: `${autoIdPrefix || 'f'}-${counter++}`. This keeps ids predictable across mounts and test runs.
- Implement a minimal registry for fields that supports `registerField(id, meta)` and `unregisterField(id)` so the `Form` can track presence of fields (useful for validation and debugging). The `meta` object can include minimal properties such as `{ required?: boolean, hasError?: boolean }`.
- Defer the full `Label` registration/subscription API to a later phase. Stage 1 keeps the registry narrow and focused on id generation and field presence tracking to reduce complexity.

How this solves the problems:

- Deterministic ids avoid SSR hydration mismatches and make test selectors predictable.
- Minimal registry enables the `Form` to provide helpful diagnostics and centralized validation hooks without adding complexity.
- Deferring full label registration avoids premature complexity while leaving an explicit design path for the future.

Implementation notes & tests:

- Unit tests should assert that `generateId()` produces unique and deterministic ids within a `Form` instance and that `registerField`/`unregisterField` update the registry correctly.
- Integration tests will exercise `Input` rendering with generated ids and the `labelVisible` behavior.

## Controlled vs Uncontrolled APIs and performance

Design goals:

- Support both controlled and uncontrolled patterns so the library is flexible for both small forms and large, performance-sensitive forms.

API guidance:

- Controlled: `Input` accepts `value` and `onChange` props and behaves like a normal controlled component.
- Uncontrolled: `Input` accepts `defaultValue` and forwards a `ref` so callers (or form libraries) can read values on demand.

Performance patterns:

- Keep the `Form` registry in a `useRef` and expose stable callback functions via context so registry updates do not cause context identity changes (avoids re-rendering the whole tree).
- Use a subscription model for cross-component notifications (e.g., label registration, validation updates) so only relevant fields re-render.
- Memoize field components (`React.memo`) and avoid lifting per-field typing state into a parent component.

Recommendation:

- Use controlled components in examples and small forms for clarity.
- For large forms or highly interactive inputs, prefer uncontrolled usage or integrate with a library like React Hook Form; the components will support both models.

## Testing & acceptance

- Test pages that expose component props for easy Playwright/Cucumber scenarios; each control will include both controlled and uncontrolled examples so we can exercise and validate both usage patterns.
- BDD feature coverage for both core primitives and controls.
- Manual accessibility checks for label association, aria attributes, and keyboard navigation.

## Timeline estimates

- Stage 1: 2 days
- Stage 2: 3–5 days
- Stage 3: 1–2 days
- Stage 4: 1 day

## Open questions for review

1. Do you want `Label` prototyping included in Phase 2, or deferred to Phase 3? (I recommend deferring to keep Phase 2 focused.)
2. Which specific Settings fields should be migrated as canonical examples in Stage 3?
3. Do we want a single `Form` wrapper to be mandatory for all forms, or optional (recommended but not required)? I recommend optional with recommendation in docs.

## Next steps

If you confirm this plan I will:

1. Update the managed TODO list to reflect Stage 1/2/3/4 steps.
2. Scaffold the component files and test pages.
3. Implement Stage 1 and open a branch for review.

File created by agent.
