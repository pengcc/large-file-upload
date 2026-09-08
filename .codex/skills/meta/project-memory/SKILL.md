# Project Memory Skill

Use this skill when a task depends on project-specific facts, constraints, architecture, workflow, decisions, lessons, or current implementation status.

This skill is the unified entry point for reading and applying durable project memory.

It owns the Project Memory Context Gate and durable memory reading/applying. It does not write
durable memory directly; confirmed writes belong to `update-project-memory`.

It covers:

```txt
.codex/project-memory/guideline.md
.codex/project-memory/topic-index.md
.codex/project-memory/topics/*.md
.codex/project-memory/decisions.md
.codex/project-memory/lessons-learned.md
```

The memory authorities stay specific:

- `guideline.md` stores concise always-read current facts.
- indexed files under `topics/` store conditionally relevant current facts.
- `topic-index.md` routes reads; it stores no facts, decisions, lessons, or summaries.
- `decisions.md` stores durable decision rationale.
- `lessons-learned.md` stores reusable lessons, mistakes, and debugging findings.

## Role

When using this skill, act as:

```txt
Project Memory Reader
```

The Project Memory Reader loads relevant project memory before planning, executing, reviewing, debugging, documenting, or publishing project work.

## When to Use

Use this skill before:

- Planning project work
- Executing an implementation plan
- Reviewing code
- Debugging or refactoring
- Changing architecture
- Changing dependencies
- Changing scripts or tooling
- Changing deployment behavior
- Changing environment variables
- Updating project memory
- Publishing or preparing project changes
- Making any decision that depends on current project state

## When Not to Use

Do not use this skill for:

- Purely conversational questions unrelated to the project
- One-off explanations that do not depend on project state
- Temporary scratch notes that will not affect the project
- Generic knowledge questions that do not require project context

## Project Memory Context Gate

Use this gate before producing context-dependent output or modifying project state.

### Source Selection

Use the current repository-owned Project Memory sources:

```txt
.codex/skills/meta/project-memory/SKILL.md
.codex/project-memory/guideline.md
.codex/project-memory/topic-index.md
.codex/project-memory/topics/*.md or exact indexed fact sections when selected
.codex/project-memory/decisions.md when selected
.codex/project-memory/lessons-learned.md when selected
```

When a selected artifact declares an exact external source contract, apply that contract without
treating it as a repository-wide ownership rule.

### Gate Sequence

1. Read and apply the applicable `AGENTS.md` instructions.
2. Read and apply this `project-memory` skill from the applicable source above.
3. Always read `.codex/project-memory/guideline.md` when available.
4. Always read `.codex/project-memory/topic-index.md` when available.
5. Select whole-file or exact-heading fact owners and exact decision or lesson headings whose
   `Read when` conditions match both the task type and its actual subject. Selection is additive.
6. Read each selected whole-file fact topic completely. Read a selected exact fact, decision, or
   lesson section from its heading through the next same-or-higher-level heading.
7. Treat routed matches as the minimum required set, not proof that no other material context can
   matter. Add another routed source, apply complete-context expansion, or stop when current
   evidence reveals a material interaction, unrepresented subject, missing required source or
   heading, or unresolved context-sufficiency gap.
8. Apply complete-context expansion only under the exceptional conditions below.
9. If the user or active task identifies a plan, handoff, report, or research note, verify its
   date, status, and alignment with current sources before using it. Do not scan local process
   artifacts by default or treat them as durable truth.
10. Inspect the task-specific repository evidence needed to confirm current behavior, such as:

```txt
README.md
package.json
lockfile
.env.example
config files
source files
tests
```

11. Surface the gate result before context-dependent output or mutation when it is partial,
    blocked, stale, conflicting, update-relevant, or otherwise materially affects continuation.
    A routine `passed` + `sufficient` result may be consumed silently unless a narrower workflow
    or the user requires it.

### Topic Selection

`topic-index.md` is the routing-only source for whole-file or exact-heading fact owners and exact
decision or lesson headings. Do not infer authority from a topic key or repeat its content in the
index.

Do not read a complete fact container, all decisions, or all lessons merely because the task is
planning, implementation, review, debugging, tooling, publishing, security-sensitive, destructive,
or otherwise high risk. The actual subject and affected boundary must match the indexed read
condition. Read multiple owners when multiple conditions apply, and broaden when evidence shows
that the routed minimum is insufficient.

### Complete-Context Expansion

Read the guideline core, every indexed fact-topic file, complete `decisions.md`, and complete
`lessons-learned.md` only when selective context cannot safely and proportionately establish the
material set. This includes when:

- the task changes Project Memory selection, expansion, routing, or ownership in a way that can
  affect discoverability across multiple owners;
- multiple durable owners materially interact and their combined effect cannot be established
  safely and proportionately through routed selection; or
- an unresolved routing or context-sufficiency gap makes complete reading the cheapest safe way to
  establish the required context.

Security, authentication, authorization, credentials, secrets, destructive persistence or data
work, runtime, deployment, publication, external effects, and other high-loss boundaries still
require every material routed fact, decision, and lesson. Their category label alone does not
require complete expansion. A routine single-owner Project Memory update likewise does not require
complete expansion merely because it changes Project Memory.

