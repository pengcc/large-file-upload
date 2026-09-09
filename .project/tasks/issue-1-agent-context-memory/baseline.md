# Task Baseline

GitHub Issue: #1
Task State branch: task/issue-1-agent-context-memory
Task Workspace: .project/tasks/issue-1-agent-context-memory/

## Intent
Maintain a small, target-owned Agent context for `large-file-upload` so future architecture, planning, implementation, and review work can recover current project truth without repeatedly reconstructing it from conversations or inheriting Badminton-specific product/runtime assumptions.

## Expected Outcome
The repository has a clear, durable, target-owned context boundary that distinguishes shared reusable collaboration semantics from `large-file-upload`-specific architecture/tooling truth, while keeping currently absent execution capabilities explicitly absent.

## Scope
- Clarify the target-owned adoption/context boundary for shared Agent collaboration assets.
- Establish concise target-specific Agent guidance where the current project has real constraints not owned by shared contracts.
- Organize durable current Project Memory so accepted architecture direction and current repository/tooling capability state are discoverable through the existing memory routing model.
- Preserve only evidence useful across later architecture, planning, implementation, or review stages.

## Non-goals
- Do not add repository publication, merge, worktree automation, application validation, deployment, runtime, package-manager, or development-session tooling.
- Do not select or reopen product technology choices merely to support this context work.
- Do not import Badminton product/domain code, runtime assumptions, Project Memory, deployment machinery, or project-specific specialists wholesale.
- Do not create placeholder skills, rules, prompts, topics, or directories without a current target consumer.

## Key Boundaries
- `large-file-upload` remains the authority for its product architecture, runtime, repository tooling, validation, deployment, and operations.
- Shared workflow semantics may be reused, but another product repository must not become a runtime or project-truth dependency.
- The already accepted upload architecture direction remains input evidence; this task organizes durable context and must not silently redesign it.
- Architecture/provider/checksum facts that materially affect product correctness remain subject to the existing docs-first research boundary rather than being asserted from source-project precedent.
- Current absence of application/runtime/publication tooling is truthful project state and must not be obscured by copied placeholders.

## Value and Risk
The value is lower repeated-context cost, less source-project leakage, and clearer ownership before implementation begins. The main risk is overbuilding project-specific Agent infrastructure or freezing research-stage assumptions as permanent truth. Control should therefore remain narrow, evidence-backed, and reversible.

## Success Boundary
A future agent can determine, from target-owned repository context, the accepted architecture/tooling state relevant to its task, the boundary between shared and project-specific guidance, and which capabilities are intentionally not installed, without needing Badminton runtime knowledge or duplicate workflow rules.
