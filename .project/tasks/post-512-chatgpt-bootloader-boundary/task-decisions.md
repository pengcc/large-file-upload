# Accepted Task Decisions

Acceptance status: accepted

## TD-01 — Permanent configured Project surface

- The permanent target surface is Project Instructions only.
- Configured Project Resource Files are not retained without demonstrated independent value.
- Do not infer the actual current configured Resource File inventory from repository evidence alone.

## TD-02 — ChatGPT runtime / transport boundary

- No separate ChatGPT-specific runtime or transport adapter is currently required.
- Persisted Task State continues to use the existing actor-neutral Task Alignment semantics and actor-local, branch-aware, connector-capable Task State owner.
- Exact-PR Implementation Review has a demonstrated actor-specific GitHub effect boundary, but existing Implementation Review owners should serve that effect where possible.
- Introduce a narrow repository-owned ChatGPT binding only if later implementation or acceptance evidence proves that the existing owner cannot safely support the ChatGPT runtime without Codex-only mechanics, semantic duplication, or another real runtime gap.
- Keep review semantics, authority resolution, Task Baseline / Task Decisions, execution-contract lineage, exact-target meaning, finding classification, clean/actionable behavior, and remediation semantics with their existing owners.

## TD-03 — Project Instructions Version boundary

- Keep Project Instructions Version 1 for repository-only evolution behind the stable current `main:AGENTS.md` entrypoint.
- Bump the version only when a real configured-Project bootstrap contract or permanent configured-surface change requires it.
- Do not bump pre-emptively.

## TD-04 — Acceptance evidence boundary

- Perform representative immediate fresh-conversation acceptance where it can be exercised honestly.
- Do not manufacture version mismatch, persisted Task State mutation, actionable PR findings, connector failure, fake workflow changes, or meaningless repository mutations solely to produce acceptance evidence.
- Keep later genuine repository-only self-hosting proof pending until a naturally occurring routing or semantic change can demonstrate that a fresh conversation consumes new repository truth without configured-Project refresh.

## Preserved boundaries and non-goals

Preserve all explicit non-goals and target-owned ownership boundaries from `baseline.md`.
