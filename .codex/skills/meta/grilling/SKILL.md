# Grilling

Use this skill when a user directly asks to be grilled or when an active workflow routes broad,
branching, decision-heavy, or baseline-blocking requirement ambiguity to clarification.

`grilling` is the single Requirement Clarification skill. It resolves only ambiguity that blocks a
safe next step; it does not turn clear tasks into questionnaires.

## Invocation and Authority

When invoked by another workflow, that workflow retains role routing, context gates, artifact
ownership, approvals, stop conditions, memory updates, and next-step routing. Return control as
soon as its blocker is resolved.

When invoked directly, apply the Requirement Clarification route from
`agent-roles-and-capabilities`, act as the Requirement Clarifier, and recommend the appropriate
next workflow after clarification. Direct invocation does not authorize planning, implementation,
review, publication, or memory updates.

## Evidence First

Before asking a question, inspect the available evidence relevant to the uncertainty:

```txt
project memory
docs and plans
code and configuration
package files
tests
provided context
```

Do not ask the user for an answer that this evidence can provide. If uncertainty depends on
external technical facts, route through the active workflow's docs-first boundary before asking.

## Clarify Blocking Decisions

Interview relentlessly until blocking ambiguity is resolved, but do not expand into non-blocking
discovery or an unbounded questionnaire.

When ambiguity concerns product behavior, a workflow, capability, domain, role, permission, or
information boundary, test it against the smallest representative real-user or affected-party
scenario that exposes the actual need. Do not build a full scenario model when one concrete case
is enough; return once the blocker is resolved.

Order decisions by dependency. Ask a parent or potentially invalidating question before its
dependent questions. Ask one question at a time for dependent, high-impact, or safety-sensitive
decisions. Ask a small round when gaps are independent, at the same decision level, and naturally
answerable together.

With each question:

- provide a recommended answer or direction;
- explain why the decision blocks progress;
- state the impact of the choice;
- wait for the answer before opening a dependent branch.

Do not ask a lower-level question when a higher-level answer would make it irrelevant.

## Task Baseline Impact

When clarification supplies or challenges Task Baseline inputs, report:

```txt
Task Baseline impact:
- Fields clarified:
- Clarified conclusions:
- Remaining blocker:
- Amendment required: yes | no
```

Never create, write, or directly amend `baseline.md`. Verified contradictory evidence or an
explicit user correction that invalidates a baseline field requires the canonical `Baseline
Amendment Required` stop and return to the applicable planning owner.

## Stop and Return

Return control to the calling workflow when:

- it can continue safely;
- the blocking ambiguity is resolved;
- further questions are no longer high-leverage; or
- progress is blocked on user input.

Do not plan, implement, review, research, publish, update project memory, modify an approved plan,
or change workflow scope. Report unresolved blocking ambiguity through the calling workflow's
existing output and approval contract, or through the direct Requirement Clarification route when
invoked by the user.
