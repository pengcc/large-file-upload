# Execute Plan Skill

## Role Routing Integration

Use `agent-roles-and-capabilities` as the canonical owner for the `Approved implementation` route
and the Role Routing Display Condition. Read or apply that route before continuing. When display is
required, render its canonical fields without maintaining a local copy. Do not claim the canonical
routing skill was used unless it was actually read or applied.


Use this skill to execute a current approved execution contract or a direct bounded delivery
request safely, in bounded steps, with validation.

This is an execution workflow. It does not create a new plan.

## Role

When using this skill, act as:

```txt
Implementation Executor
```

The Implementation Executor verifies the selected execution input, executes it in controlled
batches, validates changes, pauses on risk or scope drift, and reports the final result.

## Core Boundary

```txt
execute-plan = execute a current approved execution contract or direct bounded delivery request
plan-with-context = create plan
docs-first-research = verify technical assumptions
update-project-memory = update durable project memory
open-or-update-pr = push existing commits + create/update one PR
merge-pr = immediately merge one exact PR
```

`execute-plan` must not expand scope, silently update project memory, or treat generic Codex UI execution as a trusted project workflow boundary.

## Project Memory Context Gate

Before execution, pass the Project Memory Context Gate defined in the `project-memory` skill and
consume its result in the execution context. Then consume the governing authority in order:

```txt
current Task Baseline, when applicable
+ applicable accepted Task Decisions
+ selected execution contract
+ current implementation truth
```

Resolve applicable accepted Task Decisions through the actor-local Task Workspace mapping in
`.codex/rules/task-and-change-safety-principles.md`. Consume each accepted decision once by meaning;
do not create a second decision set from retained Product Decision filenames.

Confirm freshness and conformance without reconstructing, paraphrasing, or amending any governing
contract. If material drift invalidates the Baseline, a Decision, or the selected execution
contract, stop and return to the applicable governing owner or selected input boundary; do not
redefine the gate here.

For a persisted task, read canonical Task State only from the resolved Task Workspace. Read current
repository behavior from the current implementation baseline or actual implementation target, and
read Project Memory from its current authoritative source. The long-lived Task State branch's
non-workspace snapshot is historical context, not current repository truth.

## Execution Input Dispatcher

Select exactly one execution input and read its reference completely:

| Execution input | Required reference |
|---|---|
| Current approved execution contract | `references/inputs/approved-execution-contract.md` |
| Direct bounded delivery request | `references/inputs/direct-bounded-delivery-request.md` |

Do not read the other input contract. The selected reference owns readiness, completeness,
approval, and mode restrictions. The approved execution-contract reference evaluates substantive
authority and currentness without requiring a category name. The direct bounded input reference
owns its distinct direct-authority boundary and must not be reconstructed as a planning artifact.

When the selected input is a persisted Task Workspace plan, resolve the workspace through
`.codex/rules/task-and-change-safety-principles.md` and require that plan to be the single persisted
plan marked `approved / active`. Stop on zero or competing active persisted plans rather than
selecting by filename, recency, or convenience. Do not apply that invariant to another eligible
input form or require every execution input to become a persisted plan.

If no eligible input exists, stop and recommend:

```txt
Suggested workflow: plan-with-context
```

When a candidate direct bounded request reaches its STOP boundary, report that concrete boundary
and let the user choose broader direct authority or the planned path instead of automatically
selecting planning.

## Execution Contract

Treat the approved execution contract or direct bounded delivery request as the selected execution
contract. The Task Baseline and applicable accepted Task Decisions remain separate governing
contracts when they already apply; no layer silently changes another.

Freeze the selected execution input when the pass begins, except for a bounded clarification that
the direct input reference expressly permits. Do not continuously or periodically poll Task State
for changes. A user, planner, or reviewer that wants to change a governing Baseline, accepted Task
Decision, or persisted plan must explicitly stop the active implementation first, revise and
persist the applicable contract, complete required review, and obtain reapproval before
implementation resumes or restarts. Verified evidence discovered by the executor still triggers
the existing drift and amendment STOP conditions.

