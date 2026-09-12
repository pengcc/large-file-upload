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

When the current task depends on `large-file-upload`-specific architecture, storage/integrity behavior, or repository-capability assumptions, read `.codex/project-specific/agent-guidance.md` as a thin supplement to this file. It does not replace shared workflow or safety owners.

Use `.codex/project-collaboration/task-alignment.md` and `.codex/project-collaboration/project-collaboration-guide.md` for Task Alignment and cross-stage collaboration. Use `grilling` only when material requirements cannot be resolved from current evidence. Use `docs-first-research` for consequential external technical facts.

## Delivery Workflows

Use the installed workflow that matches the current task:

- `project-architecture-plan` for architecture direction;
- `plan-with-context` for implementation planning;
- `execute-plan` for authorized execution;
- `implementation-review` for complete implementation or remediation review;
- `open-or-update-pr` for authorized publication of one clean committed review-ready feature branch as one PR;
- `merge-pr` for separately authorized immediate merge of one exact PR;
- `update-project-memory` only for confirmed durable target knowledge.

A recognized user request to execute ordinary implementation or same-delivery remediation normally includes delivery of one review-ready PR after the implementation owner reaches a current validated committed delivery. An explicit `keep local`, `no push`, `no PR`, or equivalent local-only constraint opts out. Direct bounded delivery, arbitrary file-producing work, plan approval, a commit request, or generic readiness does not independently gain PR-publication authority from this default.

Do not claim an optional or technology-specific capability exists unless it is installed. When a useful specialist is absent, use the router's missing-specialist fallback and `docs-first-research` where correctness depends on external technical facts.

## Target Boundaries

The application technology stack is not selected by this bootstrap. Current accepted upload architecture direction and still-open technology choices are routed through Project Memory; choose unresolved framework, runtime, persistence, storage provider, deployment, checksum/integrity mechanism, and application validation only from this project's own requirements and verified technical evidence.

Do not import another project's Project Memory, product/domain code, project-specific skills, runtime scripts, deployment/backup machinery, or environment assumptions unless a later target-owned decision and current consumer justify that exact capability.

A thin project-specific Agent guidance supplement is installed. Additional project-specific capabilities belong under `.codex/project-specific/` only when this repository develops a real need for them. Keep absent skills, rules, prompts, and specialists absent rather than adding placeholders.

## Current Tooling State

No application package manager, application runtime, root application validation command, deployment workflow, automated worktree manager, or target-specific specialist is installed yet.

Target-owned Agent publication/merge workflows and dependency-free Node repository publication commands are installed. They are repository tooling only and do not select the product application's runtime or package manager. The maintained local-checkout transport is:

```text
node .repo-tools/scripts/repository-publication.mjs pr-open-or-update
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

`open-or-update-pr` owns publication semantics and safety regardless of transport. When a compatible local checkout is available, use the maintained Node command. When the active actor/runtime cannot execute that local path but has connected GitHub mutation capability and the completed delivery already exists on one exact remote feature branch, the same workflow may use its bounded connector fallback after reproducing the same repository identity, default-branch ancestry, exact-head, duplicate-PR, non-force, and final readback protections. The fallback does not translate or publish an inaccessible local-only commit and does not authorize implementation mutation.

The local PR command requires a clean committed current feature branch. Merge still requires separate explicit authority for one exact PR. Codex publication hooks block direct `git push`, `gh pr create`, and `gh pr merge` bypasses once the maintained path is present; those guards do not prohibit another actor from using an expressly defined runtime-neutral fallback inside the same repository workflow owner.

Treat any `pnpm ...` command or source-project publication helper mentioned inside adopted shared workflow text as non-applicable source-era guidance unless this repository later installs that exact command. For repository-only work, validate through the target-owned repository-tool tests plus Git/readback and file-boundary checks. Before product implementation, the target architecture/toolchain owner must establish target-owned application validation commands and update Project Memory when they become durable facts.

## Change and Safety

Apply `.codex/rules/agent-operating-contract.md`, `.codex/rules/engineering-quality-principles.md`, `.codex/rules/task-and-change-safety-principles.md`, `.codex/rules/skill-invocation-and-dependency-boundaries.md`, and `.codex/rules/docs-first-policy.md` as applicable.

After this root bootstrap commit, ordinary Git-visible work should use a dedicated branch unless the user explicitly authorizes otherwise. Use the smallest safe, reviewable change and do not expand scope silently.
