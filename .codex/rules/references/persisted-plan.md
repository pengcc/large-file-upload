# Persisted Plan Adapter

Read this reference only when a proportionate implementation plan needs Task State persistence for
genuine multi-round or cross-stage continuity.

The Project Collaboration Implementation Planning contract owns plan completeness, proportionality,
reviewability, validation, risk, rollback, and task-specific STOP behavior. This adapter adds only
repository-local persistence and status requirements:

- resolve the canonical Task Workspace through
  `.codex/rules/task-and-change-safety-principles.md`;
- save the plan beside its referenced `baseline.md` without copying that Baseline;
- resolve applicable accepted Task Decisions through the same workspace;
- keep one truthful execution status, with at most one persisted plan marked
  `approved / active` at a time; and
- preserve historical persisted plans as lineage without migrating them solely for new vocabulary.

Activation records explicit user approval of the exact current reviewed plan; it does not
independently re-decide plan quality or repeat semantic Plan Review. Verify that the plan, current
Task Baseline, and applicable accepted Task Decisions remain current and consistent. Stop and
return to the planning/review owner when freshness or governing authority changed; do not activate
without explicit approval or request the same approval again when it already applies.

Activate the selected persisted plan and record the exact Task State checkpoint only through the
Persisted Task State Mutation and Remote Persistence Guard, preserving active-plan uniqueness and
its exact-branch, exact-workspace, verified-predecessor, and compare-and-swap safeguards. Approval
without that guarded checkpoint is not active persisted authority. A historical, inactive,
superseded, or stale persisted plan remains context or lineage rather than a current execution
input.

Do not add a manifest, pointer, registry, classifier, or another state mechanism. This adapter
does not make persistence mandatory for another adequate approved execution contract.
