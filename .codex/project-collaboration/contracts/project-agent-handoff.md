# Project-Agent Handoff Contract

## Purpose

Use this contract to author or review the minimum sufficient project-agent task instruction or
formal handoff between eligible actors at a task or stage boundary. It applies when an eligible
project agent is assigned a bounded task and when a completed or paused stage result is transferred
for downstream consumption. The instruction or handoff transfers only the authority and context
needed to perform or consume that work; it does not create authority, replace a canonical artifact,
or require the recipient to repeat adequate upstream work.

This contract does not own session summaries, conversation resumption, or other actor-local
continuity context. Those remain local to the acting environment and must not become a second
meaning or maintenance owner for project-agent task instructions or formal handoffs.

Apply it proportionately. A small, exact task may need only a short instruction and exact target.

## Required content

A sufficient project-agent instruction or handoff identifies, by reference where possible:

1. **Goal and stage** — the concrete outcome and the defined project stage the recipient is to
   perform.
2. **Current authority** — the authority that actually governs the requested work. Use the Task
   Baseline and accepted Task Decisions when applicable; include an approved execution or remediation
   contract only when it governs the task. Other valid current authority may include direct user
   authorization or an accepted task specification.
3. **Exact target** — the current artifact, version, path, or other identity the recipient must
   inspect or change.
4. **Completed work** — adequate prior stages and results to consume without repetition, when any
   exist.
5. **Scope boundaries** — task-specific allowed work, exclusions, permissions, and external effects
   that remain separately authorized.
6. **Completion and STOP conditions** — observable end state, task-specific validation or evidence,
   material reasons to stop, and the smallest unresolved input if one exists.
7. **Continuation or result context** — current stage status, stable result or finding identifiers
   when applicable, and the next required project action when another actor must consume an
   existing result.

Reference canonical sources rather than copying their bodies. Include only facts that materially
affect the recipient's result. Do not reproduce generic execution, validation, repository,
publication, merge, or reporting procedures owned by the recipient's environment.

## Authoring rules

- Treat the approved contract as frozen execution authority; do not turn an execution handoff into
  another planning pass.
- Distinguish verified facts, assumptions, recommendations, and unresolved questions.
- Match instructions to capabilities actually available to the recipient, without assuming that
  every actor has identical tools or mutation authority.
- Preserve user-owned decisions and request the smallest missing decision only when available
  evidence cannot resolve it safely.
- State new task-specific permissions or prohibitions only when they are not already owned by a
  referenced authority.
- Avoid asking for proof of later implementation, validation, publication, or deployment in an
  earlier stage unless that assessment is the selected task.

## Review check

Before issuing the instruction or handoff, confirm that:

- the goal, stage, authority, and exact target cannot reasonably be confused;
- referenced authorities are current and do not contradict the instruction;
- completed adequate work, when present, is reusable without reconstruction;
- scope and external-action boundaries are sufficient but not duplicated;
- the completion and STOP conditions are observable and proportionate; and
- the instruction or handoff is no longer than needed for safe downstream use.

## Review output

When reviewing a project-agent instruction or handoff, choose the output that matches the target:

- for a draft, if corrections are needed and can be made under existing authority without a new
  user-owned decision, return the concise review result and the complete corrected instruction or
  handoff ready for downstream use; do not require the requester or next actor to reconstruct it
  from findings;
- when the target is an identifiable canonical writable artifact and the actor already has
  maintenance authority, use Canonical Review-and-Apply from the Agent Collaboration Guide on that
  same artifact rather than create a revised copy;
- if correction requires missing authority, unresolved material input, or a new user-owned
  decision, return findings or STOP with the smallest unresolved input instead of inventing it; and
- if no correction is needed, report the instruction or handoff clean and ready for use without
  reproducing unchanged content unless requested or required by the downstream transport.

Authoring or reviewing a project-agent instruction or handoff does not authorize the requested
implementation or external action.
