# Agent Roles and Capabilities Skill

Use this skill to route a task to the right role, capability boundary, maturity expectation,
workflow, and supporting skills. It does not implement features.

## Required Truthfulness

Do not claim that this skill was used unless it was actually read or applied.

Do not claim a technology-specific skill exists unless it is installed and actually used.

Do not claim framework, version, API, security, deployment, or compatibility facts without repo evidence or `docs-first-research`.

Do not use role titles to imply human credentials, certifications, or job seniority.

## Core Principle

Roles are working perspectives, not job titles; workflows define process boundaries. A workflow
may use multiple roles, and a role may support multiple workflows.

## Supporting Skill Invocation

The primary workflow remains active during a bounded supporting-skill substep; return to it after
the substep. Claim supporting-skill use only when its instructions were read and applied.

Supporting skills do not bypass the Project Memory Context Gate, execution-contract boundaries,
safety rules, or the Missing Specialist Skill Policy.

## Skill Taxonomy Routing

Apply the `skill-invocation-and-dependency-boundaries` rule when routing skills by category,
invocation type, or hard dependency.

- Meta skills provide reusable disciplines shared by workflows.
- Core skills provide default engineering and project workflows.
- Optional skills are available only after explicit adoption.

Do not infer installed capability from category metadata alone. Meta and core routing must remain
functional when optional skills are absent.

## Project-Specific Capability Routing

When present and relevant, read `.codex/project-specific/agent-guidance.md` and inspect
`.codex/project-specific/skills/`, `.codex/project-specific/rules/`, and
`.codex/project-specific/prompts/`. These repository-owned capabilities use the same formats,
metadata, invocation, dependency, routing, and authoring standards as other repository capabilities.

Project-specific skills may depend on repository meta/core skills. Shared meta/core routing must
remain functional without project-specific skills. Avoid ambiguous duplicate skill identities
across shared and project-specific paths. Route explicitly by path; do not assume native automatic
discovery or introduce a second capability system.

## Bootstrap-Safe Routing Invariant

This skill may be used for initial role/workflow routing without first passing the Project Memory
Context Gate.

If routing depends on project-specific facts, use project-memory as supporting context before
making project-state decisions.

If routing depends on unclear user intent, apply the Requirement Clarification Gate from
`agent-operating-contract`: state the ambiguity, recommend the likely workflow route or next
decision, and ask for confirmation. Use `grilling` when the routing ambiguity is broad, branching,
decision-heavy, or blocks a required Task Baseline input for the selected route.

## Role Routing Display Condition

This skill owns whether role information is displayed. Route every task through its workflow or
capability owner, but surface role taxonomy only when the role or specialist distinction materially
changes capability selection, behavior, risk treatment, degraded fallback, or a user-relevant
decision, or when the user explicitly requests it.

Entering a workflow, changing its mode, or encountering ordinary elevated risk does not by itself
require a role-taxonomy header. Keep roles available as working perspectives and route metadata.

Omitting routine role presentation does not relax workflow selection, the Project Memory Context
Gate, target-reference verification, approval boundaries, stop conditions, final reporting, or
publication safeguards. Apply those requirements and surface their material results under their
owning workflows.

## Role Routing Presentation

When the Role Routing Display Condition requires it, output only the routing facts that are
material to the task. A concise form may be:

```txt
Workflow:
Material role or specialist distinction:
Relevant mode, fallback, or quality boundary:
```

Rules:

- Keep it short.
- Include a role label, supporting role, mode, maturity expectation, specialist skill, or quality
  rule only when that fact is material or explicitly requested.
- Do not paste full role definitions.
- If no technology-specific skill is installed, say so.
- If framework/API/version/config claims matter, use repo facts and `docs-first-research`.
- Apply `engineering-quality-principles` for engineering, architecture, implementation, and review work.

## Generic Role Categories

The generic role categories for full-stack JS/Web projects are:

1. Product / Context / Planning
2. Architecture / System Design
3. Frontend / Web Platform
4. Backend / API / Integration
5. Data / Persistence
6. Quality / Review / Testing / Validation
7. Security / Performance / Accessibility
8. Tooling / Build / DevOps / Delivery
9. Documentation / Memory / Handoff

These categories cover common full-stack JavaScript and web concerns, but remain generic roles.

Technology-specific expert skills such as Vue, NestJS, SFCC, Adyen, Prisma, Drizzle, PostgreSQL,
SQLite, or MongoDB remain future skills. Project-specific Next.js App Router and TanStack Query
guidance is available through `next-app-router-patterns` and `tanstack-query-patterns` when their
task triggers match. No TanStack Router specialist skill is currently adopted.

