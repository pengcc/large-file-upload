# Implementation Review Skill

## Role Routing Integration

Use `agent-roles-and-capabilities` as the canonical owner for the `Implementation review` route
and the Role Routing Display Condition. Apply that route before continuing.

## Purpose and Project Collaboration Contract

Use this skill as the Codex adapter for the canonical Project Collaboration Implementation Review
contract at `.codex/project-collaboration/contracts/implementation-review.md`. The
project-collaboration contract owns complete implementation review, remediation re-review, review
inputs, evaluation, finding meaning, and actionable versus clean output. This adapter retains Codex
context loading, exact-target inspection, bounded quality lenses, report persistence, and any
authorized GitHub result transport.

This workflow is review-only. It does not implement fixes, approve or merge a PR, publish a clean
marker, release, deploy, or update Project Memory. A review verdict creates no later authority.

## Required Authority and Context

Before concluding:

1. Pass the Project Memory Context Gate from `project-memory`.
2. Read `.codex/project-collaboration/task-alignment.md` and the Project Collaboration
   Implementation Review contract.
3. Resolve and keep distinct:

   ```txt
   current Task Baseline
   + applicable accepted Task Decisions
   + applicable approved execution-contract lineage
   + exact actual target
   ```

4. When the exact target is a PR, inspect its current body for a `## Task Context` section before
   asking the user to restate task authority. When present, treat it only as a navigation carrier:
   verify the named Task State branch and Task Workspace, then read the current Baseline and
   applicable Task Decisions from that canonical Task State. For each execution-contract lineage
   entry, resolve `persisted: <task-state-checkpoint-sha>:<plan-path>` against that exact frozen
   checkpoint in governing order. Treat `non-persisted: <input-form>; explicit handoff required` as
   a truthful marker that the carrier does not contain that execution contract; resolve it only
   from an explicit current user scope, current conversation or formal handoff, or exact review/
   remediation evidence that actually supplies the governing input. Do not infer its body or turn
   the marker into authority. The optional Issue pointer identifies task identity only; it does not
   substitute for the Baseline, Task Decisions, or execution contracts.
5. Inspect the exact current target and evidence material to the delivery. For a versioned target,
   record its current identity before review and verify it again before any result publication.
6. Apply `engineering-quality-principles` and the tooling-design principle only when agent tooling
   is in scope.
7. Use `docs-first-research` only when a conclusion depends on consequential external facts.

A PR Task Context section permits a concise review request such as `Review PR #<N> following the
Implementation Review Checklist` only when the carrier plus any already-available explicit
handoff resolves the complete applicable execution-contract lineage. Current Task State still owns
current Baseline and Task Decisions, each persisted checkpoint owns only its listed plan at that
revision, and a non-persisted marker never makes the missing execution input reconstructible. If
same-PR remediation added another approved execution contract, preserve and review the complete
lineage rather than replacing earlier authority with the latest active plan.

For a PR whose Task Context contains a non-persisted explicit-handoff marker and no current source
actually supplies that contract, withhold only the affected execution-contract conformance
conclusion and state the smallest missing input. Do not force the input into Task State merely to
make review transport self-contained. For historical or non-persisted PRs without Task Context,
resolve authority from explicit user scope and other current canonical sources when that is
unambiguous. Do not invent Task Context, infer a persisted task from branch naming, or treat an
Issue number alone as sufficient review authority. If the baseline or execution lineage remains
unavailable, follow the project-collaboration contract's provisional or withheld-conclusion path instead of
asking the user to reproduce document bodies unnecessarily.

Resolve accepted Task Decisions and persisted execution contracts through the actor-local Task
Workspace rules. Read implementation truth from the exact target, not the Task State branch's
historical repository snapshot. Apply the project-collaboration baseline-amendment stop when current evidence
invalidates the baseline; do not repair governing authority during review.

If the baseline is unavailable, follow the project-collaboration contract's provisional path. If the exact
target, applicable approved contract lineage, or material evidence cannot be resolved, withhold the
affected conclusion and state the smallest missing input.

## Bounded Supporting Lenses

