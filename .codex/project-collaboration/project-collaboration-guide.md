# Project Collaboration Guide

## Purpose

This guide defines the project-wide semantics that let eligible project actors collaborate across
stages without translating the task repeatedly, confusing authority, or adding a mandatory
lifecycle. It supports judgment; it does not replace judgment with a workflow engine.

## Actor substitutability and adequate-work reuse

An actor may complete a project stage when it has the context, capability, and authority required by
that stage. Actor identity alone neither grants authority nor reserves a stage.

Reuse adequate completed work. Repeat a stage only when changed evidence, an invalidated authority,
a material missing lens, unresolved disagreement, or an explicit request gives the repetition a
distinct purpose. A handoff should let the next eligible actor consume the existing result rather
than redo it.

Repository-aware or environment-aware claims depend on inspected evidence, not on the actor's
label. Mark a conclusion provisional when required context was unavailable.

## Authority hierarchy

Keep applicable layers distinct and consume them in order:

```txt
Task Baseline
-> task-wide purpose and high-level boundaries

Applicable accepted Task Decisions
-> functional or product choices already settled for the task

Applicable approved execution-contract lineage
-> accepted solution, allowed work, validation design, and STOP conditions

Exact current target
-> the artifact, implementation, or change actually being worked on or reviewed

Current stage output
-> the result and handoff produced under those authorities

Separate lifecycle or external authority
-> mutation, publication, merge, release, deployment, or other external effects
```

A downstream artifact must not silently redefine an upstream authority. A currently selected plan
does not erase an earlier approved contract that contributed to the target. Stage completion does
not imply authority for the next external effect.

## Cross-stage construction model

For work spanning several stages, use this project orientation model:

```txt
Real scenario / requirements discovery
-> what the occupants actually need

Task Baseline
-> the owner's brief and site boundary

Product or Task Decisions, when needed
-> the functional design

Implementation Plan
-> the construction plan

Implementation
-> the actual construction

Implementation / Acceptance Review
-> inspection against the owner's brief, accepted functional design, and applicable approved
   execution authority

Closeout
-> handover and truthful task-state finalization
```

This model is explanatory, not a required artifact stack or lifecycle. Product or Task Decisions
remain conditional, and small tasks may use lightweight alignment and direct execution. Do not use
the model to repeat adequate stages or create new workflow machinery.

## Exact-source discipline

Before making an exact claim, review finding, or modification instruction, resolve enough identity
to distinguish the intended current source from historical or candidate material. Depending on the
source, this can include repository or collection, revision, path, target identifier, and current
content.

Classify supplied material as current authority, accepted subordinate authority, current evidence,
historical evidence, candidate content, or unresolved claim. Do not quote or modify text that is
absent from the verified current target, silently substitute an approximate anchor, or treat
history as a second current owner.

## Canonical review-and-apply

Use Canonical Review-and-Apply when an existing canonical artifact is identifiable, the current
actor already has authority to maintain it, and the correction requires neither a new user-owned
decision nor broader authority. Re-read and review the current canonical artifact, apply clear
corrections to that same artifact, preserve upstream authority, and persist only through authority
already held.

Review-and-Apply creates no new implementation, publication, task-state, or other mutation
authority. It must not silently amend the Task Baseline, change a material Product or Task
Decision, expand scope or authority, mutate implementation under review-only authority, or change
the governing contract of a running Implementation Pass without first stopping that pass.

## Manual modification contract

Use the Manual Modification Contract only when exact or manual modification instructions are
explicitly selected as the deliverable. For each modification:

- identify the target artifact or file;
- when existing text is available, quote it exactly as the edit anchor; a heading, line number, or
  approximate area is not a substitute, and a repeated anchor requires only the minimal additional
  exact context needed to make it unique;
- state the action as `replace`, `delete`, `insert immediately before`, `insert immediately after`,
  or `move`, and provide the complete replacement, inserted content, deletion boundary,
  destination, or required end state;
- for a move, provide exact source and destination anchors;
- for a new artifact or element with no existing anchor, identify the exact destination path or
  parent and provide its complete content or required end state; and
- state applicable validation.

Lack of direct write capability may justify suggesting this mode, but does not activate it
automatically. The contract owns manual modification mechanics only; it creates no new stage,
verdict, implementation, Git, or publication authority.

## Real-scenario judgment

Use this lens only as far as the task materially needs it:

1. begin at the real contract entrypoint and name the actor-visible outcome;
2. trace only handoffs that materially affect that outcome;
3. identify a real consumer before preserving compatibility, history, or additional capability;
4. judge failures by their propagation through the relevant workflow;
5. place controls where the underlying fact can change and at the least costly reliable stage;
6. test meaningful false-positive and false-negative cases; and
7. ask what can be removed, narrowed, checked less often, or left with an existing owner.

Current implementation is evidence, not automatically the required future design. A genuinely
local task does not need an artificial end-to-end trace.

## Artifact ownership and truth timing

For a conclusion that may affect several artifacts, identify:

- what the conclusion means;
- the one canonical owner for each distinct kind of truth;
- the event that makes the conclusion true for that owner; and
- whether the correct action is update now, update after that event, reference, defer, or do not
  persist.

Different truths can mature at different times. An accepted decision, maintained intent,
implemented behavior, durable current-state knowledge, task lifecycle, and human-visible status may
have different owners and truth events. Keep projections from becoming competing authorities, and
do not publish a merge-dependent fact before the relevant delivery event.

If a recorded deferred dependency later becomes true, reconcile the existing lifecycle owner
rather than create a second ledger or callback system. If a growing artifact becomes costly to
maintain, it may be split by semantic ownership and change frequency while retaining one navigation
owner; this is an optional storage choice, not a required artifact pattern.

## Dependency-aware parallelism

Independent ready tasks may progress concurrently. Each actor uses that task's own baseline,
decisions, execution authority, target, and output boundary. Do not impose global waiting merely
because another task or actor is active.

Preserve real dependencies:

- a downstream stage waits for the upstream result it actually consumes;
- a running execution contract stays frozen unless the pass is stopped and reauthorized;
- one mutable canonical target has one current writer or another explicit conflict-control
  arrangement; and
- freshness is rechecked when a shared target may have changed.

Parallelism does not require a scheduler, ready-work registry, or lock service.

## Stage completion

A stage is complete only when both its semantic work and its required delivery contract are
complete. Depending on the stage and available authority, that can include:

- the required canonical artifact or verdict;
- the exact target identity;
- any required publication result and stable identifier;
- the minimum sufficient handoff for the next actor; and
- explicit remaining blockers or uncertainty.

A correct conclusion stranded in conversation is incomplete when the governing stage requires an
artifact, publication result, identifier, or handoff. Conversely, do not manufacture a positive
marker, remediation handoff, or lifecycle state when the stage's clean path requires none.

Validation text does not substitute for executing required validation. Review readiness does not
authorize mutation, and successful delivery does not authorize merge or another external effect.

## Proportionate use

Use only the alignment, contract, or principle that can materially change the current result. Small,
exact, low-risk work may proceed through lightweight alignment, verified current ownership, the
smallest valid action, and proportionate validation. Do not create a baseline, formal plan, repeated
review, broad trace, or coordination mechanism solely to demonstrate compliance.
