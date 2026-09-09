# Issue #1 — Agent Context and Project Memory Implementation Plan

Execution Status: proposed / inactive

Baseline: `baseline.md`
Applicable accepted Task Decisions: none separately persisted for this task.

## Current evidence

- `AGENTS.md` already establishes target ownership, shared-workflow reuse boundaries, and the current absence of application/runtime/publication tooling.
- `.codex/project-collaboration/` contains the shared contracts, principles, guide, and Task Alignment contract, but no local README describing the bundle/adoption boundary.
- `.codex/project-specific/` is intentionally absent today.
- Project Memory currently has only core files; `topic-index.md` explicitly says no current-fact topic files have been admitted yet.
- `guideline.md` still describes application architecture and technology choices broadly as open, while the project has since accepted a bounded architecture direction: browser-to-object-storage multipart data plane, stateless control plane, durable upload metadata, storage-side multipart assembly, and distinct resume/content/storage-multipart identities. Provider/runtime/framework/persistence/deployment choices and residual finalization/integrity details remain separate questions.

## Accepted solution

Use one focused documentation/context pass. Add only the routing and durable-memory structure that already has real consumers, then normalize the existing core memory so it no longer conflates accepted architecture direction with still-open technology choices. Do not introduce execution tooling, runtime scaffolding, or placeholder specialists.

## Work items

### WI-1 — Make the shared collaboration adoption boundary explicit

Add `.codex/project-collaboration/README.md` as the local entrypoint for the adopted collaboration bundle. It should:

- identify the files/categories in the bundle and their purpose;
- state that shared collaboration semantics are reusable but repository-local Task State, Project Memory, validation, Git/publication, runtime, and product architecture remain target-owned;
- state that Badminton is provenance/engineering evidence only and not a runtime or product-architecture dependency;
- avoid duplicating the full contracts or creating a second workflow authority.

Do not copy Badminton-specific stage continuation, Issue projection, candidate queue, deployment, or project-specific behavior into this README.

### WI-2 — Add a thin target-specific Agent guidance owner

Create `.codex/project-specific/agent-guidance.md` containing only currently real `large-file-upload` triggers and boundaries, including:

- preserve accepted architecture direction unless changed evidence or explicit user correction requires the owning architecture decision to be revisited;
- use docs-first research for consequential provider/object-storage/checksum behavior;
- do not infer absent validation, publication, deployment, package-manager, or runtime capabilities from shared/source-era text;
- add future project-specific rules/skills only when a repeated target-specific consumer exists.

Make the minimum `AGENTS.md` routing change needed so agents read this supplement when it exists. Do not duplicate generic operating, Task Alignment, planning, review, Git, or safety contracts in the supplement.

### WI-3 — Admit the first routed Project Memory topics and normalize core memory

Create exactly two initial current-fact topics:

1. `.codex/project-memory/topics/architecture-and-upload-lifecycle.md`
   - record the accepted architecture direction that is already settled;
   - distinguish that direction from still-open provider/runtime/framework/persistence/deployment choices;
   - distinguish accepted direction from residual research questions such as authoritative finalization convergence and the whole-file-integrity/dedupe trust model when those are not yet durably settled;
   - point to `docs/product-blueprint.md` as the product boundary rather than copying it.

2. `.codex/project-memory/topics/repository-and-agent-tooling.md`
   - record the currently installed Agent/context capabilities;
   - record the intentional absence of `.repo-tools`, application validation, publication helpers, deployment/runtime tooling, and target-specific specialists beyond the new thin guidance;
   - identify Issue #2 as future work for repository execution/publication tooling without treating that future design as current capability truth.

Update `.codex/project-memory/topic-index.md` so each topic is read only for relevant tasks.

Update `.codex/project-memory/guideline.md` narrowly so its project overview remains concise and it no longer states that all application architecture is open; retain the still-open technology/toolchain facts.

Update `.codex/project-memory/decisions.md` only as needed to preserve the accepted architecture direction as a durable project decision and to clarify its relationship to the earlier bootstrap-era "keep technology choices open" decision. Do not rewrite historical decisions merely for wording consistency.

Do not add a lesson unless implementation uncovers a genuinely reusable, verified lesson not already owned by the new topics or decisions.

## Validation

Because no application toolchain exists, use repository/document validation only:

- verify all new/updated Markdown files are readable from the implementation branch;
- verify `AGENTS.md` routes to the new project-specific guidance without duplicating workflow mechanics;
- verify `topic-index.md` routes to both new topics and that the referenced paths/headings exist;
- verify `guideline.md`, `decisions.md`, and the architecture topic consistently distinguish accepted architecture direction from still-open technology/residual-research choices;
- search the change for accidental claims that Badminton is a runtime/product dependency;
- verify the change adds no `.repo-tools`, package manifest, lockfile, deployment/runtime tooling, placeholder skill/rule/prompt, or application source tree;
- inspect `git diff --check` or an equivalent whitespace/readback check available in the execution environment.

## Acceptance criteria

- A fresh agent can find the collaboration adoption boundary from repository context and determine which concerns remain target-owned.
- A fresh agent is routed to a concise `large-file-upload`-specific guidance file only when project-specific guidance is relevant.
- Project Memory exposes accepted upload architecture direction and current tooling capability state through indexed target-owned topics.
- Core Project Memory no longer contradicts the accepted architecture direction while still truthfully leaving provider/runtime/framework/persistence/deployment and unresolved research choices open.
- No execution/publication/runtime/deployment capability is introduced by this issue.

## Risks and rollback

The primary risk is converting research-stage or source-project assumptions into durable target truth. Keep every architecture statement limited to already accepted direction and mark unresolved areas as unresolved. The change is documentation/context-only and can be rolled back by reverting the focused implementation commit/PR without data or runtime migration.

## STOP conditions

Stop and return to the architecture/task owner instead of guessing if:

- writing the architecture topic requires choosing an unresolved provider, checksum mechanism, finalization state machine, dedupe verification model, runtime, persistence technology, or deployment topology;
- current verified evidence contradicts one of the architecture directions described as accepted;
- a useful outcome appears to require `.repo-tools`, application/package-manager setup, publication automation, deployment/runtime code, or a new project-specific skill/rule rather than thin guidance;
- an existing repository owner already contains the same target-specific fact and the proposed change would create competing authority;
- Project Memory freshness cannot be reconciled without changing the Task Baseline.

## Review boundary

Review only the Agent-context/adoption routing and durable Project Memory changes in this pass. Repository execution/publication tooling belongs to Issue #2; product implementation and unresolved upload-architecture research remain outside this delivery.
