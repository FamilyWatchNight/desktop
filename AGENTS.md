# Family Watch Night

A cross-platform app for managing movie selection for a Family Watch Night

## Agent skills

### Issue tracker

Issues and specs live in this repository's GitHub Issues. For `/to-tickets`
sizing and tracker operations, see `docs/agents/issue-tracker.md`.

### Triage labels

Use the default canonical triage label names: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo; use the root `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Project references

- When changing or running tests, follow `docs/agents/testing.md`; consult `tests/bdd/README.md` for the BDD layer model and dependency rules.
- When changing application code, follow `docs/agents/implementation.md`.
- When changing renderer UI or making UX decisions, follow `docs/agents/ui-ux.md`.
- When changing file operations, user-input handling, localization writes, IPC/preload exposure, or the HTTP server, follow `docs/agents/security.md`.

## Agent Workflow Guidance

**CRITICAL: Agents should err on the side of asking for human guidance. Before considering any work complete, check in via chat.**

### Checkpoint Strategy

- **After each major change**: Ask for feedback on the direction and implementation
- **Before completing a task**: Verify the solution matches expectations, ask if anything should be adjusted
- **On scope questions**: If unsure whether to expand/reduce scope, ask first
- **Implementation choices**: When multiple valid approaches exist, surface them for human decision-making
- **Phase/Task Completion**: Never declare phases, stages, or tasks as "complete" unilaterally. Always check in via chat to confirm completion status and receive guidance on next steps.

**Never assume work is done. Always ask.**

### Interaction Patterns

**Chat Usage:**

- **Documentation changes**: Follow the Documentation Strategy below.
- **Complex Decisions**: When multiple valid approaches exist, surface them in chat for human decision-making
- **Scope Clarification**: Use chat to confirm understanding of requirements and scope before proceeding with implementation
- **Phase/Task Completion**: Never declare phases, stages, or tasks as "complete" unilaterally. Always check in via chat to confirm completion status and receive guidance on next steps.

---

## Architecture reference

For tasks that depend on system design or component relationships, consult [ARCHITECTURE.md](./ARCHITECTURE.md). Treat it as a reference and verify relevant behavior against the current code; flag discrepancies before relying on it.

---

# Documentation Strategy

This project uses structured documentation to prevent stale guidance and capture decisions. Agents should actively maintain these documents during their work.

## Key Documents

- **ARCHITECTURE.md**: "Living" documentation of system design, application architecture, and how testing infrastructure integrates with the main application
- **DECISIONS.md**: Record of significant architectural and implementation decisions (created as-needed)
- **AGENTS.md**: This file — agent workflow, conventions, testing patterns, and guidance

## Agent Approach to Documentation

**At the start of work:**

- Check if ARCHITECTURE.md and DECISIONS.md are still aligned with the current request
- If you notice a discrepancy between documented decisions and what you're asked to do, raise it via chat
- The human may want to override the documented decision, update documentation, or clarify the request

**During work:**

- Monitor for architectural changes, new patterns, or significant decisions
- Note what might need documentation updates

**At the end of work:**

- Update directly relevant documentation when the work changes architecture, established patterns, or durable project guidance.
- Record settled architectural decisions in DECISIONS.md when warranted; ask for guidance when the decision itself remains unresolved.
- Keep documentation edits within the task's scope and include them in validation and review.

**Key principle:** Keep documentation aligned with the product and implementation; use chat to resolve uncertainty, not as a required approval gate for relevant documentation updates.
