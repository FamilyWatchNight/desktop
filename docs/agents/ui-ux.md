# Renderer UI/UX Guidance

Use this guide for renderer UI changes and UX decisions. It records the current implementation separately from intended product requirements.

## Product targets

- **Surfaces**: Desktop/laptop layouts are the current target. The Electron window opens at 1200×800. The app also serves the renderer from a localhost web server; this is a local browser surface, not a public web deployment. Mobile layouts are not a current requirement.
- **Input**: Mouse, Tab, and Norigin arrow-key spatial navigation are currently supported. Remote and gamepad input are future goals, not current validation requirements. Preserve input-independent focus and activation seams when practical; avoid coupling product actions to keyboard-only handlers when a shared activation path is available.
- **Accessibility**: WCAG 2.2 AA is the intended target. This is a new goal, not a claim that the current UI conforms. When a change touches a potentially nonconforming area, ask how much legacy retrofitting is in scope before expanding the work.

## Accessibility in design and specs

For UI behavior changed during design, specification, ticketing, or implementation:

- Identify changed interactions and states across relevant inputs: mouse, Tab/DOM focus, Norigin spatial focus, and assistive technology.
- Before settling behavior, consult the relevant [WAI-ARIA Authoring Practices pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) and applicable [WCAG 2.2 success criterion](https://www.w3.org/TR/WCAG22/). APG informs interaction patterns; it does not establish WCAG conformance.
- Record the chosen behavior and relevant guidance as testable user outcomes, including how each affected input mode will be verified. For hover- or focus-triggered UI, specify and verify behavior when Norigin's selection ring reaches the control. Carry these criteria with the feature slice; create a separate accessibility ticket only for independently deliverable work.

## Current renderer patterns

- **Hosting**: `createApiClient()` selects the Electron IPC API when the preload API exists and otherwise uses the HTTP client. Both hosts render the same React UI.
- **Shell**: `AppLayout` provides a sticky header, a toggleable side navigation menu, and the active page in the main content area. The menu and content use separate Norigin focus contexts; inactive regions are made inert.
- **Focus and activation**: `NavigationProvider` tracks mouse, Tab, and arrow navigation modes. Tab follows DOM focus order; Norigin handles spatial focus movement for arrow keys. `useNavigationFocusable` bridges registered DOM elements to Norigin focus keys and activation callbacks. In arrow mode, registered controls with activation callbacks respond to Enter/Space. Focused controls scroll into view.
- **Focus appearance**: Sass mixins provide a `:focus-visible` ring and a separate spatial-navigation ring. Reuse these patterns so keyboard and spatial focus remain visible.
- **Components and visual style**: Reuse the renderer's shared buttons, form controls, containers, and navigation components. Styling uses Sass variables and color tokens, a dark glass-like surface, and the Nunito Sans font stack.
- **Semantics and language**: Prefer native interactive elements and meaningful ARIA relationships. User-facing text uses i18next; follow the localization rules in `docs/agents/implementation.md`.
- **UI tests**: Keep stable, translation-independent `data-testid` values on interactive controls and page roots. Follow `docs/agents/testing.md` for component and journey-test boundaries.

## Available vs. unavailable actions

- **Hide unauthorized actions.** When a user is not permitted to access an action at all, omit the control from the layout rather than rendering it disabled. A missing control is not selectable and cannot be mistakenly activated.
- **Show state-dependent unavailable actions as disabled.** When an action is visible but currently unavailable (for example, deleting an assigned or system-defined role), render the control in its disabled state so the user can see the action exists and understand why it cannot proceed.
- **Decouple focus from activation.** "Activation" means executing the control's primary action handler (e.g., triggering `onClick`). "Focus" is the ability to select the element via keyboard (`Tab`) or pointer. Disabled controls must never _activate_, but they may still receive _focus_ to surface context.

When rendering a disabled control, pass both `disabled` and a user-facing
`disabledReason` so the control can explain itself; the reason is exposed to
assistive technology and shown in a non-layout-shifting tooltip on hover/focus. To
_implement or extend_ a control that accepts `disabledReason`, see
[`docs/agents/ui-components.md`](ui-components.md).

## UX decisions to surface

Before implementing a UI change with multiple reasonable approaches, identify the affected decision branches and ask for the user's preference. Relevant branches include target surface or screen size, input and navigation modes, accessibility trade-offs and retrofit scope, and layout or visual-system conventions. Treat the requirements above as constraints; treat library choices and existing styling as implementation facts, not proof of a broader product requirement.

For changes to navigation or focus, describe how the change preserves mouse and keyboard behavior and whether it affects future remote/gamepad extensibility. Do not add remote/gamepad support or claim it works without an explicit request and validation scope.
