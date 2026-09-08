# Implementation Review Contract

## Purpose and boundary

Use this contract for complete implementation review and remediation re-review. Review evaluates
the actual current delivery against the authority that governed it and reports actionable end
states. It is non-mutating and does not authorize fixes, publication, approval, merge, release, or
deployment.

Apply the depth proportionately. Do not add an independent review merely to manufacture lifecycle
state when an adequate review already covers the required boundary.

## Review inputs

Keep these inputs distinct:

```txt
current Task Baseline
+ applicable accepted Task Decisions
+ applicable approved execution-contract lineage
+ exact actual target
```

Resolve the exact current target before concluding. If a versioned target changes, a prior review is
stale for the changed target. Historical content remains evidence, not the current target.

If the baseline is unavailable, do not invent it or claim full task conformance. Mark that portion
provisional while still reporting concrete correctness or safety findings that do not depend on the
missing authority. If the baseline is invalidated, stop affected review conclusions and invoke its
amendment contract.

## Evaluation

Evaluate only what is material to the delivery:

1. **Baseline conformance** — the result solves the real need, delivers the expected outcome, and
   stays within scope, non-goals, key boundaries, value/risk, and success limits.
2. **Execution-contract conformance** — authorized work and later approved remediation were
   implemented without silent substitution, omission, or scope expansion.
3. **Real workflow behavior** — relevant inputs, outputs, handoffs, failure propagation, and
   actor-visible outcomes work at the accepted boundary.
4. **Risk and authority** — destructive, sensitive, external, and irreversible effects retain
   proportionate safeguards and separate authority.
5. **Implementation quality** — ownership, naming, consistency, maintainability, duplication, and
   abstraction support the accepted result.
6. **Artifact and test consistency** — tests and related artifacts express the intended contract
   and cover meaningful regression or failure risk where applicable.

Passing executed checks proves only what those checks cover. Review still judges direction,
structure, proportionality, and semantic correctness. Conversely, ordinary implementation review
does not re-audit execution logs, publication state, or operational evidence unless that separate
assessment is explicitly selected.

Baseline conformance and execution-contract conformance are independent conclusions. Following the
plan does not excuse a result that contradicts the Baseline, and a static contradiction in the
exact target is actionable without requiring a more costly runtime reproduction. When material
evidence needed for one conclusion is unavailable and the current target does not yet justify an
actionable change, mark only that conclusion provisional or withheld, identify the missing evidence
and what could establish it, and continue every conclusion that the available evidence supports.
Unavailable evidence is not proof of conformance and cannot produce a clean verdict for the
affected boundary.

Do not expand findings into unrelated redesign or block the target for a pre-existing issue unless
the change worsens it, depends on it, or the requested scope includes it.

## Findings and verdict

Classify findings that require a delivery change as actionable:

- **blocking** — safe or correct continuation is not possible;
- **must fix** — required before the reviewed delivery can be considered ready;
- **should fix** — material quality or risk issue that should be corrected in this delivery.

An **optional improvement** is non-actionable: it may be reported separately when useful, but it is
not required for the accepted end state. Optional improvements do not make a review actionable or
prevent a clean verdict, and must not by themselves trigger publication, a result identifier, or a
remediation handoff.

Each finding identifies evidence, impact, governing authority when relevant, and the complete
required end state. Prescribe exact mechanics only when implementation freedom is not material or
an exact-modification contract was separately selected.

The verdict covers the exact reviewed target. It is not approval or authority for a later effect.

## Actionable and clean output paths

When actionable findings remain:

1. return one coordinated review result for the exact target;
2. when the governing workflow requires and existing capability and authority permit, publish the
   actionable result through that workflow's transport;
3. return the stable result identifier produced by that publication; and
4. provide the minimum handoff needed for remediation of the same delivery.

The project-collaboration contract requires the outcome, not a particular transport.

When no actionable findings remain, including when only optional improvements exist, say so once.
Do not create an actionable-results publication, positive machine-readable marker, or remediation
handoff merely to record a clean review. A provisional or withheld conclusion is neither an
actionable finding nor a clean result; report that evidence boundary directly without turning it
into persistent lifecycle state or remediation authority.

## Remediation re-review

Re-review the new exact target against each prior actionable finding and the relevant authority
lineage. Confirm the required end state rather than only the disappearance of the original symptom,
and check that remediation introduced no material regression or scope drift.

If findings remain, repeat the actionable output path for the new exact target. If none remain, use
the clean path. A still-valid final pre-delivery review may be consumed by later closeout; repeat
broad semantic review only when the target, authority, or evidence changed.
