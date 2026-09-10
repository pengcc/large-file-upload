# Project Memory Guideline

## Project Overview

`large-file-upload` is a new project for reliable upload of files larger than 10 GB. The current product boundary includes chunked/concurrent transfer, resumability, safe retry and finalization, whole-file integrity, content-identity/dedupe semantics, truthful frontend progress, durable upload state, and multi-instance correctness.

The current repository is in project-bootstrap / architecture-research readiness. No product implementation exists yet.

## Current Architecture and Tooling State

Application architecture is partially settled rather than wholly open. Detailed current architecture/lifecycle facts and unresolved choices are owned by `topics/architecture-and-upload-lifecycle.md`; Project Decision D-004 owns the rationale for the accepted direction.

Current repository/Agent tooling capability facts are owned by `topics/repository-and-agent-tooling.md`.

Use `topic-index.md` to route subject-specific reads. This always-read core intentionally does not duplicate the mutable architecture or tooling fact lists owned by those topics.

## Validation Boundary

Validation/toolchain current facts are routed through `topics/repository-and-agent-tooling.md`. Project Decision D-003 owns the durable validation-ownership and source-era-command boundary. Use those owners instead of inferring current commands or capabilities from adopted workflow text.

## Project Truth Boundaries

- `docs/product-blueprint.md` is the current product/project blueprint for architecture research.
- `.codex/project-memory/guideline.md` is the concise always-read current-fact core; `topic-index.md` routes subject-specific fact, decision, and lesson owners.
- `.codex/project-memory/decisions.md` owns durable decision rationale; `.codex/project-memory/lessons-learned.md` owns reusable lessons.
- Repository workflow routing and target-specific guidance are owned by the current repository instructions and routed Agent/context owners rather than duplicated in Project Memory core prose.
- Git history records provenance for shared files adopted from an exact source revision.
