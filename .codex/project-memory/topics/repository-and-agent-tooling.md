# Repository and Agent Tooling

This topic owns conditionally relevant current facts about the repository's Agent/context and repository-tooling capabilities. Use it when planning, executing, reviewing, or changing Agent tooling, repository publication, validation/toolchain setup, or related capability boundaries.

## Current context and routing capabilities

- `AGENTS.md` is the repository routing entrypoint.
- `.codex/chatgpt/project-instructions.md` is the repo-owned versioned ChatGPT Project bootloader source; the configured Project must match its `Project Instructions Version` before repository-aware work proceeds.
- `.codex/project-collaboration/` contains adopted shared collaboration contracts and principles; its README is an entry map, not another semantic authority.
- `.codex/project-specific/agent-guidance.md` is the thin target-specific supplement. No target-specific specialist skill, rule, or prompt package is currently installed.
- `.codex/project-memory/` owns durable target facts, decisions, lessons, and conditional topic routing.

## Publication and merge capability

Target-owned Agent workflows `open-or-update-pr` and `merge-pr` own intent, authorization, and workflow boundaries.

`open-or-update-pr` is the runtime-neutral PR-publication owner. Its maintained local-checkout transport is the dependency-free Node command at `.repo-tools/scripts/repository-publication.mjs`. When the active actor/runtime cannot execute that local path but has connected GitHub mutation capability and the completed delivery already exists on one exact remote feature branch, the same workflow may use its bounded connector fallback after preserving the same repository-identity, default-branch ancestry, exact-head, duplicate-PR, non-force, and final-readback protections. The fallback does not synthesize or publish an inaccessible local-only commit.

A recognized user request to execute ordinary implementation or same-delivery remediation normally supplies authority for one review-ready PR unless the user explicitly selects a local-only constraint such as `keep local`, `no push`, or `no PR`. Direct bounded delivery and arbitrary file-producing work do not inherit that default authority.

`merge-pr` remains separately and explicitly authorized and currently uses only the maintained local Node transport:

```text
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

No connector-backed merge fallback is currently installed. Codex PreToolUse publication guards continue to block direct `git push`, `gh pr create`, and `gh pr merge` bypasses once the maintained local path is present; those guards do not prohibit another actor from using an expressly defined fallback inside the owning repository workflow.

Node is a repository-tooling dependency for these maintained local transports only. It is not evidence that the product application should use Node.

## Current validation and runtime boundary

Repository publication tooling has direct Node tests and structural/readback validation. There is still no selected application package manager, application runtime/framework, root application validation command, deployment workflow, automated worktree manager, application source tree, or product-specific runtime tooling.

Before product implementation begins, the architecture/toolchain owner must establish the target-owned application validation surface. Do not infer `pnpm`, deployment commands, or source-project helpers from adopted workflow text.

## External-source boundary

Reusable semantics from another repository are provenance/engineering evidence only after materialization here. They are not current runtime, product, Project Memory, deployment, or workflow truth for `large-file-upload`.
