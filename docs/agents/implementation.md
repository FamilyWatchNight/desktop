# Implementation Guide

Use this guide when changing application code. For test design and execution, see `docs/agents/testing.md`; for security-sensitive changes, see `docs/agents/security.md`.

## Implementation workflow

- Inspect the package manifest and relevant configuration before assuming available commands or build requirements.
- Before changing a pattern, compare two or three similar implementations in the codebase. Follow existing dependency, naming, error-handling, and export patterns; ask if they conflict or remain unclear.
- For substantive code changes, run the relevant tests immediately. If they fail, make up to three targeted fix attempts, then report the cause and options.
- Before build or validation commands that invoke linting, run ESLint with `--fix` on every changed file; repeat after further edits.
- For complex codebase research, use the Explore agent for a bounded, read-only investigation.
- When adding a dependency, prefer minimal, pinned, widely used packages and update manifests and lockfiles.
- Non-trivial generated code should be runnable and include a minimal harness, usage/troubleshooting guidance, and the required dependency updates.
- Surface errors explicitly; do not invent APIs, silently default, or hide failures.

## File placement and naming

- Before adding files, inspect nearby examples and the relevant directory structure; follow established placement and naming. If placement remains ambiguous, ask before creating a new file.
- Services use singular nouns; inspect nearby model and export conventions before naming classes or choosing named/default exports.
- Keep dependencies and data access consistent with similar implementations (for example, follow the existing lazy model-binding pattern where used).
- Before finalizing a class or file, compare it with two or three similar implementations and check its structure against those examples.

## Project patterns

- Keep services as business logic independent of IPC/HTTP transport; models own type conversion.
- Follow existing barrel-export and idempotent IPC-handler patterns.
- HTTP routes consistently wrap and return errors; use string constants for task-type identifiers.
- Services that broadcast events use the central event-notification manager; transports subscribe to it.

## Localization

- All user-facing UI text uses i18next keys.
- Locale JSON files live under `assets/locales/{locale}/`.
- When adding translation keys, update both `en` and `dev`; the development text wraps the English text in underscores.