Every changed hunk must conform to the complete governing authority and map to one of:

- an approved implementation step or allowed mutation
- an approved validation step
- an approved project memory or design-log update

If a needed change is outside the selected execution contract, stop and report the discovered
boundary. For a current approved execution contract, return to its planning or authority owner. For
a direct bounded request, let the user choose broader direct authority or the planned path; do not
create a plan automatically.

If an out-of-scope agent-made change was introduced during execution and can be isolated safely,
revert that agent-made change before continuing. Do not revert user or pre-existing changes without
explicit approval.

When a Task Baseline applies, use the freshness and conformance rules from
`.codex/project-collaboration/task-alignment.md`. When verified evidence or an explicit user correction
invalidates a baseline field, stop with the canonical `Baseline Amendment Required` contract and
return to the applicable planning owner. When an accepted Task Decision or a planned execution
contract must change, stop and return to its owner for revision, review, persistence when
applicable, and reapproval. When a direct bounded request must materially change, report the
discovered boundary so the user can supply broader direct authority or choose planning. Do not
patch an upstream governing contract during execution.

Material drift in scope, baseline, validation, architecture, dependencies, risk, file ownership, or
repository state stops execution. Current approved execution contracts return to their planning or
authority owner; direct bounded requests return the concrete boundary for the user's next routing
choice.

The selected execution input may define bounded file areas or behavioral ownership instead of
exhaustively listing paths. Discovering exact files inside that approved boundary is not scope
drift when the discovered work preserves the input's non-goals, architecture, risk, ownership, and
validation strategy. Record the files actually changed. If discovery crosses the approved boundary
or materially changes any of those terms, stop and apply the selected input's return boundary.

Apply the canonical Requirement Clarification Gate in `agent-operating-contract`. When that gate
requires clarification during execution, stop and return to clarification or the selected input's
owning boundary. A bounded clarification may resume the same direct request when it does not
change scope, authority, risk, architecture, dependencies, or validation strategy. Clarification
may not modify an approved execution contract or baseline; changes to those authorities return to
their owning workflow for revision and reapproval.

Concrete review evidence, including a PR comment ID, is a remediation handoff rather than new
implementation authority. Re-read the current target and cited finding, verify its reviewed-head
identity, and implement it only when current user or Goal authority covers bounded correction that
restores the same selected contract. Apply the Implementation Branch Boundary before selecting a
remediation execution surface. A changed required-review head needs current-head re-review; an
assertion that a finding is fixed is not resolution evidence. Contract-changing findings return to
the selected input's owning boundary.

## Supporting Skill Activation

`execute-plan` remains the primary workflow during execution.

Before each step group, classify whether an installed supporting skill applies to a bounded
substep:

```txt
skill creation/refinement -> writing-great-skills
external technical facts -> docs-first-research
concrete UI screen/flow/form implementation -> ui-design-basics
React component/local-state implementation -> react-component-patterns when installed or explicitly adopted
TanStack Query implementation -> tanstack-query-patterns when its task trigger matches
Next.js App Router implementation -> next-app-router-patterns when its task trigger matches
durable memory write -> update-project-memory; when invoked inside approved execution, it returns
to `execute-plan` without producing a separate publishable-change handoff
complete delivered implementation or remediation review -> implementation-review, with code-review only as a bounded change-quality lens
concrete code/PR/diff/package quality-only review -> code-review
repo-wide audit -> codebase-audit
unclear requirements -> grilling
PR readiness / publish handoff -> recommend implementation-review after publication; open-or-update-pr only after explicit push plus PR authorization
merge readiness -> merge-pr only after completed review and separate explicit immediate-merge authorization
```

Read and apply the supporting skill only for that bounded substep, report the supporting skill
used, then return to `execute-plan`.

