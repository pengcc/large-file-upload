# Task Baseline

GitHub Issue: #2
Task State branch: task/issue-2-repository-publication-tooling
Task Workspace: .project/tasks/issue-2-repository-publication-tooling/

## Intent
Provide `large-file-upload` with a small, target-owned repository execution/publication boundary so authorized implementation work can move from a validated feature branch to an exact reviewable pull request and, with separate explicit authority, to a verified merge without relying on ad-hoc Agent shell commands or Badminton-specific repository machinery.

## Expected Outcome
The repository has one maintained, deterministic path for implementation publication and merge readiness/execution, plus the minimum Codex/worktree guardrails needed to keep that path safe and usable before ordinary product implementation begins.

## Scope
- Establish the repository-owned boundary for Git/repository preflight, exact branch publication, PR open-or-update, readiness evaluation, explicit-authority merge, and post-merge verification.
- Establish the minimum Codex execution/worktree boundary required for isolated implementation delivery.
- Prevent direct publication/merge paths from bypassing the maintained owner once a legal maintained path exists.
- Keep the capability usable before the application runtime/package-manager/toolchain is selected.

## Non-goals
- Do not select or imply the product application runtime, framework, persistence layer, storage provider, deployment platform, or application validation command.
- Do not copy Badminton deployment, release-candidate, local-production, dev-session, environment bootstrap, or unrelated repository helpers.
- Do not automate user-owned approval, merge authorization, release, deployment, or post-merge product decisions.
- Do not add broad repository automation or hooks without a demonstrated publication/lifecycle consumer.

## Key Boundaries
- Repository-local tooling owns publication mechanics; shared Agent workflows own intent/routing and must not duplicate those mechanics.
- Merge requires separate explicit user authority and must verify the exact repository, PR, base, head, and current readiness before mutation.
- Required checks, blocking reviews, mergeability, conflicting heads, authentication/capability failure, or stale state must stop rather than be bypassed.
- Direct push to the default branch is outside the ordinary delivery path.
- Task State and implementation delivery remain separate branches/workspaces.
- The tooling substrate must not silently become an application-runtime decision; any implementation dependency must be justified as repository tooling and available in the supported execution environment.
- Guard hooks may block bypasses only after an authorized maintained alternative exists.

## Value and Risk
The value is lower handoff friction, fewer repeated Git/GitHub mistakes, deterministic readiness/merge behavior, and a stable Agent-to-repository execution boundary. The main risks are overbuilding a general automation framework, inheriting Badminton-specific assumptions, or creating a blocking guard before the legal path works. The implementation should therefore be the smallest independently testable capability that closes the publication gap.

## Success Boundary
An authorized implementation actor can use one documented maintained repository path to publish an exact implementation branch as a PR and, only after separate merge authority, converge that exact PR to a verified merged state or a truthful blocker. Agents no longer need to invent direct publication/merge commands, and no application/runtime/deployment machinery is introduced as a side effect.