Complete expansion is a safety fallback, not the normal path. Do not avoid it merely to reduce
context when one of the exceptional conditions applies.

### Missing or Stale Topic Index

If `topic-index.md` is missing or structurally stale, enumerate and read the complete fallback set:

```txt
.codex/project-memory/guideline.md
every existing .codex/project-memory/topics/*.md
.codex/project-memory/decisions.md
.codex/project-memory/lessons-learned.md
```

Report the gate as `partial` and route repair through `update-project-memory`. Report `blocked` if
the fallback set cannot be enumerated or read completely, or if a relevant indexed source or
heading is missing and current context cannot otherwise be established.

### Optional Findings Source

`docs/open-findings.md` is a supporting reference, not Project Memory and not a mandatory context
source. Read it only when the user or active task explicitly identifies a relevant finding, or when
an authorized promotion/update workflow names it as evidence. Do not scan it for unrelated tasks,
add it to the gate sequence, treat it as current authority, or promote entries automatically.

Before using a named finding, revalidate its evidence and confirm that no current plan, issue,
specification, decision, engineering rule, or Project Memory source already represents it
accurately. The current authoritative destination always overrides the open finding.

### Reporting Interface

```txt
Project Memory Context:
- Gate: passed | partial | blocked
- Files checked:
- Memory status: sufficient | missing | stale | update recommended
```

Gate status meanings:

- `passed`: required context was checked and is sufficient for the task.
- `partial`: context is incomplete or stale, but the active workflow can safely diagnose or
  repair it, or the gap is explicitly non-blocking.
- `blocked`: missing or conflicting context prevents safe continuation. Stop before
  context-dependent output or mutation.

Memory status meanings:

- `sufficient`: the checked memory supports the task without a durable update.
- `missing`: an expected memory source is absent.
- `stale`: memory conflicts with verified current project sources.
- `update recommended`: verified durable facts, decisions, or lessons should be recorded after
  the active workflow.

`initialize-project-context` and `update-project-memory` may continue from `partial` to diagnose
or repair context. They must still stop on `blocked`.

Use this form when reporting a material gate result, a narrower workflow requires it, or the user
asks for the context detail. Otherwise, do not add a workflow header or successful context block
solely to show that a required check ran. If project memory is missing, say so:

```txt
Context: .codex/project-memory/guideline.md missing
```

## Core Rules

### 1. The guideline core and indexed fact topics are current fact sources

Treat `.codex/project-memory/guideline.md` as the concise always-read current-fact core and the
selected whole files or exact sections under `.codex/project-memory/topics/` as authoritative
current facts for their indexed topics.

Use the guideline core only for stable facts that can materially change ordinary work across
multiple unrelated project domains, such as concise scope, stack identity, common navigation,
top-level architecture, shared language, and project-truth boundaries. Importance or risk alone
does not make subject-specific runtime, environment, testing, domain, workflow, or implementation
detail universally relevant.

Use selected whole-file or exact-heading fact owners for conditionally relevant current facts.
Never keep the same fact authoritative in both the core and a routed fact owner.

Selected memory is durable context, not independent proof of current repository behavior. Verify
task-specific current behavior from the repository. If verified current sources conflict with
memory, distinguish product intent from implementation, report the memory as stale or blocked as
applicable, and route correction through `update-project-memory`; do not silently overwrite either
authority.

### 2. Decisions explain why

Treat `.codex/project-memory/decisions.md` as the source for durable decision rationale.

Use it to avoid re-litigating settled decisions.

### 3. Lessons prevent repeated mistakes

Treat `.codex/project-memory/lessons-learned.md` as the source for reusable execution, debugging, and workflow lessons.

Use it to avoid repeating previous mistakes.

### 4. Plans are not durable truth

Plans are execution and process documents.

A plan may become outdated after execution.

Do not treat an old plan as the current state of the project.

Use the plan only as the execution source for the current task.

After execution, update project memory if the resulting current facts, decisions, or lessons changed.

### 5. Separate facts, decisions, and lessons

Use the right memory authority:

```txt
.codex/project-memory/guideline.md
.codex/project-memory/topics/*.md
```

For current project facts. Use the core or the one indexed topic owner.

```txt
.codex/project-memory/decisions.md
```

For important decision rationale.

```txt
.codex/project-memory/lessons-learned.md
```

For reusable mistakes, debugging discoveries, or lessons future agents should avoid.

### 6. Do not store secrets

Never store secrets, private tokens, credentials, production data, private customer data, or local-only environment values in project memory.

Reference `.env.example` for variable names and purposes.

### 7. Keep project memory useful

Project memory should be concise and durable.

Do not add:

- Temporary debug notes
- One-off scratch findings
- Failed experiments with no reuse value
- Unverified assumptions
- Large copied logs
- Old plan content that is no longer current

## Output Expectations

When the gate result is material or detail is requested, state the checked sources, the Project
Memory Context report, and whether an update may be needed. A routine sufficient result does not
need separate user-visible telemetry; preserve the checked sources in the active workflow context.