Do not run `open-or-update-pr` or `merge-pr` as an internal execution substep. Each effect belongs
to its own workflow after execution; switching workflows does not itself require another user
turn. Implementation-only authority ends at the local validated delivery. When the current user
instruction already authorizes implementation or remediation followed by delivery as a review-ready
PR, complete the local delivery and switch to `open-or-update-pr` without duplicate confirmation.
Merge still requires separate explicit immediate-merge authority for one exact PR and `merge-pr`;
implementation or PR-delivery wording does not supply it.

After the authorized switch to `open-or-update-pr`, preserve that workflow's returned PR action and
exact structured `reviewLink` in the final response. Reproduce `<returned label>: <returned URL>`
exactly once without renaming, reconstructing, or duplicating it, followed by `Next workflow:
Implementation Review`. Describe Git state as `local worktree is clean` when material; reserve
`clean` and `clean review` for an actual Implementation Review verdict.

Supporting skills must not expand, replace, or override the selected execution contract. If a
supporting skill reveals material drift in scope, steps, risk, validation, dependency,
configuration, architecture, or repository state, pause and apply the selected input's return
boundary.

## Generic Codex Mode Boundary

Generic Codex modes are not trusted workflow boundaries.

Codex plan mode does not replace `plan-with-context`.

Codex default execution confirmation does not replace `execute-plan`.

If the user only confirms a generic Codex plan, the agent must restate before changing files:

```txt
Workflow:
- Role: Implementation Executor
- Skill: execute-plan
- Approved execution input:
- Scope:
- Stop conditions:
```

## Execution Approval Modes

Default mode is:

```txt
strict
```

Use `autonomous-within-plan` only for an approved execution contract when the user explicitly
authorizes it, or when an active Goal explicitly requests completion of that approved execution
input. Goal mode remains orchestration only; it does not create another execution input or bypass
this skill's readiness, drift, validation, or STOP controls.
The selected input reference may impose a stricter mode.

A direct bounded delivery request uses strict mode by default. The current request supplies its
bounded mutation authority and does not require a second approval of an agent-generated artifact.

In autonomous-within-plan mode, the agent may execute inside approved scope, run planned validation, and trigger `docs-first-research` for unverified technical assumptions inside approved scope.

The agent must still pause for scope, risk, step, dependency, configuration, architecture, or validation strategy changes.

## Implementation Branch Boundary

Run each implementation pass on a separate normal implementation branch based on the current
implementation baseline, normally current `main`. Never reuse the Task State branch as the
implementation branch or make the implementation branch another Task Workspace. Canonical Task
State must not be modified from the implementation branch.

For a newly starting implementation pass, establish execution-start freshness before creating the
implementation branch or changing implementation files:

1. resolve the repository's remote default branch and refresh its exact remote-tracking ref;
2. verify the refreshed ref and its commit;
3. create the new implementation branch directly from that ref or verified commit; or
4. when an existing branch is proposed for the new pass, verify that the refreshed remote-default
   ref is an ancestor of its `HEAD`.

STOP before implementation mutation when the remote-default ref cannot be refreshed or verified,
or when the proposed branch does not contain it. Do not repair the branch through automatic rebase,
merge, reset, stash, history rewrite, force update, or push. Refreshing a remote-tracking ref for
this read-only repository-context check does not authorize publication or any other remote
mutation.

Before-merge remediation that remains part of the same delivery first resolves that exact active
delivery and its established branch/worktree. It may continue on that implementation branch after
an eligible correction or remediation input is explicitly approved; dirty changes may continue only
when they belong to that authorized remediation. STOP rather than selecting another surface when
delivery identity or dirty ownership is ambiguous or concurrent. Never substitute a different clean
or similarly named checkout merely because it is clean or similarly named.
After the delivery is merged, a later remediation or regression pass starts from the then-current
implementation baseline on a new implementation branch. These rules do not change local commit,
push, PR, merge, release, or deployment authorization.

