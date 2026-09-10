# Project Memory Guideline

## Project Overview

`large-file-upload` is a new project for reliable upload of files larger than 10 GB. The current product boundary includes chunked/concurrent transfer, resumability, safe retry and finalization, whole-file integrity, content-identity/dedupe semantics, truthful frontend progress, durable upload state, and multi-instance correctness.

The current repository is in project-bootstrap / architecture-research readiness. No product implementation exists yet.

## Current Architecture and Tooling State

Application architecture is partially settled rather than wholly open. The accepted upload direction is owned by `topics/architecture-and-upload-lifecycle.md` and Project Decision D-004. Provider, application runtime/framework, package manager, persistence technology, deployment platform/topology, checksum mechanism, and unresolved finalization/integrity details remain open until their owners settle them.

The repository contains target-owned project context plus selectively adopted shared Agent/project workflow semantics. The target runtime must not depend on `pengcc/badminton-club-app` or another product repository.

Repository/Agent tooling capability details are owned by `topics/repository-and-agent-tooling.md`. Target-owned publication/merge capability exists as repository tooling, while application runtime, application validation, deployment, and automated-worktree capabilities remain unset.

## Validation Boundary

Until target architecture and toolchain decisions establish application commands, do not infer or run `pnpm`, framework, persistence, or deployment validation from adopted shared workflow text. Repository/context changes use the installed direct Node repository-tool tests plus structural Git/readback and file-boundary checks as applicable; application validation remains unset.

Before product implementation begins, the target's architecture/toolchain owner must establish the actual target-owned application validation commands and update Project Memory when those become durable current facts.

## Project Truth Boundaries

- `docs/product-blueprint.md` is the current product/project blueprint for architecture research.
- `.codex/project-memory/guideline.md` is the concise always-read current-fact core; `topic-index.md` routes subject-specific fact, decision, and lesson owners.
- `.codex/project-collaboration/` provides reusable collaboration semantics and a local adoption entry map; it does not decide this product's architecture or technology stack.
- `.codex/project-specific/agent-guidance.md` supplements `AGENTS.md` only for current target-specific boundaries and does not duplicate generic workflow mechanics.
- Git history records provenance for shared files adopted from an exact source revision.
- Missing optional or technology-specific skills remain absent until a real target consumer justifies them.
