# Project Collaboration Bundle

This directory is the repository-local entrypoint for shared collaboration semantics adopted by `large-file-upload`. It describes how the bundle is organized; the underlying contracts and principles remain the semantic owners.

## Bundle map

- `project-collaboration-guide.md` — cross-stage collaboration hierarchy and authority boundaries.
- `task-alignment.md` — Task Baseline, Task Decisions, freshness, and amendment semantics.
- `contracts/` — stage contracts for implementation planning, implementation review, and project-agent handoff.
- `principles/` — conditional design-judgment and Agent-tooling design lenses.

Read only the contract or principle selected by the current task. Do not treat this README as a second workflow authority or copy contract text into project-specific guidance.

## Target-owned boundaries

Shared collaboration semantics do not own this repository's project truth or execution mechanics. `large-file-upload` remains responsible for:

- canonical Task State under `.project/tasks/`;
- Project Memory under `.codex/project-memory/`;
- project-specific guidance under `.codex/project-specific/` when a real target need exists;
- repository validation and Git/publication mechanics;
- product architecture, application runtime/toolchain, deployment, and operations.

Current publication and merge mechanics are owned by the installed target workflows plus `.repo-tools/scripts/repository-publication.mjs`; this collaboration bundle does not restate or replace them.

## Adoption boundary

External repositories may provide provenance or reusable engineering evidence only after selected semantics are materialized into this repository. `pengcc/badminton-club-app` is not a runtime dependency, Project Memory source, product-architecture authority, deployment authority, or current workflow owner for `large-file-upload`.

Do not import source-project stage continuation, Issue projection, candidate queues, deployment machinery, runtime assumptions, or project-specific specialists merely to make this bundle look complete. Add target-specific capability only when a current consumer justifies it.