Execution-start freshness is not continuous synchronization. Do not repeatedly fetch, poll,
rebase, or redefine the pass baseline solely because the remote default branch may have advanced
after the pass started. Resumes and approved before-merge remediation retain the established pass
baseline unless another existing repository-state or drift control requires stopping. Apply the
Delivery Freshness Boundary below only when the completed local delivery is about to become a
current review-ready publication input. The publication workflow independently refreshes remote
state and retains its final ancestry and race checks.

## Pre-Execution Checklist

Apply the selected input reference's completeness and approval checks. For every input, also
confirm freshness, task and Project Memory alignment, reviewability, validation, risk and
rollback, active canonical controls, and any meaningful task-specific STOP conditions.

Missing, ambiguous, stale, unverified, incomplete, blocked, or unauthorized input state must follow
the selected reference. Do not translate a direct bounded request into another input or a current
adequate execution contract into a different artifact.

## Reviewable Execution Readiness

Before mutation, verify that the selected execution input is reviewable and execution-ready:

- its referenced Task Baseline and applicable accepted Task Decisions were read and are fresh,
  when applicable;
- it identifies one focused execution pass or contains approved work items;
- the approved current slice is explicit;
- expected file/area scope is specific enough to detect drift;
- validation and acceptance criteria exist for the current slice; and
- the slice should remain understandable and reviewable as one change set.

For a direct bounded request, exact files, rollback, and proportionate validation may be resolved
from current repository evidence under its input reference without generating a planning artifact.

If approved work items exist, execute only the approved current slice. Outside an active Goal,
execute multiple slices in one run only when the user explicitly approves those slices together
after their combined scope and reviewability are visible. An active Goal that explicitly requests
completion of the approved input may advance from one named work item to the next without renewed
approval, but must keep each work item as its own reviewable slice and must not merge, redefine,
or silently decompose it.

STOP and route to `plan-with-context` when a broad or review-hostile execution contract lacks
required work items, file/area boundaries, validation per slice, or an explicit approval covering
the proposed current scope. Do not invent work items, silently decompose the contract, or continue
on the basis that the user approved the broader goal.

For a clearly small plan created before reviewability decisions were required, state the focused
single-pass judgment in the pre-execution update. If reviewability is uncertain, stop rather than
assuming the plan is focused.

Input-specific one-pass or work-item restrictions remain owned by the selected reference.

## Pre-Execution Status Update

After completing the applicable pre-execution checks, surface a concise user-visible boundary
before mutation when authorization, exact delivery/surface identity, scope, branch/worktree choice,
rollback, validation, risk, uncertainty, or a STOP condition materially affects the user or safe
continuation. Do not require a fixed all-green checklist for ordinary or tiny tasks.

For a direct bounded request, keep any required boundary note concise and do not turn it into an
eligibility checklist or shadow mini-plan.

When risk, ambiguity, blockers, skipped checks, external/global action, multi-step execution,
publishable state, or material PR/runtime/tooling context exists, surface the applicable facts:

- the selected execution input and authorization source;
- whether the selected input is current and authorized;
- material Project Memory Context Gate result and execution-input/memory alignment;
- the relevant repository state;
- the intended branch strategy and, for a new pass, the verified starting remote-default ref and
  commit;
- repository-level and current-branch PR state when relevant and checkable;
- runtime/tooling alignment when the plan or project workflow specifies it;
- the staged implementation groups derived from the approved input;
- the reviewability decision and approved current slice;
- the active stop conditions.

State briefly when a check is not applicable or not checkable, including any material impact. Do
not claim a check passed when it was not performed. A newly starting pass always requires the
execution-start freshness gate; a clean or synchronized local `main` checkout is not required when
the branch starts from the freshly verified remote-default ref. PR and runtime checks remain
conditional on the selected execution input or project workflow.

