# AGENTS.md

This repository owns its own project context, architecture, implementation, validation, and runtime choices. Reusable workflow semantics may be adopted from an exact external revision, but the target project must not depend on another product repository at runtime.

## Required Context

Before project planning, implementation, review, or durable documentation, use the installed `project-memory` skill and read the target-owned Project Memory under `.codex/project-memory/`.

For a first adoption or materially undocumented project, use:

```text
AGENTS.md
-> project-memory
-> agent-roles-and-capabilities
-> initialize-project-context
-> routed target-specific follow-up
```

Use `.codex/project-collaboration/task-alignment.md` and `.codex/project-collaboration/project-collaboration-guide.md` for Task Alignment and cross-stage collaboration. Use `grilling` only when material requirements cannot be resolved from current evidence. Use `docs-first-research` for consequential external technical facts.

## Delivery Workflows

Use the installed workflow that matches the current task:

- `project-architecture-plan` for architecture direction;
- `plan-with-context` for implementation planning;
- `execute-plan` for authorized execution;
- `implementation-review` for complete implementation or remediation review;
- `update-project-memory` only for confirmed durable target knowledge.

Do not claim an optional or technology-specific capability exists unless it is installed. When a useful specialist is absent, use the router's missing-specialist fallback and `docs-first-research` where correctness depends on external technical facts.

## Target Boundaries

The application technology stack is not selected by this bootstrap. Choose framework, runtime, persistence, storage, upload protocol, deployment, and repository tooling from this project's own requirements and verified technical evidence.

Do not import another project's Project Memory, product/domain code, project-specific skills, runtime scripts, deployment/backup machinery, or environment assumptions unless a later target-owned decision and current consumer justify that exact capability.

Project-specific capabilities belong under `.codex/project-specific/` only when this repository develops a real need for them. Keep absent capabilities absent rather than adding placeholders.

## Change and Safety

Apply `.codex/rules/agent-operating-contract.md`, `.codex/rules/engineering-quality-principles.md`, `.codex/rules/task-and-change-safety-principles.md`, `.codex/rules/skill-invocation-and-dependency-boundaries.md`, and `.codex/rules/docs-first-policy.md` as applicable.

After this root bootstrap commit, ordinary Git-visible work should use a dedicated branch unless the user explicitly authorizes otherwise. Use the smallest safe, reviewable change and do not expand scope silently.
