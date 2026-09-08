# Plan With Context Skill

## Role Routing Integration

Use `agent-roles-and-capabilities` as the canonical owner for the `Feature or theme planning`,
`Validation strategy planning`, `Plan alignment review`, and `Proposed plan review` routes and the
Role Routing Display Condition. Select and apply the route that matches the planning or Plan Review
task. When display is required, render that route's canonical fields without maintaining a local
copy.


Use this skill as the Codex adapter for the canonical Project Collaboration Implementation
Planning contract in `.codex/project-collaboration/contracts/implementation-planning.md`. The
project-collaboration contract owns planning inputs, responsibilities, proportionality, Plan
Review, and readiness. This skill retains Codex context loading, conditional Task State
persistence, output, and approval mechanics.

This is a non-implementation workflow for planning and Plan Review. It does not implement changes.

## Role

When using this skill, act as the primary role from the selected canonical route. Preserve that
route's exact role and mode for feature or theme planning, validation-strategy planning,
plan-alignment review, and proposed-plan review. Do not replace a selected role or mode with local
planning defaults.

The selected role checks scope and project context, verifies technical assumptions, compares
options when needed, and produces the proportionate planning artifact or Plan Review result
required for safe execution. Route selection changes the working perspective and truthful output;
it does not change this skill's non-implementation boundary.

## Required Workflow Chain

Before creating or reviewing a plan, pass the Project Memory Context Gate defined in the `project-memory`
skill and consume its result in the planning context. Follow the central gate result before
producing a plan; do not redefine its sequence or status meanings here.

After primary route selection and Project Memory, read and apply, in order:

```txt
.codex/project-collaboration/task-alignment.md
-> current Task Baseline, when applicable
-> applicable accepted Task Decisions
-> .codex/project-collaboration/contracts/implementation-planning.md
-> verified current project and target evidence
```

Resolve applicable accepted Task Decisions through the actor-local Task Workspace mapping in
`.codex/rules/task-and-change-safety-principles.md`. Consume each accepted decision once by meaning;
do not create a second decision set from retained Product Decision filenames.

Use that authority as the planning input; do not recreate or paraphrase its semantics inside the
plan. Apply actor-local supporting roles and mechanics only after these inputs are current.

For a complex, cross-stage, or capability-level task that needs persisted alignment, establish one
baseline only when none exists. Resolve the task's persisted Task Workspace through the actor-local
mechanics in `.codex/rules/task-and-change-safety-principles.md`, then save `baseline.md` there.
Reuse an already established valid workspace; do not infer the workspace from attachments, source
files, reports, or other reference material.

Resolve missing or blocking inputs first. A later planning run reuses the same baseline and checks
freshness and conformance; it does not reconstruct or silently amend it. Small, clear,
single-stage tasks do not require a baseline or task workspace.

Apply focused Product Framing from `product-framing-review` only when end-user behavior needs
meaning, state, workflow, or acceptance clarification. It is a subordinate supporting lens and
does not own Task Alignment, solution design, or Implementation Planning. The Project Collaboration
Implementation Planning contract owns solution design and Plan Review; Agent-tooling targets also
receive Agent Tooling Design Principles through the routing owner.

Use `docs-first-research` only when the plan depends on material external facts not established by
verified current project evidence. Apply its trigger for authoritative, version-sensitive,
security, compatibility, deployment, provider, or external-skill facts.

Before declaring a plan ready, perform the project-collaboration contract's Plan Review against the
current Task Baseline, applicable accepted Task Decisions, verified evidence, and any applicable approved
Product Framing conclusions. If verified evidence or an explicit user correction invalidates the
baseline, stop with the canonical `Baseline Amendment Required` contract rather than changing it
inside the plan.

## Non-Implementation Boundary

This workflow must not:

- Modify production code
- Install dependencies
- Change configuration
- Run destructive commands
- Commit changes
- Push changes
- Update project memory silently
- Treat plan creation as execution approval

Canonical Task State writes are governed exclusively by the Persisted Task State Mutation and
Remote Persistence Guard. All other commit, push, and publication prohibitions in this workflow
remain unchanged.

This workflow may read project files, inspect repository state, inspect existing
docs/code/tests/configs/package files, use official documentation when needed, establish an
authorized Task Baseline, and create or update current planning artifacts inside the resolved Task
Workspace.

## Truthful Workflow Declaration

Surface route, context, role, or mode information when it is material, degraded, blocked, changed,
or explicitly requested. For ordinary planning, do not add a fixed workflow header or reproduce a
routine successful Project Memory result solely as process telemetry. When detail is material, use
the selected canonical route and do not infer a Plan Review identity.

Do not claim that a skill, source, file, or workflow was used unless its required steps were actually performed.

If required context was not read, say so and mark the plan as an incomplete draft.

## Codex Plan Mode Enforcement

Codex plan mode does not replace `plan-with-context`.

If the user asks for a plan, implementation plan, architecture plan, refactor plan, feature plan, migration plan, or asks the agent to think through work before coding, the agent must use this skill.

A plan created without applying the `project-memory` skill and reading required project memory is incomplete.