Local branch creation may be part of local execution setup. It does not authorize push, PR
creation/update, merge, release, deployment, or any publish workflow. Push plus PR creation/update
remain behind an explicit switch to `open-or-update-pr`; immediate merge remains behind a separate
explicit switch to `merge-pr`.

## Stepwise Execution

Execute the selected contract in stages.

After each reasonable step group, run relevant validation and report the result.

Pause on blockers, failed validation, scope drift, or risky unknowns.

## Output Noise Control

Keep execution output concise without weakening this skill's execution, validation, STOP, memory,
or publish boundaries.

- **Boundary output:** Keep material pre-execution boundaries, warnings, blockers, skipped checks,
  validation failures, scope drift, permission or publish boundaries, and final report complete but
  concise. When relevant, include reason, evidence, impact, and next action.
- **Routine success progress:** Prefer terse checkpoints such as `Group 1/3: done`,
  `Validation: running`, or `Scope check: passed`. Explain successful mechanics only when they
  affect a user decision, residual risk, or the next execution step.
- **Warnings, blockers, and errors:** Do not compress away evidence or recovery guidance. Use at
  least:

  ```txt
  BLOCKED: <reason>
  Evidence: <file, command, or observed result>
  Impact: <why safe continuation is not possible>
  Next: <recommended action or workflow>
  ```

- **Final report:** Retain the selected execution input, completed scope, changed-file summary,
  validation, material risks or blockers, memory/docs status, Git/publish status, and next workflow
  when applicable. Include external/global actions only when they occurred or their absence is
  material. When Git or the UI already exposes exact paths, prefer a file count and category
  summary; list exact paths when they are needed for review, ambiguity resolution, or safe
  follow-up. Apply the publishable-change handoff under
  `agent-operating-contract` once for the local execution outcome.

Concision never authorizes omitting failed validation, skipped checks, uncertainty, scope drift,
or an execution boundary.

## Technical Assumptions

Do not rely on model memory for technical decisions during execution.

Pause and use `docs-first-research` when uncertain about APIs, versions, dependencies, configuration, CLI flags, framework behavior, build/test/lint tooling, CI/CD, database behavior, auth/security/privacy, or external service behavior.

If research changes scope, steps, risk, validation, dependency, configuration, or architecture,
apply the selected input's STOP and return boundary.

## Validation

Run validation specified by the selected execution contract. For a direct bounded request, select
proportionate commands from verified current repository evidence and the actual affected boundary.

For a normal application delivery, run the current root `pnpm validate` command as the default
mechanical delivery baseline. Resolve its current composition from repository truth rather than
reconstructing an equivalent-looking set of package-level lint, formatter, typecheck, test, or
build commands. Add `pnpm test:persistence` when the selected contract or actual implementation
materially crosses the persistence/integration boundary.

Use a narrower validation set instead of root `pnpm validate` only when the current repository
owner or selected approved execution contract explicitly establishes that narrower mechanical
boundary. Do not treat an ad hoc combination of package-level checks as equivalent to the root
baseline merely because each selected command passes.

Do not invent validation commands.

If validation is skipped, explain why.

For publishable work, report the executed validation commands, observed outcomes, and explicit
skips in the completion summary and, when present, the task execution record. Do not convert them
into a free-form head-bound declaration or generated PR record.

If validation fails because a runtime or tool is missing or has the wrong version, stop and report:

- detected version and executable path when available
- required project version
- failing command
- global versus project-local runtime state
- a manual remediation recommendation and its machine-wide risk

Do not mutate global tooling, shell profiles, PATH, global Git configuration, or files outside the
project root without explicit user approval.

## Local Commit Policy

Approval to execute an implementation pass authorizes the bounded local commit or commits required
to represent its completed validated delivery unless the user explicitly says not to commit. This
default does not widen the approved implementation scope, validation, reviewability, or drift
boundaries. A normal implementation delivery is incomplete while its approved
repository-visible work remains unintentionally uncommitted; preserve the changes and report the
concrete blocker when a required local commit fails.

