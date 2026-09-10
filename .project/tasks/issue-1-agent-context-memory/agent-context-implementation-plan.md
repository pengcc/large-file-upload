# Issue #1 — Agent Context and Project Memory Implementation Plan

Execution Status: approved / active

Baseline: `baseline.md`
Applicable accepted Task Decisions: none separately persisted for this task.

## Current evidence

- `AGENTS.md` establishes target ownership and shared-workflow reuse boundaries, and now routes to installed target-owned `open-or-update-pr` / `merge-pr` workflows backed by dependency-free Node repository publication commands. Application runtime, package manager, application validation, deployment, automated worktree management, and target-specific specialists remain absent.
- `.codex/project-collaboration/` contains the shared contracts, principles, guide, and Task Alignment contract, but no local README describing the bundle/adoption boundary.
- `.codex/project-specific/` is intentionally absent today.
- Project Memory currently has only core files; `topic-index.md` explicitly says no current-fact topic files have been admitted yet.
- `guideline.md` now records the installed repository publication/merge capability and still-open application technology choices, but it still does not durably own the accepted bounded architecture direction: browser-to-object-storage multipart data plane, stateless control plane, durable upload metadata, storage-side multipart assembly, and distinct resume/content/storage-multipart identities. Provider/runtime/framework/persistence/deployment choices and residual finalization/integrity details remain separate questions.
- `decisions.md` still contains a bootstrap-era D-003 impact sentence stating that a missing publication/PR helper must degrade or stop; that current-state clause became stale when Issue #2 installed the target-owned publication/merge owner. The underlying application-validation decision and prohibition on inferring source-era package commands remain valid.

## Accepted solution

Use one focused documentation/context pass. Add only the routing and durable-memory structure that already has real consumers, then normalize the existing core memory so it no longer conflates accepted architecture direction with still-open technology choices or stale pre-publication-tooling state. Do not introduce or expand execution tooling, runtime scaffolding, or placeholder specialists.

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
- use the installed target-owned publication/merge workflows and repository command owner for publication mechanics, while not inferring still-absent application validation, deployment, package-manager, runtime, worktree automation, or other capabilities from shared/source-era text;
- add future project-specific rules/skills only when a repeated target-specific consumer exists.

Make the minimum `AGENTS.md` routing change needed so agents read this supplement when it exists. Do not duplicate generic operating, Task Alignment, planning, review, Git/publication, or safety contracts in the supplement.

### WI-3 — Admit the first routed Project Memory topics and normalize core memory

Create exactly two initial current-fact topics:

1. `.codex/project-memory/topics/architecture-and-upload-lifecycle.md`
   - record the accepted architecture direction that is already settled;
   - distinguish that direction from still-open provider/runtime/framework/persistence/deployment choices;
   - distinguish accepted direction from residual research questions such as authoritative finalization convergence and the whole-file-integrity/dedupe trust model when those are not yet durably settled;
   - point to `docs/product-blueprint.md` as the product boundary rather than copying it.

2. `.codex/project-memory/topics/repository-and-agent-tooling.md`
   - record the currently installed Agent/context capabilities, including the target-owned publication/merge workflows, direct-Node `.repo-tools` publication kernel, and Codex publication guard hook established by completed Issue #2;
   - record their ownership boundary: Agent workflows own intent/authorization while repository tooling owns mechanical publication/readiness/merge execution;
   - record the intentional absence of application validation, deployment/runtime tooling, automated worktree management, package-manager/application runtime choices, and target-specific specialists beyond the new thin guidance;
   - keep the repository-tooling Node dependency distinct from any future application-runtime decision;
   - describe only current capability truth; do not store future issue tracking or planned implementation details as Project Memory.

Update `.codex/project-memory/topic-index.md` so each topic is read only for relevant tasks.

Update `.codex/project-memory/guideline.md` narrowly so its project overview remains concise, preserves the installed publication/merge capability truth, and no longer leaves the already accepted architecture direction implicit; retain the still-open technology/toolchain facts.

Add a new durable project decision in `.codex/project-memory/decisions.md` for the accepted architecture direction. That decision must preserve the distinction between:

