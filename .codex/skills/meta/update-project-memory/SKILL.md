# Update Project Memory Skill

## Role Routing Integration

Use `agent-roles-and-capabilities` as the canonical owner for the `Project memory update` route and
the Role Routing Display Condition. Read or apply that route before continuing. When display is
required, render its canonical fields without maintaining a local copy. Do not claim the canonical
routing skill was used unless it was actually read or applied.


## Durable Memory Loop Integration

Use this skill when the agent operating contract or another workflow determines that durable project knowledge was produced.

After meaningful planning, implementation, debugging, review, publishing, installation, or major discussion, classify durable updates as:

```txt
Current facts -> .codex/project-memory/guideline.md or one indexed whole-file/exact-section fact owner
Long-term decisions -> .codex/project-memory/decisions.md
Lessons and reusable patterns -> .codex/project-memory/lessons-learned.md
```

Lessons are not limited to mistakes. Classify lesson candidates as:

```txt
Avoid:
  mistakes, risks, bad patterns, repeated failure modes

Keep:
  successful patterns, useful workflows, good validation strategies, stable engineering practices

Mixed:
  tradeoffs or patterns that are useful only in specific contexts
```

Do not silently write memory. Always emit the Mandatory Pre-Update Summary before mutation. A
confirmed, directly related update within an approved mutation workflow's project-file authority
does not require separate confirmation; otherwise wait for explicit authorization.

## Reusable Lesson Promotion Candidates

Project experience must be recorded in local project memory first when it is durable.

This workflow may identify a reusable lesson candidate, but it does not promote lessons into
repository agent-tooling files by itself. Reusable lesson promotion requires generalization
review, user confirmation, and a later approved plan before any rule, skill, template, or
documentation change.

Use this candidate format:

```txt
Reusable Lesson Candidate:
- Source project / source context:
- Original lesson:
- Reusable principle:
- What generalizes:
- What does not generalize:
- Proposed destination:
- Risk of overgeneralization:
- User decision:
- Next workflow:
```

Rule: do not automatically promote project lessons. A candidate remains local project memory until the
user confirms that it should be generalized into repository agent tooling.


Use this skill to update durable project memory after project facts, decisions, or reusable lessons change.

This skill owns confirmed durable writes. It depends on `project-memory` for the Project Memory
Context Gate and memory-reading rules; it must not become a general planning, research, or
context-discovery workflow.

This skill is the only durable writer for one or more of:

```txt
.codex/project-memory/guideline.md
.codex/project-memory/topic-index.md
.codex/project-memory/topics/*.md
.codex/project-memory/decisions.md
.codex/project-memory/lessons-learned.md
```

It must not silently update project memory.

## Role

When using this skill, act as:

```txt
Project Memory Curator
```

The Project Memory Curator classifies durable updates into current facts, decision rationale, and reusable lessons.

## When to Use

Use this skill after changes involving:

- Project scope
- Non-goals
- Architecture
- Data flow
- Directory structure
- Dependencies
- Package manager
- Runtime or Node version
- Scripts and commands
- Environment variables
- Testing strategy
- Linting or formatting strategy
- Deployment setup
- Git or publishing workflow
- Agent workflow
- Major implementation status changes
- Important decision rationale
- Reusable debugging lessons or mistakes

## When Not to Use

Do not use this skill for:

- Small UI text changes
- Minor styling tweaks
- One-off scratch notes
- Temporary plans
- Local-only handoff notes
- Failed experiments with no future reuse value
- Purely internal refactors that do not affect durable project facts
- Changes already accurately reflected in project memory

## Required Context

Pass the Project Memory Context Gate defined in the `project-memory` skill and consume its result
in the update context. As a context-repair workflow, follow the central gate's continuation rules
without redefining them here.

Also inspect changed files when the update follows implementation work.

Use a plan, handoff, or other local process artifact only when the user or active task identifies
it as relevant, and only after the Project Memory Context Gate freshness check.

`docs/open-findings.md` may be used as an optional evidence source only when the approved update
explicitly names a relevant finding or authorizes its promotion. Do not add it to mandatory context
reads, scan it during unrelated updates, or treat an entry as confirmed merely because it was
recorded there.

## Workflow Header

Surface workflow or role information only when the central Role Routing Display Condition applies
or the user explicitly requests it. When it is required, render the canonical central routing
presentation rather than a local header. This does not change the separate Mandatory Pre-Update
Summary below.

## Mandatory Pre-Update Summary

Before modifying project memory, output:

```txt
Project Memory Update Summary:
- Trigger:
- Files to update:
- Current facts changed:
- Major impacts:
- Decisions to record:
- Lessons learned:
- Risk of outdated information:
```

Do not update files silently.

The summary should help the user or future agent understand why durable project memory needs to change.

## Calling Workflow and Lifecycle Boundary

When an approved mutation workflow invokes `update-project-memory` for a confirmed, directly
related in-scope update, this skill completes its own summary, admission, destination, and write
duties, then returns to the calling workflow. It does not run lifecycle finalization as a
supporting subworkflow. The calling primary workflow retains lifecycle finalization for the
lifecycle outcome it produces.

When `update-project-memory` is the active top-level workflow, it retains its normal final report
and lifecycle-finalization responsibility.

## Update Rules

### 1. Current facts go to one authoritative fact owner

Update the concise core:

```txt
.codex/project-memory/guideline.md
```

when the current project state changes and the fact is broadly useful on common paths.