If those skills are not installed, use generic roles and support technical claims with repo facts and `docs-first-research`.

## Missing Specialist Skill Policy

When a technology-specific or domain-specific skill would be useful but is not installed, do not
pretend it exists and do not expand the current task into skill creation.

State the fallback explicitly:

```txt
Missing Specialist Skill:
- Missing specialist skill:
- Fallback generic role:
- Repo facts checked:
- External facts that require docs-first-research:
- Risk of proceeding without the specialist skill:
- Future skill candidate: yes | no
```

Use this policy to make capability gaps visible without blocking low-risk work or adding optional
skills prematurely. If the missing skill materially affects correctness, security, architecture,
or user-facing behavior, use `docs-first-research` and surface the residual risk before
continuing.

## Expected Maturity

Role titles do not use `Senior` by default. Apply senior-level engineering judgment to
architecture, planning, code review, security, data models, integrations, deployment,
cross-system decisions, and high-risk implementation.

For small bounded tasks, stay pragmatic and avoid overengineering.

## Engineering Quality Rule

Engineering, architecture, implementation, and review roles must apply the
`engineering-quality-principles` rule.

Project conventions, lint/format/test configuration, and existing repo patterns take priority.

If project conventions conflict with general quality principles, report the conflict and ask the user or project memory to decide.

## Principle Application Semantics

When a route, role, target condition, or explicit user request makes a supporting principle
applicable, reading, loading, or naming that principle is not sufficient evidence that it was
applied. Use it to constrain the design or review decision it governs before accepting or
recommending the candidate.

An explicit user request for a named or otherwise clearly applicable supporting judgment is
deterministic inside the already selected primary workflow. Do not skip it merely because an
automatic complexity, architecture, or risk heuristic would not have selected it. Supporting
judgment does not create another primary route, lifecycle stage, authorization boundary, fixed
questionnaire, or required report.

## Design Judgment Rule

When the user explicitly requests `Design Judgment Principles` or otherwise clearly requests
stronger design-suitability judgment, apply
`.codex/project-collaboration/principles/design-judgment-principles.md` inside the already selected
primary workflow. Apply it proportionally to the material design questions; it does not create
another route or lifecycle stage, replace task or stage authority, or require loading every design
rule. Keep independently applicable specialized principles in place. For Agent-tooling targets,
also apply Agent Tooling Design Principles.

## Agent Tooling Design Rule

When the actual target is an Agent rule, skill, prompt, checklist, routing record, validator,
Agent script, or related workflow tooling, apply
`.codex/project-collaboration/principles/agent-tooling-design-principles.md` inside the selected primary
workflow. This conditional design lens does not create another route, replace the active workflow,
or apply to ordinary product or engineering work merely because it is complex.

For a new or materially expanded Agent-tooling concept, apply that principle set's Tooling Change
Gate before the concept becomes the recommendation. When its value case is weak, simplify, defer,
or reject the candidate as the principles require; do not treat retrospective citation of the
principles as satisfying the gate. Expose the gate's reasoning only when the active workflow needs
it; do not add a mandatory five-question report.

## Task-to-Role Routing

Use these defaults unless the user explicitly requests a better-fitting role.

The selector below is the bootstrap-safe canonical index. Select from the request without Project
Memory when possible. If project facts affect selection, use `project-memory` as supporting
context. If user intent remains materially ambiguous, apply the Requirement Clarification Gate
instead of loading every route.

Read the selected route reference completely before invoking or representing that route. Load the
active primary route plus only an explicitly triggered supporting route, such as concrete UI
guidance. When the workflow or mode changes, read the newly selected route at that transition; do
not preload possible later routes.

Each referenced record is the canonical source for route identity, primary and supporting roles,
workflow, optional mode or fallback, maturity expectation, technical-specialist guidance, quality
rule, and route-local consequences. Workflow owners retain their local triggers, consequences,
degraded fallbacks, authorization boundaries, and output contracts.