For concrete code, PR, diff, commit, branch, or package quality, use `code-review` only as a bounded
Change Review lens. Load its shared core, `references/modes/change-review.md`, the one matching
target reference, and only conditionally relevant lenses. Reuse this workflow's Project Memory
gate, authority inputs, exact-target inspection, and evidence inventory. Do not emit a second
workflow header, report, readiness conclusion, or next-workflow result.

If `code-review` is unavailable, perform the project-collaboration contract's
implementation-quality evaluation directly and state the missing specialized lens. Do not
downgrade the complete stage to acceptance review.

Use `acceptance-review` separately only when the user selects acceptance criteria or delivery
acceptance without complete Implementation Review. It is not a complete-review fallback and its
verdict must not compete with this workflow.

## Evaluation and Result

Apply the project-collaboration contract proportionately to the complete delivery. Findings that
require a delivery change use its `blocking`, `must fix`, and `should fix` classifications.
Optional improvements remain non-actionable.

Each actionable finding identifies exact evidence and target location, impact, governing authority
when relevant, and the complete required end state. Return one coordinated verdict for the exact
target. Do not add a second acceptance or code-review verdict. Passing checks prove only their
covered boundary, and review must still judge conformance, real workflow behavior, risk,
implementation quality, and artifact/test consistency.

For remediation re-review, inspect the new exact target against every prior actionable finding and
the applicable authority lineage. Confirm the required end state and check for material regression
or drift; do not close a finding merely because its original symptom moved.

## GitHub Actionable-Result Adapter

GitHub result publication is actor-local. For a complete Implementation Review or remediation
re-review of an exact PR, the user's explicit request to perform that review is standing
authorization to publish actionable findings only to that exact PR when GitHub comment capability
is available, unless the user explicitly withholds publication. This standing authorization does
not authorize a clean marker, approval or request-changes review, thread resolution, fixes, branch
mutation, PR metadata mutation, merge, release, deployment, or any other external effect. Other
review targets do not acquire GitHub publication authority from this rule.

When actionable findings remain and either that exact-PR standing authorization applies or the user
or an active Goal separately authorizes publication to the exact PR:

1. verify repository identity, PR number, current head, and GitHub authentication;
2. publish one top-level PR Conversation comment containing the exact reviewed head and only the
   actionable findings, their evidence, impact, and required end states;
3. do not approve, request changes, resolve threads, or mutate the branch or PR metadata;
4. read back the result and return the stable comment ID with the exact reviewed head; and
5. provide the minimum same-delivery remediation handoff by reference, normally
   `Address the actionable review findings in comment <ID> on PR #<N> and update the same PR.`

If publication is required but capability, identity, authentication, or authority is unavailable,
return the actionable result in chat, state that no stable publication identifier exists, and name
the smallest next action. Never retry an uncertain comment mutation automatically.

When no actionable findings remain and no material conclusion is provisional or withheld, use the
project-collaboration clean path once. Do not publish a clean comment, positive marker, or
remediation handoff.

## Report Persistence

Return the result in chat by default. Persist a local review report only when the user explicitly
requests it or a governing workflow requires durable evidence. When that condition applies, read
and follow `../code-review/references/report-persistence.md`; local report persistence does not
authorize GitHub publication or Task State mutation.

## Output

Use one concise report:

```md
# Implementation Review: <topic>

## Review Identity and Authority

## Exact Target and Evidence

## Actionable Findings

## Optional Improvements

## Verdict

## Result Publication and Identifier

## Remediation Handoff
```

Omit empty optional sections. On the clean path, say once that no actionable findings remain and
omit publication, identifier, and remediation-handoff sections. On the actionable path, include
publication identity only when verified; otherwise state the transport limitation without
inventing an identifier.

## STOP and Self-Check

Stop rather than concluding when authority or target identity is materially ambiguous, the target
changes during review, baseline amendment is required, or a requested write lacks authority.

Before returning, verify that one complete review result covers one exact target, all four review
inputs stayed distinct, any PR Task Context was verified as navigation rather than authority, any
non-persisted explicit-handoff marker was resolved from a real current source or left truthfully
provisional, code-review was only a bounded lens, clean output created no marker or handoff,
actionable publication has verified authority and identity, and no fix, approval, merge, release,
deployment, or unrelated publication authority was inferred.
