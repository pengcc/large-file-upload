# Direct Bounded Delivery Request

Read this reference only when the current user request directly authorizes a bounded repository
mutation through either:

- an explicit request for lightweight delivery; or
- an already concrete, directly executable tiny task whose outcome and boundary are clear without
  requiring the user to repeat the `lightweight` label.

This is one execution-input adapter for the existing `execute-plan` implementation owner. It is
not a workflow, task class, planning artifact, approval mechanism, or generated per-task record.

## Direct execution contract

Treat the current request, together with verified current repository evidence and any applicable
existing Task Baseline or accepted Task Decisions, as the bounded execution contract. The request
itself supplies mutation authority for its stated result; do not translate it into a plan,
execution-contract artifact, mini-plan, or duplicate approval.

Do not establish Task Alignment, persisted Task State, or a Task Workspace solely for this input.
When a current Baseline or accepted Task Decision already unambiguously governs the exact task,
consume it without reconstructing, amending, or requiring an active persisted plan. Issue and Task
Workspace presence are tracking or persistence facts, not execution-mode selectors.

Inspect enough current repository evidence to determine the exact in-scope files, the smallest
sufficient implementation, proportionate rollback, reviewability, and validation at the affected
boundary. Exact-file discovery inside the stated behavior or artifact boundary is not scope drift.
Keep the pre-execution update compact and do not expose an eligibility checklist.

Use strict execution by default. A bounded clarification that resolves one missing detail without
changing the task boundary, authority, risk, architecture, dependencies, or validation strategy may
resume the same direct request without planning or renewed execution approval.

## STOP boundary

Stop when evidence shows that completion needs a new user-owned decision, material scope or
authority expansion, changed architecture or dependencies, a different validation strategy, or a
separately owned consequential effect that the current request has not authorized through its
existing owner. Report the concrete discovered boundary and let the user choose broader direct
authority or the planned path. Do not create a plan, closeout workflow, or other lifecycle artifact
automatically after stopping.

The direct path does not weaken secret safety, branch and freshness checks, reviewability,
publication, review, merge, release, deployment, destructive-action, global-tooling, or other
external-effect boundaries.