## Context to Inspect

After applying the `project-memory` skill, inspect additional project sources as needed:

```txt
README.md
package.json
lockfile
.env.example
config files
existing source files
existing tests
```

Before asking the user a question, check whether the answer is available in project docs, project memory, existing code, configuration files, tests, package files, or official documentation.

Use a plan, handoff, or other local process artifact only when the user or active task identifies
it as relevant, and only after the Project Memory Context Gate freshness check.

## Docs-First Requirement

`docs-first-research` owns its trigger. Use it when a material planning conclusion depends on
external API/provider/tool behavior, version-specific or compatibility facts, security/privacy or
deployment requirements, or another authoritative external claim not established by verified
current project evidence. Do not require research merely because planning is technical or includes
local build, test, lint, configuration, code, or repository facts.

## Clarification Requirement

Before planning, decide whether clarification is required.

Use `grilling` only when ambiguity is broad, branching, decision-heavy, or blocks a required Task
Baseline input. The same skill owns direct user clarification and workflow-routed clarification.

Apply the canonical Requirement Clarification Gate from `agent-operating-contract` after checking
available project evidence. Resolve blocking design or required Baseline inputs before producing
the plan; do not use planning to silently settle a user-owned decision or amend the Baseline.

Do not use `grilling` when the answer is available in project sources or when a clear task can
proceed with a low-risk, stated assumption.

When approved and current Product Framing conclusions already establish the intended end-user
behavior, reuse them as subordinate input. Repeat the focused check only when material drift,
ambiguity, or a changed product decision makes that input stale.

## Conditional Supporting Guidance

Read only the supporting reference whose condition applies:

| Planning concern | Reference |
|---|---|
| Concrete UI page, screen, flow, or form | `references/supporting/ui-design.md` |
| Concrete React component or local-state implementation | `references/supporting/react-components.md` |
| TanStack Query remote/server-state or client-cache work | `references/supporting/tanstack-query.md` |
| Next.js App Router framework work | `references/supporting/next-app-router.md` |

Do not load an unrelated supporting branch. Supporting guidance remains bounded by this planning
workflow and cannot change its approval or execution boundary.

## Codex Planning Mechanics

The Project Collaboration Implementation Planning contract owns the plan's solution, scope, ownership,
dependencies, validation design, acceptance, task-specific STOP conditions, risk, rollback, and
reviewability responsibilities. The sections below define how Codex stores and hands off a
resulting plan without becoming another semantic owner.

## Recommendation Requirement

A plan must include a recommendation.

Default to the smallest useful, verifiable, reversible option unless project memory or the user goal clearly requires a heavier solution.

## Objective Recheck for Existing Plans

Before planning the next deferred work item or extending an existing multi-work-item plan,
re-check the original objective and non-goals against completed work, validation, and current
repository evidence. If the objective is already satisfied, recommend closeout or re-scope instead
of continuing merely because another work item is listed. Continue only when the next item
addresses a concrete unresolved gap with clear product, safety, or maintenance value.

For old-plan continuation, migrations, installer changes, workflow scripts, publish automation, or
architecture expansion, inspect relevant project lessons by heading or topic before recommending
the next step. Do not require a full lessons-file read for unrelated or trivial tasks.

## Planning Need, Reviewability, and Persistence

Answer or review work with no implementation mutation does not create an implementation artifact.
Do not introduce planning solely for an already clear directly authorized bounded change; when the
user asks for execution, use the direct execution owner. Preserve an explicit user request for
planning. When a current adequate approved execution contract already exists, reuse it without
reformatting, saving, or duplicate planning.

When implementation design is still needed, create or revise one proportionate implementation plan
under the Project Collaboration Implementation Planning contract. The plan owns its solution,
validation, acceptance, risk, rollback, task-specific STOP conditions, and reviewability; do not
introduce another artifact category to express those terms.

Decide reviewability inside that plan. When independent outcomes, incompatible validation or safety
boundaries, or a review-hostile change set are already known, embed Work Items directly in the plan.
Use `to-work-items` only when the user later explicitly requests re-slicing of an already accepted
solution without changing its governing facts.

Decide persistence independently. Read `../../../rules/references/persisted-plan.md` only when
genuine multi-round or cross-stage continuity needs a saved Task State plan. Do not persist another
adequate approved execution contract merely because it has an Issue or could be stored.

## Self-Contained Plan Quality

Plans must be executable by a fresh agent that did not see the original conversation.

For non-trivial work, include:

- exact paths when they are known, exhaustive, or safety-critical;
- otherwise, bounded file areas or behavioral ownership, expected targets, forbidden boundaries,
  and the method the executor should use to discover exact files;
- exact files, directories, or behavior explicitly out of scope;
- baseline branch, commit, or repository state used for planning
- the implementation-planning contract's required risk, rollback, and task-specific STOP content
- validation commands confirmed from repo files such as `package.json`, README, project memory,
  existing docs, or the current codebase

Do not rely on hidden chat context, unstated assumptions, or phrases such as "as discussed above".

Keep small plans proportional, but include enough context for safe execution without the original
conversation.