Choose commit granularity by the approved pass's work-item and reviewability boundaries. Within an
active Goal, create one checkpoint commit for each completed named work item only after its required
validation and review are resolved. Include in-scope corrections found before that commit; use a
separate focused commit for later corrections, including remediation on an existing published PR.
A current approved execution contract without named work items or a direct bounded request normally
produces one local commit.

`execute-plan` must not push, create or update a PR, merge, release, or deploy.

Push plus PR creation/update require explicit `open-or-update-pr`. Immediate merge requires
separate explicit `merge-pr`; canonical persistent auto-merge is deferred.

Release and deploy are outside v0.1 `execute-plan`, `open-or-update-pr`, and `merge-pr`
responsibilities unless a future release/deployment skill is defined.

## Delivery Freshness Boundary

After the approved implementation is validated and committed, and before reporting the delivery as
current/review-ready or switching to an already-authorized `open-or-update-pr` workflow:

1. require a clean worktree, refresh the exact remote-default ref, and verify its commit;
2. when the refreshed remote default is already an ancestor of `HEAD`, record synchronization as a
   no-op;
3. otherwise integrate that ref into the same feature branch without rewriting history and without
   creating the integration commit first, normally with a no-auto-commit merge;
4. if the integration is clean, rerun the materially required validation for the selected contract,
   and only then create the integration commit; and
5. on a conflict, preserve the same delivery and report the exact affected paths. Continue only for
   a bounded mechanical resolution covered by the selected contract; semantic invalidation of the
   Baseline, accepted Task Decisions, execution contract, or validation strategy returns to its
   owning workflow.

Do not switch to or refresh a checked-out local default branch, continuously synchronize during
implementation, rebase, force-push, reset, auto-resolve conflicts, or move this integration into
`open-or-update-pr`. A synchronization or integration-commit failure leaves local implementation
completion or delivery freshness truthfully incomplete; it does not authorize publication.

## Execution Log

Always report progress in the conversation.

Detailed commands, logs, debugging chronology, and interruption state may remain implementation-
local. Create an execution record only when it has a concrete recovery, handoff, or later-stage
value; do not create or persist one merely because implementation occurred. When useful, keep it
under a clearly local `dev_locals/` path such as:

```txt
dev_locals/execution/<task-slug>/execution.md
```

Execution logs are local-only telemetry, not canonical Task State or project truth. Persist a
task-relevant outcome in the resolved Task Workspace only when it materially supports later
continuation, review, replanning, Task Decision changes, Baseline freshness, or another
implementation pass, and only through the owning Task State workflow.

Durable facts must be synchronized through `update-project-memory`.

## Conditional Learning Candidate Capture

For multi-step, cross-session, interruption-prone, or otherwise substantial execution, read
`references/learning-and-memory.md` completely as soon as a concrete reusable implementation,
debugging, or workflow finding arises, before capture or incremental curation is due. Also read it
when an existing task learning-candidate artifact needs curation, disposition, or reporting,
including during Goal execution, a pause, or failure. Do not wait until completion or create an
empty artifact merely because execution occurred.

## Project Memory Update Check

When independently current durable knowledge needs evaluation or an update, read
`references/learning-and-memory.md` before handling it, including before a relevant checkpoint
commit. Check for that need at completion or pause as well. Memory writes remain owned by
`update-project-memory` and require the existing mutation authority. The detailed reference is not
required solely because execution or completion occurred.

When possible durable knowledge derives from the current unmerged implementation, do not evaluate
its destination or admission, or invoke or route `update-project-memory` for that knowledge before
merge. Defer evaluation only when current task authority already requires an existing post-merge
terminalization or reconciliation owner. Report:

```txt
Project Memory evaluation: deferred to post-merge closeout
Suggested next workflow: none
```

