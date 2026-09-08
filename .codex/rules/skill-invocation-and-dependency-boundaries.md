# Skill Invocation and Dependency Boundaries

Use this rule when creating, refining, routing, or reviewing repository skills and metadata.

## Taxonomy

- `meta`: reusable agent disciplines shared across workflows.
- `core`: engineering and project workflows available on the normal routing path.
- `optional`: explicitly adopted specialist capabilities outside the normal routing path.

Repository paths must match metadata category: meta skills live under `.codex/skills/meta/`, core
workflows under `.codex/skills/core/`, and repository-specific specialists under
`.codex/project-specific/skills/`. Optional capability availability must be verified from current
repository or runtime evidence; catalog presence alone is not adoption approval.

Apply the Explicit Target Reference Guardrail in `agent-operating-contract` when an explicit skill
path is missing, obsolete, or inconsistent with its metadata category.

## Invocation

- `user`: a user explicitly starts the workflow; keep wrappers thin.
- `model`: the agent may invoke the skill when its task trigger matches.
- `support`: another skill or rule references the capability; do not route to it as a standalone
  user workflow.

Metadata descriptions are invocation logic, not documentation. For model-invoked skills, lead
with the trigger, keep distinct trigger branches only, and leave workflow detail in `SKILL.md`.

## Dependencies

`depends_on` lists hard skill dependencies only. References, optional supporting skills, and
workflow alternatives are not hard dependencies.

- Meta skills may depend only on meta skills or support references.
- Core skills may depend on meta skills.
- Optional skills may depend on meta skills.
- Meta and core skills must remain functional without optional skills.
- Optional-to-optional dependencies must be explicit in metadata.
- An optional dependency on a core workflow must be explicit and justified in the skill.

## Context Load

- Keep user-invoked wrappers thin.
- Put shared reusable behavior in a meta skill or single canonical rule.
- Inline instructions needed on every path; move branch-specific long reference behind a clear
  pointer that says when to read it.
- Remove duplicated meaning and instructions that do not change behavior.
- Prefer strong leading words over repeated explanatory prose.
- Keep one source of truth for each behavior and link to it from other surfaces.

Do not optimize toward a numeric token target. Description length is a diagnostic; correct routing
and preserved safety boundaries take priority.
