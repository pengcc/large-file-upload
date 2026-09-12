# Agent Operating Contract

## Purpose

This rule defines the first-run and daily operating contract for agents working in this project.

Keep this contract concise and operational. Use the relevant workflow skill for details.

## Startup Order

When adopting this project for agent-assisted work for the first time, start in this order:

```txt
AGENTS.md
-> project-memory
-> agent-roles-and-capabilities
-> initialize-project-context
-> routed follow-up skill
```

Do not jump directly into feature planning or implementation before initialization unless the user explicitly accepts the risk.

`grilling` is not the first startup step. Use it when goals, scope, requirements, constraints, or
decision branches remain materially unclear after checking available project context.

## Project Memory Context Gate

Before a workflow produces project-state output or changes project state, pass the Project Memory
Context Gate defined in the installed `project-memory` skill. Use its source selection, sequence,
reporting interface, and continuation rules rather than redefining them in this contract or in
individual workflow skills.

## Explicit Target Reference Guardrail

Before treating a concrete repository path as evidence, authoritative instructions, a workflow
input, a required dependency, or a target to inspect, modify, review, or validate:

1. resolve it against the current project or source layout;
2. verify that it exists as the expected file or directory;
3. compare it with current sources and known renames or migrations when locations conflict;
4. for skill packages, verify that the physical root matches `metadata.yml` category when
   relevant; and
5. classify the reference as current, unavailable, stale or obsolete, inconsistent, prospective,
   or historical.

Do not treat a path as a missing existing target when it is explicitly a new output to create, a
wildcard or placeholder, a clearly marked example, or part of a clearly historical decision,
design log, completed plan, or research report. For prospective output, verify its intended
parent, scope, and creation authority instead of requiring the final target to exist.

If a required existing target is missing, stale, or inconsistent, report the referenced path,
expected role, and observed state. Do not silently substitute a guessed path or claim the target
was read or applied. Stop and ask for direction when the target is required for correctness,
scope, safety, or workflow authority. If it is non-blocking, continue only after marking the
reference unavailable, stale, or historical and explaining the limited impact.

Installed meta skills use `.codex/skills/meta/<meta-skill>` and installed core skills use
`.codex/skills/core/<core-skill>`. A meta skill referenced under `.codex/skills/core/` is stale
unless the reference is clearly historical. Verification does not authorize creating, editing,
moving, deleting, backing up, migrating, or cleaning targets; those actions require the active
approved workflow. The installer does not automatically clean obsolete installed paths.

## Requirement Clarification Gate

Do not assume a user request is clear, complete, or scope-stable.

After checking available evidence, pause when unresolved ambiguity can materially change the
governing task or execution contract: user intent or accepted outcome, scope or authority,
safety/risk/reversibility or loss boundary, architecture or ownership, data integrity or destructive
behavior, external or consequential effects, or acceptance criteria. State the ambiguity plainly,
provide the recommended interpretation or next decision, and ask the user to confirm before
proceeding.

Ordinary implementation choices inside an authorized boundary remain executor-owned. Discovering
the natural existing file, helper, or regression-test location is not itself a clarification
trigger. For low-risk reversible assumptions, proceed only when the active workflow allows it and
the assumption is explicitly stated.

Use `grilling` when ambiguity is broad, branching, decision-heavy, baseline-blocking, or requires
systematic requirement discovery. Do not route every tiny ambiguity to `grilling`.

## Project Root Boundary

The current project root is the default file-operation boundary.

The external-infrastructure topic selected by `.codex/project-memory/topic-index.md` may define a
bounded allowlist of project-related external development infrastructure. Read that topic before
using such a resource. Operations within the allowlist do not require repeated confirmation merely
because the resource is outside the repository root.

Approved operations must remain directly related to the active task and within the resource types,
purposes, and cleanup boundaries defined by the selected external-infrastructure topic.

Generic authorization for project-scoped temporary files, directories, caches, containers, or test
resources does not authorize creating or mutating another Git worktree or repository checkout
outside the project root. A new external Git worktree or checkout requires explicit prior user
authorization or an already explicitly established project resource contract for that exact
purpose. This does not prohibit Git worktrees generally or restrict ordinary temporary build and
test resources covered by their existing contracts.