| Task intent | Route key | Canonical route reference |
|---|---|---|
| Initialize a new, newly adopted, or insufficiently documented project | `project-initialization` | `references/routes/project-initialization.md` |
| Resolve materially unclear intent, scope, requirements, constraints, or decisions | `requirement-clarification` | `references/routes/requirement-clarification.md` |
| Frame end-user product behavior | `task-product-framing` | `references/routes/task-product-framing.md` |
| Create a feature, theme, workflow, or normal implementation plan | `feature-theme-planning` | `references/routes/feature-theme-planning.md` |
| Plan validation or testing as the primary deliverable | `validation-strategy-planning` | `references/routes/validation-strategy-planning.md` |
| Plan project architecture direction or a feature roadmap | `project-architecture-roadmap-planning` | `references/routes/project-architecture-roadmap-planning.md` |
| Execute a current approved execution contract or an already concrete directly executable bounded repository change | `approved-implementation` | `references/routes/approved-implementation.md` |
| Diagnose a symptom, regression, failure, or unclear behavior | `diagnosis` | `references/routes/diagnosis.md` |
| Explicitly re-slice an accepted solution into reviewable delivery items without changing its governing facts | `work-item-decomposition` | `references/routes/work-item-decomposition.md` |
| Review a concrete change or implementation-quality target | `change-review` | `references/routes/change-review.md` |
| Review proposed direction against an accepted plan or architecture | `plan-alignment-review` | `references/routes/plan-alignment-review.md` |
| Review a proposed or draft implementation plan | `proposed-plan-review` | `references/routes/proposed-plan-review.md` |
| Review delivery or acceptance criteria only | `acceptance-review` | `references/routes/acceptance-review.md` |
| Review the complete delivered implementation or remediation | `implementation-review` | `references/routes/implementation-review.md` |
| Audit a repository or broad codebase area | `codebase-audit` | `references/routes/codebase-audit.md` |
| Verify consequential external technical facts | `technical-fact-verification` | `references/routes/technical-fact-verification.md` |
| Produce or review a formal stage-boundary handoff | `project-agent-handoff` | `references/routes/project-agent-handoff.md` |
| Compact local context for a future session | `session-continuation` | `references/routes/session-continuation.md` |
| Create, refine, or evaluate a reusable skill | `skill-authoring` | `references/routes/skill-authoring.md` |
| Update confirmed durable Project Memory | `project-memory-update` | `references/routes/project-memory-update.md` |
| Push a clean committed branch and create or update its PR after explicit authorization | `open-or-update-pr` | `references/routes/open-or-update-pr.md` |
| Immediately merge one exact PR after separate explicit authorization | `merge-pr` | `references/routes/merge-pr.md` |
| Add bounded concrete UI guidance to an active workflow | `concrete-ui-guidance` | `references/routes/concrete-ui-guidance.md` |

An explicit lightweight implementation request and an already concrete, directly executable
bounded mutation request select the same `approved-implementation` route. The `lightweight` label
is a deterministic routing signal, not a prerequisite for an obviously direct tiny task. Preserve
an explicit request for shaping, planning, or the full planned path. Do not introduce an
eligibility questionnaire, scoring model, or task-category whitelist before selecting the direct
route; if execution discovers a material boundary, the execution owner stops under its own
contract.

If a selected route reference is missing or inconsistent, apply the Explicit Target Reference
Guardrail and Workflow Routing Enforcement in `agent-operating-contract`. Do not guess its fields,
load an unrelated route, or substitute an alternate workflow unless the selected route or workflow
explicitly defines that degraded fallback.

## Available Roles

Project Context Initializer; Requirement Clarifier; Product Framing Reviewer; Product
Planner; Project Planner; Delivery Planner; Project Architect; Frontend Architect; Backend
Architect; Frontend Engineer; Frontend Framework Specialist; Framework Specialist; Backend
Engineer; API Designer; Integration Engineer; Database Engineer; Data Model Reviewer;
Implementation Executor; Debugging Engineer; Code Reviewer; Architecture / Engineering Alignment
Reviewer; Implementation Reviewer; Acceptance Reviewer; Codebase Auditor; TypeScript Reviewer; Validation / Test Designer;
Test Strategy Reviewer; Test Engineer; Test Reviewer; Security Reviewer; Performance Engineer;
Performance Reviewer; UI / Accessibility Reviewer; Architecture Reviewer; Tooling Reviewer;
Tooling / Delivery Reviewer; Build Engineer; PR Manager; PR Merge Manager; Technical Researcher; Project Memory
Curator; Documentation Writer; Documentation Reviewer; Documentation / Memory Reviewer; Skill
Author; Handoff Writer; Continuation Writer.

Use `REFERENCE.md` only when a selected role needs its detailed purpose, focus, supporting skills,
or boundaries. Routine route selection uses the compact selector and selected canonical record
above.

## User-Specified Roles

Honor a user-specified primary or supporting role when it fits the task and workflow boundary.
Otherwise explain the mismatch and recommend correct routing. User-specified roles cannot bypass
workflow boundaries.

## Final Checks

Before acting after role routing, verify:

- Is the workflow correct?
- Is the primary role correct?
- Are supporting roles needed?
- Is the maturity expectation appropriate?
- Is a technology-specific skill missing?
- Is `docs-first-research` needed?
- Does `engineering-quality-principles` apply?
- Does the target conditionally require `agent-tooling-design-principles`?
- Are workflow boundaries respected?