Update one indexed whole-file or exact-heading owner under:

```txt
.codex/project-memory/topics/
```

when the fact belongs to an existing conditionally relevant topic. For an exact-heading owner,
keep the update inside that section's boundary through the next same-or-higher-level heading. Do
not keep the same fact authoritative in both the core and a routed fact owner.

Examples:

- New package manager
- New Node version
- New framework convention
- New directory structure
- New build command
- New test command
- New environment variable
- New deployment target
- Changed architecture
- Changed workflow
- Changed implementation status

### 2. Reasons go to decisions.md

Update:

```txt
.codex/project-memory/decisions.md
```

when a decision is important and future agents should not re-litigate it accidentally.

Record:

- Context
- Decision
- Reason
- Impact
- Related files

Do not record every small implementation choice.

### 3. Reusable lessons and patterns go to lessons-learned.md

Update:

```txt
.codex/project-memory/lessons-learned.md
```

when a debugging discovery, mistake, risk, successful pattern, or tradeoff has reuse value.

Record:

- Context
- Lesson category: Avoid / Keep / Mixed
- Problem, pattern, or tradeoff
- Root cause or why it worked
- Resolution or reuse conditions
- Reuse guidance
- Related files

Do not record one-off noise.

### 4. Maintain the topic index atomically

`.codex/project-memory/topic-index.md` is routing metadata, not a fact, decision, lesson, summary,
or second source of truth.

An indexed current-fact owner may be a whole topic file or an exact heading inside a topic file.
When adding, renaming, moving, or removing a fact topic, exact fact heading, or named
decision/lesson heading, update its exact index pointer and `Read when` condition in the same
authorized change. Resolve an exact section from its heading through the next same-or-higher-level
heading. Never use line numbers as section selectors.

Preserve the selected section's ownership boundary. A heading or pointer change is incomplete
unless the topic content and routing index remain mutually resolvable in the same update; do not
introduce a second manifest, section registry, or generated pointer layer.

Create a new fact topic only when confirmed durable content does not fit the core or an existing
topic owner and the approved update explicitly includes the structural change. Do not create topics
automatically from plans, reports, prompts, or one-off findings.

### 5. Prefer updating existing sections and owners

When updating `guideline.md`, prefer existing fixed sections.

Do not create duplicate headings.

If adding a new section is truly necessary, mention it in the update summary.

When updating a fact-topic file, preserve its indexed whole-file or exact-section ownership
boundary. If content no longer fits, propose the owner/index change before moving it.

### 6. Do not copy plans into project memory

Plans are process documents.

Do not copy large plan content into project memory.

Only summarize the resulting current facts, decisions, and reusable lessons.

### 7. Protect secrets and local-only content

Do not store:

- Secrets
- Tokens
- Credentials
- Real `.env` values
- Private user data
- Local database content
- Large logs
- `dev_locals/` scratch content without durable value

### 8. Promote an explicitly authorized finding selectively

When the approved update names an open finding whose destination is a canonical Project Memory
authority:

1. revalidate the evidence against current authoritative sources;
2. confirm the knowledge is not already represented accurately;
3. apply the normal fact, decision, or lesson admission rules above; and
4. record only the durable result in the correct Project Memory file.

This skill's write boundary is the canonical `.codex/project-memory/` tree: the guideline core,
topic index, indexed fact-topic files, decisions, and lessons. Other workflows may propose or read
memory but must not write it. This skill must not remove or rewrite `docs/open-findings.md` unless a
separate approved documentation workflow authorizes that mutation, and it must not create an
automatic promotion queue. When promotion completes, the promoting commit or PR should identify
the durable destination so the separately authorized documentation cleanup can remove the open
entry without maintaining a permanent disposition log.

## Domain Vocabulary and Durable Decisions

Project memory may include a lightweight domain vocabulary when stable terms affect
implementation, review, onboarding, or future planning. Keep it inside the existing project-memory
structure. Do not create a parallel `CONTEXT.md` or second source of truth unless the project has
explicitly adopted one.

Record durable decisions sparingly. A decision belongs in `decisions.md` when it is hard to
reverse, surprising without context, based on a real tradeoff, or likely to affect future
implementation or review. Do not turn every implementation detail into an ADR-like entry.

Use the existing memory split:

- `guideline.md` for concise broadly relevant project overview, conventions, vocabulary, and
  workflow context.
- `topic-index.md` for read routing only.
- `topics/*.md` for conditionally relevant current facts with one indexed whole-file or
  exact-section owner.
- `decisions.md` for durable architectural, product, workflow, or policy decisions.
- `lessons-learned.md` for reusable lessons from incidents, bugs, migrations, or reviews.
- `dev_locals/` for temporary plans, research notes, work items, and local-only analysis unless the
  repository convention says otherwise.

## Post-Update Output

After updating, report:

```txt
Updated:
- <file>: <summary>

Not updated:
- <file>: <reason>

Validation:
- <check>
```

Include `External / global actions` only when an action occurred or the fact is material.

When `update-project-memory` is the active top-level workflow and at least one project-memory file
changed, apply the Publishable Change Handoff from the `agent-operating-contract` rule exactly
without duplicating its fixed field list in this skill. When it is a supporting subworkflow, return
the update result to the caller without lifecycle finalization. The no-update output below does not
trigger that handoff.

If no update is needed, say:

```txt
No project memory update needed.
Reason:
```

If an external or global action occurred with explicit approval, report the command or change,
approval, reason, and result.
