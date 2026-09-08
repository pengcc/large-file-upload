# Approved Execution Contract

Read this reference only when executing a current approved non-direct execution contract.

An adequate contract may be a persisted plan or a non-persisted current specification, diagnosis,
or bounded remediation handoff. Its authoring form or historical name does not change the checks
below. Reuse adequate approved work without duplicate planning, reformatting, saving, or a forced
Task State transition.

Before mutation, verify that the contract is current, explicitly authorized, and execution-complete.
It must identify:

- goal;
- scope and non-goals;
- implementation direction or the approved current slice;
- validation and observable acceptance;
- material risks and rollback;
- meaningful task-specific STOP conditions, or an explicit statement that none were identified
  beyond canonical controls;
- reviewability; and
- the execution authority and status appropriate to its source.

For a persisted plan, apply `.codex/project-collaboration/task-alignment.md`, then resolve the
canonical Task Workspace through `.codex/rules/task-and-change-safety-principles.md`. Read the
current Baseline and applicable accepted Task Decisions from that workspace and verify that the
selected plan is the Task State's single `approved / active` persisted plan. Read
`../../../../../rules/references/persisted-plan.md` for its repository-local persistence/status
adapter. Do not infer a workspace from an attachment or source path, synthesize a missing activation
checkpoint, or repair Task State from the implementation branch.

For a non-persisted contract, verify its current authority and all of the same substantive
readiness checks without requiring Task State persistence. A legacy-form contract remains eligible
only when it is genuinely current, applicable, and approved. A historical, inactive, superseded,
stale, or otherwise non-current artifact is context or review lineage only; return to the current
planning or authority owner before it can become executable again.

Freeze the applicable Task Baseline, accepted Task Decisions, and selected contract for the active
pass. Compare them with current implementation truth before mutation. Run implementation on a
separate normal implementation branch based on the current implementation baseline, normally
current `main`; do not reuse the Task State branch, mutate canonical Task State from the
implementation branch, or poll Task State during execution.

Missing content, `TBD`, unresolved material risk, `incomplete draft`, blocked status, or an
ambiguous, stale, or unauthorized contract requires stopping and returning to the current planning
or authority owner. Use only approved Work Items and the explicit current slice. Default execution
mode is `strict`; use `autonomous-within-plan` only when the user explicitly authorizes it.
