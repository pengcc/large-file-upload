# Task and Change Safety Principles

These are common judgment constraints for project tasks, changes, and reusable design decisions.

This rule is non-authorizing and non-ceremonial. It is not a workflow, approval mechanism, task
taxonomy, or output template. It does not replace `agent-operating-contract.md` or a specialized
workflow skill.

Apply it proportionally. Small, clear tasks should remain direct.

## Proportionality and Scope

Use the smallest useful, safe, reviewable approach that satisfies the current goal and explicit
non-goals.

Avoid unrelated expansion. Mark later-phase possibilities as deferred instead of implementing
them early or treating them as part of the current task.

This principle does not replace workflow-specific clarification, planning, approval, objective
recheck, or scope-drift gates.

## Facts, Assumptions, Uncertainty, and Tradeoffs

Distinguish verified facts from assumptions, inference, uncertainty, and recommendations. Do not
present an assumption as evidence.

Use the Requirement Clarification Gate in `agent-operating-contract.md` when uncertainty can
change direction, scope, safety, user intent, or acceptance criteria. State low-risk assumptions
when the applicable workflow allows them.

Explain material tradeoffs when multiple reasonable approaches affect maintenance, risk, or
reversibility. Do not require a decision framework for routine work with one clear path.

## Task Alignment and Local Task State

Apply the actor-neutral Task Alignment, Task Baseline, establish/reuse/check, and Baseline
Amendment contracts from `.codex/project-collaboration/task-alignment.md`. This rule does not restate or
independently own those semantics.

The following persisted-workspace and Task State lifecycle mechanics are actor-local. They define
where and how this repository stores and protects task contracts without changing their canonical
meaning.

### Persisted Task Workspace and Task State

Use a persisted Task Workspace when a task's multi-round or cross-stage state must remain
unambiguous across collaborators or later planning, execution, review, remediation, or
implementation passes. Small, clear, single-stage tasks may remain inline and direct.

This rule owns the project default Task Workspace root exactly once:

```txt
.project/tasks/
```

Resolve one Task Workspace for the task in this order:

1. Reuse an already established valid persisted Task Workspace for the task.
2. Otherwise use an explicitly established task-specific workspace when it satisfies the
   requirements below.
3. Otherwise use the default root plus the task slug.
4. Stop rather than silently switch or create a second task state when a candidate is local-only or
   ignored, overlaps an authoritative product/source/config/docs/rules/skills area, conflicts with
   the established workspace, or belongs to another task.

A task-specific override must be one dedicated Git-trackable path inside the repository and remain
the task's single workspace unless the user explicitly authorizes relocation. Source, reference,
report, attachment, and `dev_locals/` locations do not redirect Task Workspace resolution or grant
Task State write authority.

The default long-lived Task State branch is:

```txt
task/<task-slug>
```

For a newly established persisted task backed by one unambiguous GitHub Issue, when no task slug,
Task State branch, or Task Workspace has already been established, use the default task slug:

```txt
issue-<issue-number>-<short-task-slug>
```

Record only sparse navigation identity near the top of the new `baseline.md`:

```txt
GitHub Issue: #<issue-number>
Task State branch: task/<task-slug>
Task Workspace: .project/tasks/<task-slug>/
```

These fields identify the same task across GitHub and Task State; they are not Task Baseline
semantics, do not copy the Issue body, and do not authorize Issue or Project mutation. Preserve an
already established valid task slug, branch, or workspace exactly; do not rename or migrate
existing Task State merely to adopt this default.

When a persistence-worthy task has no established Task State branch, the applicable planning owner
may establish that exact Task State branch as part of initial Task State establishment.

Create it from verified current repository truth, normally the current default branch, unless an
existing project authority specifies another base. Immediately before creation, verify that the
remote Task State branch does not already exist. Create it non-destructively and without force.

If the branch appears concurrently, stop and re-read it rather than overwriting or creating a
competing Task State. The initial Task State mutation must remain confined to the resolved Task
Workspace.

Only the resolved Task Workspace on that branch is canonical Task State. The branch remains
available across task stages and implementation passes; it is not an implementation branch and is
not merged or deleted merely because planning or one pass completes. Files outside the workspace
are only the branch's historical repository snapshot. Read current repository behavior from the
current implementation baseline or actual branch/PR under review, and read Project Memory from its
current authoritative source.

Canonical Task State access is branch-aware. Reading or maintaining Task State must not require
switching, resetting, cleaning, or otherwise disturbing an unrelated occupied checkout.

