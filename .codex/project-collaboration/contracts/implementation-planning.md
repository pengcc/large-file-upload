# Implementation Planning Contract

## Purpose and boundary

Use this contract to author or review an implementation plan. Planning converts the current task
authority into an accepted, executable delivery design. It does not perform implementation or grant
mutation, publication, merge, release, or deployment authority.

For small, clear work, keep planning proportionate. Reuse an already adequate current approved
execution contract instead of creating another plan. Do not require a formal plan merely because
one can be written.

## Inputs

Planning consumes, in order:

```txt
current Task Baseline, when applicable
+ applicable accepted Task Decisions
+ verified current project and target evidence
+ existing constraints and authorities relevant to the delivery
```

Confirm baseline freshness before solution work. If explicit correction or verified evidence
invalidates it, stop and use the Baseline Amendment contract in `../task-alignment.md`. A plan must
not repair or redefine its own baseline.

Treat visible implementations and proposals as evidence or candidate solutions unless accepted
authority says otherwise.

## Plan responsibilities

A sufficient plan defines, proportionately:

- the accepted solution and why it is the smallest useful approach;
- current scope, explicit non-goals, and ownership boundaries;
- ordered work or reviewable work items, including real dependencies and safe parallelism;
- expected target areas and prohibited areas when exact paths are not yet known;
- validation design tied to behavior, failure paths, and material regression risk;
- acceptance criteria observable at the same boundary as the intended outcome;
- task-specific STOP conditions for drift, missing authority, unexpected ownership, or unsafe
  uncertainty;
- material risks and a realistic rollback boundary; and
- the intended review boundary.

The plan owns these delivery choices. It references rather than copies the Task Baseline and
accepted Task Decisions. It describes task-specific work without reproducing an actor's routine
execution or publication procedure.

For behavior that crosses meaningful boundaries, trace the accepted solution from its real
entrypoint through the necessary handoffs to the actor-visible result. Do not force an end-to-end
trace for a genuinely local change.

## Proportionality and reviewability

Prefer one focused pass when it has one coherent outcome, a bounded target area, a compatible
validation loop, and a change set understandable in one review. Decompose when independent
outcomes, conflicting dependencies, distinct safety boundaries, or materially different validation
would make one pass review-hostile.

Do not add abstraction, compatibility, automation, configurability, migration, safety machinery, or
repeated checks without demonstrated value. Before adding a new owner or mechanism, ask whether
clearer wording, corrected routing, removal of duplication, or an existing owner is sufficient.

## Plan Review

Review the proposed plan against the current baseline and decisions, not against the reviewer's
preferred redesign. Check:

1. **Alignment** — the solution satisfies intent, expected outcome, scope, non-goals, boundaries,
   value/risk judgment, and success boundary.
2. **Authority** — verified facts and accepted choices are distinguished from assumptions and
   candidates; the plan requests no ungranted external effect.
3. **Completeness** — work, dependencies, validation, acceptance, risk, rollback, STOP conditions,
   and review boundaries cover the accepted outcome.
4. **Proportionality** — complexity and ceremony earn their cost; unnecessary work is removed or
   deferred.
5. **Executability** — a fresh eligible actor can act from the plan and referenced sources without
   hidden conversation context.

Distinguish a plan-owned implementation mechanism from a plan-added constraint on the required
outcome. If a constraint would exclude a Baseline-required scenario when false, the plan is not
ready until the cheapest safe sufficient evidence establishes it or the applicable upstream
authority resolves the mismatch. Prefer static or non-destructive evidence when it is sufficient;
do not require destructive evidence merely to settle the planning boundary. Do not turn a current
implementation shape into a preservation requirement without accepted authority or a demonstrated
consumer.

When the canonical plan is identifiable and maintenance authority already exists, apply clear
review corrections to that same artifact. Do not create revision-suffixed copies. Stop for a new
user-owned decision, Baseline Amendment, or material authority change.

When the plan is not writable or mutation is not authorized, return the verdict and actionable
findings. Exact manual modifications are a separate explicitly selected deliverable.

## Output and readiness

The stage output is one identifiable plan plus a review conclusion stating whether it is ready,
which decisions or blockers remain, and what authority is still required before execution. Required
validation is designed here and executed later by the authorized implementation workflow; planning
text is not validation evidence.