That existing owner re-reads current implementation truth after merge and evaluates whether a
durable Project Memory update is useful. The deferral does not block review or an authorized
publication transition.

For a direct bounded delivery with no already-required post-merge owner, do not create a deferred
obligation. Treat implementation-derived knowledge as unmerged and therefore not yet eligible for
Project Memory, then report:

```txt
Project Memory evaluation: not scheduled from unmerged direct delivery
Suggested next workflow: none
```

A future separately authorized post-merge workflow may evaluate that merged truth, but the direct
delivery does not promise or require it. Deferral does not discard concrete provisional learning
evidence or required candidate continuity; apply the conditional capture trigger above. Unrelated,
independently current authorized memory work still uses the detailed reference.

When neither detailed handling nor unmerged-knowledge timing applies, report no durable updates
with the reason and `Suggested next workflow: none`. For an all-green tiny task, keep this to one
concise result. For risky, failed, drifted, skipped-validation, external/global, publishable, or
multi-step work, retain the existing `Project memory update check` fields: `current facts: no`
with `Destination: none` and reason, `decisions.md: no` with reason, and `lessons-learned.md: no`
with reason. Omit candidate fields when no artifact exists; existing candidates use the reference.

## Persisted Plan Lifecycle Handoff

Local implementation completion reports the result and returns control. It does not make a
persisted delivery plan terminal, trigger Task State closeout, or authorize a Task State write.
While the delivery remains unmerged, the plan may remain `approved / active` through review and
approved before-merge remediation on the same implementation branch and PR. Review acceptance
alone is also non-terminal.

A persisted delivery plan becomes terminal only after the delivery is merged and post-merge
closeout is performed, or when the delivery is explicitly abandoned or superseded. The owning
planning/review Task State workflow re-reads current remote Task State and records the truthful
non-active status through the Persisted Task State Mutation and Remote Persistence Guard. Do not
perform that mutation from the implementation branch or imply that an abandoned or superseded
delivery was merged.

## Completion Summary

Use the Report Depth Levels from `agent-operating-contract`. Completion summaries default to
Standard; use Detailed only for high-risk, complex, blocked, or multi-step validation work.

For an all-green tiny task with no deviations, blockers, skipped validation, external/global
action, or publishable changes, use a compact completion that still states:

- execution input and mode;
- completed scope and changed-file summary;
- validation;
- Project Memory or documentation status;
- Git/publish status.

Omit empty `Deviations`, `Blockers`, `Supporting Skills Used`, and `Commit` labels. Expand whenever
risk, failure, drift, skipped validation, external/global action, publishable changes, or
multi-step execution is present. The expanded form is:

```txt
Execution Summary:
- Execution input:
- Execution mode:
- Completed:
- Changed files:
- Validation:
- Commit:
- Deviations:
- Blockers:
- Supporting Skills Used:
- Quality / Constraints Followed:
- Project memory update check:
```

Include an `External / global actions` field only when an action occurred or the fact is material.

If a local commit was created, report the commit hash.

After file-producing work, load the complete publishable-change handoff reference required by
`rules/agent-operating-contract.md`. Report the actual validation commands and results. Apply that
reference's state-specific helper result: `change:pr` only for dirty/raw changes,
`pr:open-or-update` for a clean committed/current unpublished delivery, and no publication helper
for a stale delivery or a current open PR.

`execute-plan` must not push, create PRs, update PRs, merge, release, deploy, or mutate external
settings. Push plus PR creation/update requires explicit user action through `open-or-update-pr`.
Immediate merge requires completed review, separate explicit user authorization for one exact PR,
and `merge-pr`. Canonical persistent auto-merge is deferred.

Apply the Project Memory Update Check and its merge-timing boundary before invoking or recommending
`update-project-memory`. Do not override the deferral for implementation-derived truth from an
unmerged delivery in the completion path.