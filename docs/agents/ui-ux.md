# Renderer UI/UX Guidance

Use this guide for renderer UI changes and UX decisions. It records the current implementation separately from intended product requirements.

## Product targets

- **Surfaces**: Desktop/laptop layouts are the current target. The Electron window opens at 1200×800. The app also serves the renderer from a localhost web server; this is a local browser surface, not a public web deployment. Mobile layouts are not a current requirement.
- **Input**: Mouse and keyboard are the currently supported inputs. Remote and gamepad input are future goals, not current validation requirements. Preserve input-independent focus and activation seams when practical; avoid coupling product actions to keyboard-only handlers when a shared activation path is available.
- **Accessibility**: WCAG 2.2 AA is the intended target. This is a new goal, not a claim that the current UI conforms. When a change touches a potentially nonconforming area, ask how much legacy retrofitting is in scope before expanding the work.

## Current renderer patterns

- **Hosting**: `createApiClient()` selects the Electron IPC API when the preload API exists and otherwise uses the HTTP client. Both hosts render the same React UI.
- **Shell**: `AppLayout` provides a sticky header, a toggleable side navigation menu, and the active page in the main content area. The menu and content use separate Norigin focus contexts; inactive regions are made inert.
- **Focus and activation**: `NavigationProvider` tracks mouse, Tab, and arrow navigation modes. Tab follows DOM focus order; Norigin handles spatial focus movement for arrow keys. `useNavigationFocusable` bridges registered DOM elements to Norigin focus keys and activation callbacks. In arrow mode, registered controls with activation callbacks respond to Enter/Space. Focused controls scroll into view.
- **Focus appearance**: Sass mixins provide a `:focus-visible` ring and a separate spatial-navigation ring. Reuse these patterns so keyboard and spatial focus remain visible.
- **Components and visual style**: Reuse the renderer's shared buttons, form controls, containers, and navigation components. Styling uses Sass variables and color tokens, a dark glass-like surface, and the Nunito Sans font stack.
- **Semantics and language**: Prefer native interactive elements and meaningful ARIA relationships. User-facing text uses i18next; follow the localization rules in `docs/agents/implementation.md`.
- **UI tests**: Keep stable, translation-independent `data-testid` values on interactive controls and page roots. Follow `docs/agents/testing.md` for component and journey-test boundaries.

## UX decisions to surface

Before implementing a UI change with multiple reasonable approaches, identify the affected decision branches and ask for the user's preference. Relevant branches include target surface or screen size, input and navigation modes, accessibility trade-offs and retrofit scope, and layout or visual-system conventions. Treat the requirements above as constraints; treat library choices and existing styling as implementation facts, not proof of a broader product requirement.

For changes to navigation or focus, describe how the change preserves mouse and keyboard behavior and whether it affects future remote/gamepad extensibility. Do not add remote/gamepad support or claim it works without an explicit request and validation scope.