All other out-of-project writes, destructive operations, or resource access require explicit user
approval of the resource, purpose, risk, and cleanup or rollback approach.

Read-only global toolchain diagnostics are allowed when needed to distinguish project-local state
from machine state.

## Global Toolchain and Out-of-Project Operation Boundary

Project-local runtime configuration and global machine configuration are separate trust
boundaries.

Without explicit user approval, agents must not install, upgrade, downgrade, unlink, relink,
configure, or otherwise mutate:

- Homebrew or other system package managers and packages
- Node.js, pnpm, npm, corepack, mise, Volta, or global package managers
- shell profiles such as `.zprofile`, `.zshrc`, or `.bashrc`
- PATH configuration
- global Git configuration
- files or resources outside the current project root that are not explicitly pre-authorized by
  the indexed external-infrastructure Project Memory topic

Read-only diagnostics are allowed without approval. Examples include `node -v`, `which node`,
`which -a node`, `pnpm -v`, `mise current`, `mise doctor`, `brew info`,
`brew list --versions`, Homebrew log inspection, PATH inspection, shell-profile inspection without
editing, and Git configuration inspection without modification.

Mutating commands such as `brew install`, `brew upgrade`, `brew reinstall`, `brew link`,
`brew unlink`, `mise use -g`, non-project/global `mise install`, `pnpm env use`,
`corepack enable`, shell-profile edits, PATH changes, and global Git configuration changes require
explicit approval.

Using approved project-related external infrastructure is not equivalent to changing global
tooling or machine configuration.

If required tooling is missing or wrong:

1. stop the affected workflow
2. report the detected version
3. report the required version
4. report the failing command
5. distinguish global runtime state from project-local runtime state
6. recommend a manual fix and explain global-change risk
7. wait for explicit approval before running a mutating command

Never silently change global tooling to make validation pass. If a global or non-pre-authorized
out-of-project change is required, report it instead of assuming it is safe.

## Workflow Routing Enforcement

Use `agent-roles-and-capabilities` as the canonical owner for task-to-role and workflow routing,
including bootstrap-safe route selection and the Role Routing Display Condition. Then use the
matching installed workflow instead of bypassing it. Workflow owners retain their local triggers,
consequences, outputs, degraded fallbacks, and authorization boundaries.

If a referenced workflow is unavailable, state that clearly. Use an alternate workflow only when
the owning canonical route or the selected workflow's local contract explicitly defines a valid
degraded fallback. Apply that fallback only within its stated scope, preserve its reduced
conclusions, and do not imply that it inherits the missing workflow's authority.

Block when a missing workflow is required for correctness, scope, safety, authorization, an
external action, or the requested completion conclusion and no explicit degraded fallback covers
the need. Do not select a merely similar or convenient workflow as an implicit substitute.

When a technology-specific or domain-specific skill would be useful but is not installed, follow
the Missing Specialist Skill Policy in `agent-roles-and-capabilities`; do not treat an optional
specialist as a missing required workflow or define a separate specialist policy here.

## Workflow-Local Alignment Sequence

Apply the collaboration and authority hierarchy in
`.codex/project-collaboration/project-collaboration-guide.md`. Repository-local workflow mechanics below
specialize that project-collaboration contract without becoming a second semantic owner.

After bootstrap-safe primary workflow routing, every complex or project-related workflow applies
the relevant parts of this order:

1. pass the Project Memory Context Gate when project state matters;
2. when a current Task Baseline already governs the exact task, locate and read it, then apply the
   reuse, freshness, conformance, and amendment rules in
   `.codex/project-collaboration/task-alignment.md`;
3. only when the selected workflow or current task authority requires a persisted cross-stage
   contract, route missing establishment to the applicable planning owner after resolving missing
   or blocking inputs. The planning owner may use focused Product Framing for missing end-user
   behavior inputs and `grilling` for missing or blocking baseline inputs;
4. when an applicable existing baseline is invalidated by verified evidence or an explicit user
   correction, stop and report the canonical `Baseline Amendment Required` contract before
   returning to the applicable planning owner;