When the current checkout is not the exact Task State branch, read canonical Task State through the
exact branch/ref or remote source and perform authorized writes through an isolated branch-scoped
mechanism available to the actor. This may use an isolated worktree, Git/ref-safe operation, or
connector-backed branch mutation; it does not require introducing an automated worktree manager.

Never treat the same Task Workspace path on another branch as canonical merely because that path
exists there. If no non-disruptive branch-aware access path is available, stop rather than disturb
unrelated work.

When the current checkout is not the exact Task State branch, read canonical Task State through the
exact branch/ref or remote source and perform authorized writes through an isolated branch-scoped
mechanism available to the actor. This may use an isolated worktree, Git/ref-safe operation, or
connector-backed branch mutation; it does not require introducing an automated worktree manager.

Never treat the same Task Workspace path on another branch as canonical merely because that path
exists there. If no non-disruptive branch-aware access path is available, stop rather than disturb
unrelated work.

Task-level contracts are the Task Baseline and, when needed, persisted Task Decisions. Resolve the
Task Decisions category inside the canonical Task Workspace from:

- `task-decisions.md` when present; and
- existing workspace artifacts whose current content and status explicitly identify accepted
  Product Decisions for that task.

Accepted Product Decision content is a Task Decision under the current semantics; its retained
filename does not create another decision category or owner. Preserve valid existing artifacts
without migration, aliases, or duplicate copies. Read the applicable accepted set once by meaning,
and stop on conflicting or ambiguous decision authority rather than selecting by filename.

Persisted implementation plans are pass-level execution contracts. Keep semantically distinct
passes in purpose-named files such as `homepage-implementation-plan.md` and
`homepage-review-remediation-plan.md`; revise the same pass in the same file and rely on Git
history instead of `v2`, `updated`, or `final` filenames.

At any moment, a persisted Task State may contain at most one persisted plan whose contract says:

```txt
Execution Status: approved / active
```

Zero active persisted plans means no persisted plan is currently selected; it does not invalidate
another eligible and explicitly approved execution-input form. One identifies the current
persisted-plan input. More than one is contradictory Task State and requires stopping instead of
guessing. Explicit approval authorizes the planning owner to activate the selected persisted plan,
deactivate any prior active plan as appropriate, and persist that Task State checkpoint. The
approval is not yet an executable persisted-plan handoff until the guarded checkpoint succeeds on
the exact Task State branch and workspace. A downstream executor must stop on a missing or failed
activation instead of synthesizing active state or repairing Task State from an implementation
branch. Terminal delivery closeout, supersession, or replacement keeps the historical plan in the
workspace with a non-active status.

A persisted delivery plan must not remain `approved / active` after the delivery becomes terminal:
the delivery was merged and post-merge closeout is being performed, or it was explicitly abandoned
or superseded.

`approved / active` selects the current persisted execution contract; it is not a permanent history
status. Local implementation completion, review acceptance, and an unmerged review-ready PR are
non-terminal. The plan may remain active through review and approved before-merge remediation on
the same delivery branch and PR. Reapproval after the governing contract is stopped, revised, and
reviewed does not by itself create a new delivery or require a replacement branch or PR.

When the delivery becomes terminal, the owning Task State workflow must persist a truthful
non-active status before another persisted plan is selected or task closeout is claimed. An
abandoned or superseded delivery must not be represented as merged.

Do not add a manifest, registry, or current-plan pointer for this purpose.

Once implementation starts, freeze its selected approved execution input for that pass. For a
persisted-plan pass, the governing contract is the Task Baseline, applicable accepted Task Decisions
resolved through the actor-local mapping above, and the approved/active plan. Do not poll Task State
during execution. A user, planner, or reviewer
that needs to change a governing contract must first stop the implementation, then revise, persist
when applicable, review, and reapprove it. Execution-discovered evidence, ambiguity, drift, or risk
still triggers the owning execution STOP condition.

Each implementation pass uses a separate normal implementation branch based on the current
implementation baseline, normally current `main`. Before-merge remediation may continue on that
branch under an approved correction input; a later post-merge pass starts from the then-current
implementation baseline on a new branch. Review the actual implementation target against every
relevant approved execution contract in its delivery lineage; active-plan uniqueness selects the
next persisted execution contract and does not erase earlier delivery authority.

