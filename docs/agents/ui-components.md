# Renderer Component Implementation Guide

Use this guide when **implementing or extending a renderer control**, especially one that
can be disabled. For when to use a disabled control and how to pass its reason, see the
consumer-facing guidance in [`docs/agents/ui-ux.md`](ui-ux.md).

## Disabled-reason pattern (`disabledReason`)

Controls that can be disabled accept optional `disabled` and `disabledReason` props. To
ensure keyboard and screen-reader users can access the explanation, controls with a
reason must remain focusable in the DOM:

- **Use `aria-disabled="true"` for explainable states.** When `disabledReason` is
  provided, the underlying native `<button>` must **not** receive the HTML `disabled`
  attribute (which obliterates tab order and pointer events). Instead, apply
  `aria-disabled="true"` and manually intercept and kill pointer and keyboard
  activation events in your component logic.
- **Fall back to native `disabled` when no reason exists.** If `disabled={true}` is set
  *without* a `disabledReason`, apply the native HTML `disabled` attribute. The control
  safely drops out of the tab order since there is no context to communicate.
- **Preserve disabled visuals.** Because `aria-disabled` does not apply browser-native
  disabled styling, controls must still look and behave visually disabled (including a
  non-clickable cursor and no enabled hover treatment) while remaining focusable.
- **`Tooltip` + `useTooltip` primitive**: Managed via
  `src/renderer/components/elements/feedback/Tooltip.tsx` and `useTooltip.ts`.
  `useTooltip` opens the tooltip on pointer hover and keyboard focus, generating a
  stable `descriptionId`. `Tooltip` portals its fixed-position overlay to the document
  body, so it doesn't insert a wrapper into the trigger's layout hierarchy or shift
  surrounding content. Spatial-navigation focus (the arrow-key selection ring) also
  opens the tooltip, just like pointer hover or DOM keyboard focus.
- **Always-in-DOM description**: The reason text is rendered in a description element
  that is always present in the DOM and linked to the control via `aria-describedby`,
  allowing assistive technology to resolve the reason. When closed, the overlay is
  visually hidden (opacity) but still readable by screen readers.
- **Reusable, not a separate generic `reason` prop**: This pattern lives strictly behind
  `disabledReason` on concrete controls (currently `Button` and `MenuItem`), not a
  standalone unavailable-action component or a generic `reason` prop.

When adding a new disabled-capable control, prefer reusing `disabledReason` and the
shared `Tooltip`/`useTooltip` primitive so future unavailable-action reasons are
consistent.