5. activate or apply task-specific supporting-role and specialist lenses, and load broader
   technical context, only after those gates; and
6. select the stage-specific solution or artifact, execute, or produce the review conclusion under
   the owning workflow.

A direct bounded delivery request does not require Task Alignment establishment, persisted Task
State, a formal plan, Plan Review, Plan Approval, or another execution-contract artifact. If a
current Baseline or accepted Task Decision already governs the exact task, consume it without
reconstructing or amending it. If execution discovers a material scope,
authority, safety, or user-decision boundary, stop under the direct execution contract; do not
manufacture the full lifecycle merely to pre-screen direct work.

Primary route selection remains bootstrap-safe and precedes this sequence. Product Framing remains
subordinate product-behavior authority and is repeated only when missing or changed end-user
behavior blocks the current stage. Task Alignment is a mandatory reasoning gate, not a required
visible form or status ceremony when it applies. Existing startup, authorization, project-root,
global-tooling, Git, publication, merge, release, deployment, and external-action boundaries remain
unchanged.

## Persisted Task State Mutation and Remote Persistence Guard

When Task Alignment requires persisted cross-stage state, resolve its Task Workspace using
`.codex/rules/task-and-change-safety-principles.md`. Actors already authorized by their planning or
review workflow have standing authority to maintain canonical Task State only within this exact
boundary:

```txt
repository: the exact active project repository
branch:     the exact Task State branch
paths:      the resolved Task Workspace/** only
```

This authority covers non-destructive Task State edits, the local checkpoint commit needed to
record them, and synchronization to the exact remote Task State branch. It includes persisting an
explicitly approved plan's active-state transition and deactivating a prior active persisted plan
when required by the shared uniqueness invariant. It does not authorize implementation changes or
generic repository publication.

For initial Task State establishment, this authority also covers non-destructive creation of the
exact resolved Task State branch when it does not yet exist and the current planning workflow is
authorized to establish the persisted Task State.

Verify branch absence immediately before creation and use create-if-absent / non-force semantics.
If the branch already exists or appears concurrently, re-read and reconcile through the owning task
workflow instead of replacing it.

Immediately before a remote mutation, the writer must verify the current remote Task State, the
exact branch, a cleanly attributable Task Workspace-only diff, and fast-forward or equivalent
compare-and-swap safety. Synchronize only when the remote state is the verified predecessor. On
divergence, concurrent change, mixed scope, stale evidence, or inability to prove the boundary,
stop, re-read, and reconcile through the owning task workflow; never force or overwrite.

Standing Task State authority does not authorize switching, resetting, cleaning, or repurposing an
unrelated occupied checkout.

Before creating a local Task State checkpoint, either verify that the current checkout is the exact
Task State branch and is safe for that task, or use an isolated branch-aware write path. If an
unrelated checkout would have to be disturbed and no safe isolated path is available, stop instead.

The phrase `isolated branch-aware write path` and standing Task State authority do not themselves
authorize creating or mutating a Git worktree or repository checkout outside the project root. Use
an existing exact-ref, connector-backed, or other non-disruptive mechanism when available. If a new
external worktree or checkout is required and no explicit prior authorization or established
resource contract covers it, stop and request authorization instead of treating a generic
temporary-directory allowance as sufficient.

Task State authority explicitly forbids:

- writing another branch or any path outside the resolved Task Workspace;
- mixing Task State with source, configuration, Project Memory, docs, rules, skills, tests, or
  implementation changes;
- inferring Task State location or write authority from an attachment, source, report, reference,
  or `dev_locals/` path;
- resolving a workspace into an existing authoritative product/source/config/docs/rules/skills
  area merely to obtain standing write authority;
- deleting or renaming branches, force-updating refs, rewriting history, deleting unrelated
  content, or mutating another Task Workspace;
- silently overwriting concurrent or divergent remote Task State; and
- creating or updating a PR, merging, releasing, deploying, or treating the checkpoint as generic
  publication authority.

Implementation approval does not turn the Task State branch into an implementation branch. An
implementation pass runs on its separately authorized implementation branch and must not mutate
canonical Task State from that branch. Writer-side freshness checks protect discrete Task State
writes; they must not become continuous or periodic Task State polling during implementation.