Persist only task evidence that materially supports later continuation, review, replanning,
Task Decision changes, Baseline freshness, or another pass. Detailed commands, logs, and debug
chronology may remain local. After merge, closeout re-reads current implementation truth, promotes
durable facts, decisions, and lessons through their existing owners when useful, and records the
delivery's truthful terminal plan state. When the final current-head review or acceptance step
already established completion readiness, closeout consumes that judgment and revalidates only
facts that could have changed since it ran. Persist only the terminal status and minimal useful
delivery identity; reconcile an explicitly related parent only when the mapping remains
unambiguous, and keep Issue/Project changes as non-authoritative projections. A failed projection
does not undo a verified merge. The terminal non-active Task State checkpoint remains required for
a persisted delivery, but another deferred follow-up blocks closeout only when the Task Baseline,
an accepted Task Decision, an applicable completion contract, or another verified
task-specific requirement makes that follow-up necessary for truthful task completion. The fact
that work concerns Task State, Project Memory, an Issue or Project projection, or another durable
artifact does not by itself make it a closeout blocker.

When future knowledge or evidence must survive but its later handling is batchable, closeout may
complete after the applicable existing durable carrier effect succeeds and is verified. An
attempted, failed, or unverified carrier effect is not durable preservation. If direct handling is
not completed instead, closeout remains incomplete on that preservation condition, not on later
publication by default. A later disposition that publishes, narrows, rejects, or invalidates a
safely preserved batchable item does not reopen its completed source task.

Canonical source Task State for an intentionally blocking deferred dependency must state what is
unresolved, why it blocks truthful completion, the verified condition that resolves it, and the
existing owner or authoritative event that can establish that condition. When another workflow
later verifies the condition, it returns that evidence to the source-task lifecycle owner. Only
that owner may perform one bounded Task State reconciliation under the existing exact-branch,
workspace, predecessor, and compare-and-swap safeguards. The reconciliation changes task-level
closeout truth only; it does not reactivate a terminal Implementation Pass, grant the resolver Task
State mutation authority, or create another delivery. Explicit abandonment or supersession may
close the plan without promoting unmerged implementation as current truth. Task State branch merge
or deletion is not required for closeout.

Downstream workflows must consume this resolver and lifecycle contract rather than copying the
default root or establishing competing Task State semantics. This rule does not authorize
implementation, Task State mutation, commits, remote persistence, publication, merge, release, or
deployment; those authorities remain with `agent-operating-contract.md` and the owning workflows.

## Focused, Reviewable Changes

Keep changes cohesive. Avoid mixing unrelated refactors, features, formatting churn, and cleanup
in one change.

Prefer small, reversible updates that can be understood and validated in one review pass. Use
work-item decomposition when independent outcomes or safety boundaries make one pass difficult to
review.

## Validation and Evidence

Use the smallest meaningful validation that covers the affected behavior or content boundary.
Report failed or skipped validation and any remaining uncertainty.

Verify external or remote state through authoritative evidence. Manual confirmation expresses
intent but does not prove external state. Place confirmations at meaningful safety boundaries
rather than every mechanical step.

## Change Safety

Preserve mature files and prefer targeted edits unless full replacement is explicitly justified
and easier to verify.

Treat large deletions, major line-count drops, and replacement of mature content with stubs as
destructive-risk signals. Stop and review before continuing.

Choose the update method by review safety:

- isolated edits: direct patch;
- coordinated changes within one file: full-file replacement only when safer to review; and
- coordinated multi-file changes: a bounded bundle with complete diff review.

For rename or migration work, search before and after the change. Classify remaining references
as current, historical, or stale instead of assuming every match should change.

## Plausible Extension Check

Apply this check only when designing a reusable system or durable architecture, installer,
workflow, framework-like, ownership, taxonomy, or module boundary. It is not a checklist for every
small task.

Consider one or two credible adjacent uses. Preserve only cheap structural optionality when it
prevents foreseeable coupling, such as clear naming, static grouping or classification, separate
ownership axes, report-only boundaries, or separation of decisions from side effects.

Do not implement speculative profiles, plugin systems, package managers, dependency solvers,
migration engines, semantic merge, extension APIs, or other deferred capabilities without
demonstrated need. Plausibility may justify a cheap boundary; it does not justify future behavior.

When a proposed solution adds meaningful conditional complexity, follows repeated failed fixes,
or changes a high-risk workflow boundary, reassess the ownership model and smallest sufficient
alternative inside the active workflow. Route unresolved design decisions to their planning owner;
use Product Framing only when end-user meaning is missing or stale. Keep clear routine tasks direct.

## Authority Boundary

Hard startup, project-memory, target-reference, clarification, project-root, global-tooling,
routing, reporting, publish, and external-action boundaries remain directly owned by
`agent-operating-contract.md` and the applicable workflow skills.

This rule guides judgment only. It never authorizes file mutation, dependency or tooling changes,
external actions, publishing, merge, release, or deployment.
