# Task Alignment

Task Alignment establishes the task-wide meaning that later stages must preserve. Use it for
complex, cross-stage, or capability-level work. Keep a small, clear, single-stage task direct with
a brief alignment check rather than manufacturing persisted state or ceremony.

## Establish or reuse

If a current Task Baseline exists, read and reuse it. Do not reconstruct or rephrase it because the
actor or stage changed.

If no baseline exists and durable cross-stage alignment is useful, establish one from the user's
real operating scenario and verified evidence. Clarify only uncertainty that could materially
change intent, outcome, scope, safety, or acceptance. Treat an implementation, proposal, or
historical artifact as evidence unless an applicable authority makes it a requirement.

## Task Baseline

Keep the baseline concise, solution-independent, and proportionate:

```md
# Task Baseline

## Intent
Who uses or depends on the result, in what real context, what need exists, and why it matters.

## Expected Outcome
The high-level result that should exist when the task is complete.

## Scope
What the current task covers.

## Non-goals
What is intentionally excluded.

## Key Boundaries
Material scale, sensitivity, authority, external effects, reversibility, recovery, and other
constraints that later stages must preserve.

## Value and Risk
Expected benefit and cost, the credible loss boundary, and the proportionate level of control.

## Success Boundary
The high-level evidence that the real need is met without unsupported scope or complexity.
```

Add `Open Blocker` only while an unresolved issue prevents safe continuation.

The Task Baseline is not a plan. Do not place solution design, work items, files, commands, tests,
sequencing, or delivery mechanics in it.

## Task Decisions

When functional or product choices must persist across stages, record them as Task Decisions.
Accepted Task Decisions are subordinate to the Task Baseline and authoritative for the choices they
settle. They must not restate the baseline or silently expand it. Candidate ideas, reviewer
preferences, and current implementation behavior do not become Task Decisions without acceptance.

Later stages consume the current baseline and applicable accepted decisions; they do not reopen
settled choices without changed evidence or user correction.

## Freshness and evidence

Before relying on the baseline:

1. resolve the current canonical artifact;
2. compare it with verified current facts that could affect its fields; and
3. check the current stage artifact or action for conformance.

Distinguish user intent, accepted decisions, current implementation evidence, historical content,
candidate solutions, and unresolved claims. State only what the evidence proves. In particular,
existing fields or compatibility paths do not by themselves establish a future preservation
requirement.

## Baseline amendment

Amend the baseline only when explicit user correction or verified contradictory evidence
invalidates or materially completes it. A preferred solution, broader optimization, wording
improvement, or implementation convenience is not amendment evidence.

A discovering stage stops affected downstream work and reports:

```txt
Baseline Amendment Required:
- Evidence or user correction:
- Invalidated field(s):
- Downstream artifacts affected:
- Planning owner / reset point:
```

The alignment owner amends the canonical baseline, then determines which subordinate decisions and
downstream artifacts must be reconsidered. Amendment does not itself authorize implementation or
external action.

## Cross-stage use

At each later stage:

1. read the current Task Baseline;
2. read applicable accepted Task Decisions;
3. confirm freshness;
4. evaluate the current artifact or action against them; and
5. continue without redefining the task.

Plans, prompts, implementation artifacts, reviews, and status records are consumers or stage
outputs. None is a competing task-wide baseline.