- settled direction: browser-to-object-storage multipart transfer, stateless control plane, durable upload metadata, storage-side multipart assembly, and separate resume/content/storage-multipart identities; and
- still-open implementation/technology choices: provider, runtime, framework, persistence technology, deployment topology, checksum mechanism, finalization convergence details, and dedupe/integrity verification model until their owning research settles them.

Keep the earlier bootstrap-era decision about leaving technology choices open as historical context; do not rewrite it as if the later architecture direction had already existed at bootstrap time.

Update D-003 only enough to remove or historicalize its now-false current-state implication that publication/PR helpers are missing. Preserve D-003's application-validation ownership, package-manager neutrality, and prohibition on treating source-era publication commands as current target truth.

Do not add a lesson unless implementation uncovers a genuinely reusable, verified lesson not already owned by the new topics or decisions.

## Validation

Because no application toolchain exists, use the current repository-owned repository/context validation boundary rather than inventing application validation:

- run the existing direct Node repository-tool tests to confirm the installed publication/merge/hook capability remains intact;
- verify all new/updated Markdown files are readable from the implementation branch;
- verify `AGENTS.md` routes to the new project-specific guidance without duplicating workflow mechanics and continues to route publication/merge through their installed owners;
- verify `topic-index.md` routes to both new topics and that the referenced paths/headings exist;
- verify `guideline.md`, `decisions.md`, and the architecture topic consistently distinguish accepted architecture direction from still-open technology/residual-research choices;
- verify the repository/tooling topic accurately represents the already-installed Issue #2 publication/merge capability and still-absent application/runtime/deployment/worktree capabilities;
- search the change for accidental claims that Badminton is a runtime/product dependency;
- verify the change does not modify or expand `.repo-tools`, publication/merge workflow implementations, Codex publication hooks, package manifests, lockfiles, deployment/runtime tooling, placeholder skill/rule/prompt packages, or application source;
- inspect `git diff --check` or an equivalent whitespace/readback check available in the execution environment.

## Acceptance criteria

- A fresh agent can find the collaboration adoption boundary from repository context and determine which concerns remain target-owned.
- A fresh agent is routed to a concise `large-file-upload`-specific guidance file only when project-specific guidance is relevant.
- Project Memory exposes accepted upload architecture direction and current tooling capability state through indexed target-owned topics.
- Project Memory truthfully represents the installed publication/merge capability without conflating its Node tooling dependency with an application-runtime choice.
- Core Project Memory no longer contradicts the accepted architecture direction or the post-Issue-#2 tooling state while still truthfully leaving provider/runtime/framework/persistence/deployment and unresolved research choices open.
- The accepted architecture direction has one durable Project Decision owner rather than being implied only by conversation or topic prose.
- No new or expanded execution/publication/runtime/deployment capability is introduced by this issue.

## Risks and rollback

The primary risk is converting research-stage or source-project assumptions into durable target truth, or accidentally duplicating the publication mechanics already owned by Issue #2. Keep every architecture statement limited to already accepted direction, mark unresolved areas as unresolved, and represent existing publication tooling by reference/ownership rather than restating its mechanics. The change is documentation/context-only and can be rolled back by reverting the focused implementation commit/PR without data or runtime migration.

## STOP conditions

Stop and return to the architecture/task owner instead of guessing if:

- writing the architecture topic requires choosing an unresolved provider, checksum mechanism, finalization state machine, dedupe verification model, runtime, persistence technology, or deployment topology;
- current verified evidence contradicts one of the architecture directions described as accepted;
- a useful outcome appears to require modifying or expanding `.repo-tools`, publication/merge workflows or hooks, application/package-manager setup, deployment/runtime code, worktree automation, or a new project-specific skill/rule rather than thin guidance;
- an existing repository owner already contains the same target-specific fact and the proposed change would create competing authority;
- Project Memory freshness cannot be reconciled within the amended Task Baseline and current target-owned memory owners.

## Review boundary

Review only the Agent-context/adoption routing and durable Project Memory changes in this pass. The publication/merge tooling delivered by completed Issue #2 is current input truth and must be represented accurately, but its implementation is not modified or re-reviewed here. Product implementation and unresolved upload-architecture research remain outside this delivery.