Discovery inside an approved file area or behavioral boundary does not require replanning merely
because the plan did not enumerate every resulting path. Replanning is required when discovery
materially changes scope, architecture, risk, ownership, validation, or another approved boundary.

## Reviewability and Work-Item Decision

For every non-trivial planned delivery, decide whether the requested work is one focused execution
pass or requires reviewable Work Items.

Use a single focused pass only when the plan has one coherent outcome, a plausible expected
file/area scope, one compatible validation loop, and a change set that should remain understandable
and reviewable as one unit. State the reason briefly.

Treat work as broad or review-hostile when it has multiple independently reviewable outcomes,
crosses unrelated concerns or safety boundaries, mixes behavior with tooling/runtime/publish work,
cannot state a plausible file/area scope or validation per slice, or would likely produce a PR that
is difficult to review as one unit. Do not rely on a numeric-only file or line threshold.

For broad work, include reviewable Work Items directly in the plan. Embedded Work Items must follow
the same minimum contract: ID/name, goal, dependency order, expected file/area scope, allowed
mutation, non-goals, validation, acceptance criteria, STOP conditions, and review/PR boundary.
Planning and decomposition do not authorize execution.

## Planning Artifact Persistence

For a persisted Task Baseline, resolve the canonical Task Workspace through
`.codex/rules/task-and-change-safety-principles.md`, save a new complex-task plan beside
`baseline.md`, and reference that baseline without copying its body. Name a persisted plan for the
implementation purpose or pass it governs, such as `homepage-implementation-plan.md` or
`homepage-review-remediation-plan.md`. Revisions of the same pass update the same file and rely on
Git history; do not create `v2`, `updated`, or `final` variants.

Create only the task artifacts that are actually needed. Persist a plan only when genuine
cross-stage continuity needs Task State; then read the persisted-plan adapter before saving or
activating it. Historical local or persisted plans may be inspected as reference material, but they
are not current planning inputs or outputs. Before reuse, reapply current Task Alignment and create
or update the current plan in the resolved workspace. Do not migrate or delete historical files.

Durable results belong in project memory and must be updated through `update-project-memory`.

If Plan Mode or the active tool environment prevents writing:

- do not claim that the plan was saved
- state clearly whether local writing or canonical Task State persistence is blocked
- show the exact intended task-workspace path
- provide the complete plan content in the response, or a clear next action that preserves it
- tell the user to save it manually or switch out of Plan Mode / approve a write-capable mode and
  ask the agent to save it

Do not silently continue as if the plan file exists or the remote Task State checkpoint succeeded.

## Review Report Integration

When planning from a `code-review` report:

- treat the review report as the primary problem statement
- read the original PR, diff, commit, branch, package, or reviewed target when available
- read relevant project memory, architecture, previous plan, or baseline context
- reuse review evidence as an adequate execution contract only when it is current, explicit,
  complete, and authorized
- otherwise create one proportionate plan; embed Work Items directly when the accepted delivery is
  broad or review-hostile
- ask user approval before turning review findings into an executable plan

## Project Memory Updates Needed

State whether execution may require `update-project-memory`.

Example:

```txt
Project memory update needed: yes
Reason:
Suggested next workflow: update-project-memory after execution.
```

## Execution Approval Boundary

Creating a plan is not execution approval.

After producing a plan and completing the project-collaboration contract's Plan Review, use that
review conclusion to select the next action. A ready plan proceeds to user approval consideration or another
explicitly selected action; it does not default to a second plan-review pass.

- explicitly approve execution later;
- revise the plan when the review conclusion is not ready or the user requests changes;
- save the plan if persistence was blocked; or
- perform a separate plan-review pass only when the user requests it or changed evidence, a
  distinct review purpose, or material-risk coverage justifies another pass.

Present execution approval as a user decision, not an assumption or a nudge.

When the user explicitly approves the exact current plan after its applicable Plan Review, resolve
that plan, the current Task Baseline, and applicable accepted Task Decisions. If freshness or
governing authority changed, stop and return to the planning/review owner. Otherwise consume the
completed review without repeating semantic Plan Review on the normal approval path.

For a persisted plan, apply `.codex/rules/references/persisted-plan.md` and the existing Persisted
Task State Mutation and Remote Persistence Guard to activate the selected plan as
`approved / active`. This records already-given user authority; it is not another design/review
stage or a reason to request the same confirmation again. Do not activate without explicit user
approval. Another adequate non-persisted approved execution input does not require Task State
persistence merely to represent approval.

Do not implement the plan unless the user explicitly approves execution. A generic UI/tool offer
does not supply that approval; report execution as unapproved until explicit authority exists.

## Output Expectations

When responding, include the classification outcome, artifact type/status, saved path only if it
was actually saved, recommendation, blocking questions if any, execution status, and a
readiness-consistent approval or other explicitly selected next action. Include route or context
state only when it is material, degraded, blocked, changed, or explicitly requested.

Use the Report Depth Levels from `agent-operating-contract`. Keep simple planning responses brief,
and use more detail only when scope, risk, ambiguity, or validation complexity requires it.
