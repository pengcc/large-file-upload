# Project Memory Guideline

## Project Overview

`large-file-upload` is a new project for reliable upload of files larger than 10 GB. The current product boundary includes chunked/concurrent transfer, resumability, safe retry and finalization, whole-file integrity, content-identity/dedupe semantics, truthful frontend progress, durable upload state, and multi-instance correctness.

The current repository is in project-bootstrap / architecture-research readiness. No product implementation exists yet.

## Current Architecture and Tooling State

Application architecture and technology choices remain target-owned. The repository currently has no selected application framework, application runtime, package manager, persistence technology, object-storage provider, deployment platform, or application validation command.

The repository contains target-owned project context plus selectively adopted shared Agent/project workflow semantics. The target runtime must not depend on `pengcc/badminton-club-app` or another product repository.

Target-owned Agent publication/merge workflows and dependency-free Node repository publication commands are installed under `.codex/skills/` and `.repo-tools/scripts/`. They provide clean feature-branch PR publication and separately authorized exact-PR merge with repository/head/readiness verification. Node is currently a repository-tooling dependency for this capability only; it is not an application-runtime decision.

There is currently no `.codex/project-specific/**` capability, application source tree, package manifest, lockfile, deployment workflow, backup tooling, automated worktree manager, or product-specific runtime tooling.

## Validation Boundary

Until target architecture and toolchain decisions establish application commands, do not infer or run `pnpm`, framework, persistence, or deployment validation from adopted shared workflow text. Repository publication tooling is validated with direct Node tests, structural/readback checks, and read-only GitHub capability evidence; application validation remains unset.

Before product implementation begins, the target's architecture/toolchain owner must establish the actual target-owned application validation commands and update Project Memory when those become durable current facts.

## Project Truth Boundaries

- `docs/product-blueprint.md` is the current product/project blueprint for architecture research.
- `.codex/project-memory/guideline.md` and routed Project Memory owners hold durable target facts and decisions.
- `.codex/project-collaboration/` and selected `.codex/rules/` / `.codex/skills/` provide reusable workflow semantics; they do not decide this product's technology stack.
- `.repo-tools/scripts/repository-publication.mjs` is the maintained repository publication/merge mechanical owner; Agent workflows retain intent and authorization boundaries.
- Git history records provenance for shared files adopted from an exact source revision.
- Missing optional or technology-specific skills remain absent until a real target consumer justifies them.