## Concise Output Contract

Stay concise, but not incomplete.

Use the shortest format that preserves:

- correctness
- project terminology
- decisions
- risks
- validation status
- next actions

Do not produce long reports when a short answer is enough. Do not compress away important uncertainty, warnings, or decisions.

## Report Depth Levels

Use the smallest report depth that preserves correctness and decision quality.

- `Brief`: simple answers, confirmations, or work with no meaningful repository mutation.
- `Standard`: normal planning, implementation, review, publish, or PR work.
- `Detailed`: audits, architecture decisions, high-risk changes, ambiguous requirements,
  user-requested deep analysis, or multi-step validation.

Concise does not mean incomplete.

Meaningful reports should preserve:

- what changed, what was reviewed, or what was decided
- validation status
- risks, uncertainties, blockers, or scope deviations when present
- approved external/global actions or material uncertainty about them
- next recommended step

## Durable Project Memory Loop

After meaningful planning, implementation, debugging, review, publishing, installation, or major
discussion, consider whether durable project memory should be updated. Use
`update-project-memory` for admission, classification, destination selection, and confirmed
writes.

Do not silently update Project Memory or treat plans, handoffs, logs, scratch notes, or unverified
assumptions as durable truth.

## Evidence-First Research

Use `docs-first-research` when work depends on consequential external technical facts or an
external skill reference. It applies `docs-first-policy` for source precedence, conflict handling,
provenance, and external-source safety.

Project files and selected Project Memory remain the source of truth for project-specific facts.
Research verifies external claims; it does not grant adoption, installation, mutation, or
publication authority.

## Scope and Safety Guardrails

Apply `task-and-change-safety-principles.md` for proportional scope, focused and reviewable
changes, validation and evidence, safe update methods, and conditional design flexibility. That
shared rule guides judgment only; it does not replace any startup, context, approval, project-root,
global-tooling, routing, memory, reporting, publish, or other hard boundary in this contract.

- Do not expand scope without calling it out.
- Do not bypass matching installed skills.
- Do not perform destructive actions unless they are explicitly authorized by the user or fall
  within disposable infrastructure pre-authorized by the indexed external-infrastructure Project
  Memory topic.
- Do not publish through an Agent workflow unless current authority permits that exact effect. A
  recognized user request to execute ordinary implementation or same-delivery remediation may
  supply the `open-or-update-pr` owner's narrow authority for one review-ready PR unless the user
  explicitly selected `keep local`, `no push`, `no PR`, or an equivalent local-only constraint.
  Direct bounded delivery, arbitrary file-producing work, plan approval, a commit request, generic
  readiness, and a publishable-change handoff do not independently gain that publication authority.
  Merge, release, and deployment still require their own separate explicit authority.
- Do not introduce dependencies, tooling, architecture changes, or workflow changes without checking project memory and explaining impact.
- Prefer small, reversible changes.
- Do not treat project-approved external development infrastructure as unrestricted access to
  unrelated application data or machine resources.

## Final Report Boundary

Report every external or global action performed with explicit approval, including its command or
change, approval, reason, and result. Also surface a relevant external/global blocker or
uncertainty. Do not report a no-op absence of such action unless it affects the user's decision or
a narrower workflow explicitly requires it.

## Publishable Change Handoff

After file-producing work, read and apply `references/publishable-change-handoff.md` completely.
Apply that reference's state-specific classification and emit only the one helper it selects.
`change:pr` remains the direct-human helper for dirty/raw changes; a clean committed, current,
unpublished delivery uses `pr:open-or-update`; stale deliveries and current open PRs emit no
publication helper.

The helper does not authorize an Agent to publish.

The bounded Task State checkpoint and exact Task State branch synchronization authorized by the
Persisted Task State Mutation and Remote Persistence Guard is the narrow exception to the normal
push / PR workflow.

Outside that exception, `open-or-update-pr` remains the only Agent workflow authorized to push
implementation or other ordinary repository commits and create or update a PR. `merge-pr` remains
the only Agent workflow authorized to perform immediate merge; canonical persistent auto-merge is
deferred. Each external mutation still requires the authority defined by its owning workflow.
