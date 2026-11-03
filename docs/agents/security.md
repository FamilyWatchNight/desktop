# Security Guide

Read this guide when changing file operations, user-input handling, localization writes, IPC/preload exposure, or the HTTP server.

## File paths

- Use the shared helpers in `src/main/security/`, including `safeJoin()`, `assertPathInsideAllowedDirs()`, and `assertNoSymlinkEscape()`; do not construct paths manually.
- Validate that paths remain inside their allowed roots and are not redirected outside them through symlinks.

## Input and localization

- Normalize, validate, and bounds-check user input before processing it.
- For localization keys, block prototype-pollution segments (`__proto__`, `constructor`, `prototype`) and enforce the existing 1024-character key and 100-segment limits.
- Do not allow missing-key writes in production; retain per-file write serialization and atomic-write behavior.

## IPC and HTTP boundaries

- Minimize the preload/IPC surface to necessary functions.
- Preserve localhost-only host validation and the configured 100-requests-per-minute HTTP rate limit.

## Proposing security changes

- Flag security gaps in chat before changing the security architecture.
- Propose reusable helpers under `src/main/security/` and ground changes in code or established security findings.
- See the security architecture rationale in `DECISIONS.md`.
