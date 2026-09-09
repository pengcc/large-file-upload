# Issue #2 — Agent / Repository Publication Tooling Implementation Plan

Execution Status: completed / inactive
Terminal Delivery: PR #3 merged from head `f0bcecefbc27cedb5747d5f930df1e1be5e93264` as squash commit `ba9745cebd259bb607b03e9ae7b2c88ff2a0fcee` on 2026-09-09.

Baseline: `baseline.md`
Research: `repository-publication-research.md`
Applicable accepted Task Decisions: none separately persisted for this task.

## Accepted solution

Deliver one focused publication-capability pass that closes both sides of the current gap:

```txt
explicit Agent publication / merge intent
-> installed Agent workflow owner
-> maintained target-owned Node repository command
-> git / GitHub CLI mechanical effects and verification
```

Use direct Node `.mjs` repository tooling with no package manager and no third-party dependencies. Install only the two Agent workflows already advertised by the generic router (`open-or-update-pr` and `merge-pr`), the missing route references / handoff they require, two deterministic repository commands, and one narrow Codex publication-bypass hook.

Do not port Badminton's dirty-change recovery, application validation coupling, deployment/release tooling, worktree manager, or package scripts.

## Work items

### WI-1 — Close the currently broken Agent publication routes

Add the missing target-owned Agent workflow surface:

- `.codex/skills/core/open-or-update-pr/SKILL.md` + `metadata.yml`;
- `.codex/skills/core/merge-pr/SKILL.md` + `metadata.yml`;
- `.codex/skills/meta/agent-roles-and-capabilities/references/routes/open-or-update-pr.md`;
- `.codex/skills/meta/agent-roles-and-capabilities/references/routes/merge-pr.md`;
- `.codex/rules/references/publishable-change-handoff.md` when the maintained repository path is present.

Adapt the generic Badminton semantics rather than copying project-specific text verbatim:

- `open-or-update-pr` requires explicit push + PR authorization, owns only a clean committed feature branch -> exact push -> one PR -> verified result, and never stages/commits/merges/releases/deploys;
- `merge-pr` requires separate explicit authority for one exact repository/PR and delegates all mechanical readiness / expected-head / merge / verification logic to the repository command;
- neither skill references `pnpm`, Badminton Goal-mode/project-specific stage rules, dirty-change helpers, application validation commands, or Badminton runtime assumptions;
- use the existing Task State / execution-contract semantics only where already owned by current generic contracts; do not invent a second lifecycle carrier.

Update `AGENTS.md` narrowly to remove the bootstrap-era statement that the publication/handoff capability is unavailable and route publication/merge to the newly installed owners. Update `agent-operating-contract.md` only if an explicit existing reference must be repaired for the installed handoff; do not rewrite unrelated operating semantics.

### WI-2 — Implement the minimal target-owned repository publication kernel

Add a dependency-free Node repository-tooling surface under `.repo-tools/scripts/` with a single dispatcher exposing exactly:

```txt
node .repo-tools/scripts/repository-publication.mjs pr-open-or-update
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

Use small modules for stable ownership rather than one monolith. The implementation should contain only the necessary equivalents of:

- structured repository-tool error handling;
- subprocess command runner;
- Git client;
- GitHub CLI client;
- branch/default-branch safety;
- merge/readiness validation;
- PR open-or-update flow;
- exact-PR merge flow.

Return one stable machine-readable result on success (JSON is sufficient) containing the verified fields the Agent workflow needs. Error paths must exit non-zero with a stable error code/category plus a human-readable blocker; do not expose credentials.

Do not add `package.json`, a package lockfile, third-party Node dependencies, application source, or deployment/runtime configuration.

### WI-3 — Implement clean-branch PR open-or-update semantics

The `pr-open-or-update` command must:

1. verify repository root and `origin`;
2. verify `node`, `git`, and GitHub CLI capability without changing global tooling or credentials;
3. resolve the exact GitHub repository and default branch;
4. require a clean, attached, non-default feature branch;
5. fetch/read current remote-default truth and require `origin/<default>` to be an ancestor of the feature HEAD;
6. capture the exact local HEAD SHA before the push;
7. discover whether zero or one open PR exists for that exact head branch and stop on ambiguity;
8. push the captured existing commit to the exact same remote branch without force;
9. verify the remote branch head equals the captured SHA;
10. create one PR against the default branch when absent, or let the existing exact PR advance with the pushed branch when present;
11. verify the resulting PR's repository, base branch, head branch, state, and head SHA;
12. return created / updated / unchanged status, PR number/URL, base, branch, and verified head.

A new PR may use the latest commit subject as the default title and a minimal neutral body. PR metadata enrichment beyond what is required for review navigation is not part of this initial kernel.

The command must never stage, commit, create/switch branches, rebase, force-push, merge, or run application validation.

### WI-4 — Implement exact-PR merge semantics with ambiguous-effect convergence

The `pr-merge <PR>` command must:

1. require a concrete numeric PR target;
2. verify repository identity, GitHub CLI capability, and default branch;
3. read the current PR and required checks;
4. fail closed when the PR is not open, targets the wrong base, is draft, requests changes, is conflicting, has unknown merge readiness, or has failed/pending/unknown required checks;
5. capture the current PR head SHA;
6. re-read all mutable readiness immediately before mutation and require the same head SHA;
7. execute one squash merge guarded by the captured head (`--match-head-commit` or equivalent) while current repository settings still permit squash;
8. on a normal success, poll/read only far enough to verify the exact PR is remotely merged;
9. if the merge command returns an ambiguous transport/command failure, do **not** retry the merge automatically: re-read the exact PR once/poll within a bounded observation window and report `verified merged`, a concrete unmerged blocker, or `effect uncertain` truthfully;
10. return repository, PR, base, observed head, and verified merged state when convergence succeeds.

Do not require a local feature-branch checkout for merge, do not refresh/pull/reset local `main`, and do not perform Task State / Project Memory / Issue closeout.

If repository merge settings change before implementation and squash is no longer permitted, stop and return to planning rather than silently selecting another merge method.

### WI-5 — Add a narrow Codex publication-bypass guard after the legal path exists

Add:

- `.repo-tools/scripts/agent-hooks/codex-publication-policy.mjs` + focused tests;
- `.codex/hooks/pre-tool-use.mjs`;
- `.codex/hooks.json`.

The policy should only cover publication/merge bypasses:

- block direct `git push`;
- block direct `gh pr create` and `gh pr merge`;
- block compound shell commands containing those effects when safe classification is not possible;
- allow the maintained Node publication commands;
- when the hook itself fails, fail closed only for covered publication/merge calls and otherwise report the hook failure without turning it into a general Bash blocker.

Resolve the hook command from `git rev-parse --show-toplevel`; do not hardcode a checkout path.

Do not add a general destructive-command policy, worktree policy engine, or deployment guard in this issue.

### WI-6 — Preserve worktree isolation without machine-specific repository config

Do not add `.codex/config.toml` with an absolute external worktree path.

Execution must use an already established safe feature checkout/worktree. The repository publication command validates the current repository/branch but does not create external worktrees. If later evidence requires Codex itself to create/manage external worktrees, handle that as a separate capability with local/per-machine permission ownership.

### WI-7 — Update current target-owned capability truth without pre-implementing Issue #1

Update only the current owners that already exist when this delivery runs:

- `AGENTS.md` for the installed publication/merge routing and removal of the bootstrap-era unavailable-capability statement; and
- `.codex/project-memory/guideline.md` for the narrow current fact that target-owned Agent publication/merge workflows and direct-Node repository commands are installed, while application runtime/package-manager/validation/deployment choices remain unset.

Do **not** create the new Project Memory topics, project-specific guidance, collaboration README, or other context structure planned by Issue #1. After #2 is merged, Issue #1 will consume this new current tooling truth and perform its already-reviewed structural cleanup.

Do not rewrite historical Project Decisions merely because the previously missing publication capability now exists unless implementation discovers a true decision conflict.

## Validation design

### Environment preflight

Before implementation effects:

- verify `node` is available at a version suitable for ESM and the built-in test runner (target Node >= 20 for repository tooling);
- verify `git` and `gh` executables are available;
- perform a read-only GitHub capability check against `pengcc/large-file-upload` (for example repository identity lookup), but do not mutate credentials or global tool configuration when it fails.

A missing/incompatible required tool stops implementation and reports the project-local vs global boundary.

### Automated repository-tool tests

Use direct Node test commands with no package manager. Cover at minimum:

PR publication:
- dirty worktree blocked;
- detached/default branch blocked;
- stale branch missing current remote-default ancestry blocked;
- repository/GitHub capability failure blocked truthfully;
- ambiguous multiple PR target blocked;
- exact push uses no force and captured HEAD;
- remote-head mismatch blocked;
- create path returns verified PR identity/head;
- existing-PR path does not create a duplicate and returns verified current head;
- no staging/commit/branch creation occurs.

Merge:
- wrong/closed/draft/wrong-base PR blocked;
- `CHANGES_REQUESTED` blocked;
- conflicting/unknown readiness blocked;
- required checks pass / pending / fail / unknown handled correctly;
- head drift between readiness reads blocked;
- merge invocation uses the captured expected head and squash mode;
- successful merge is remotely verified;
- ambiguous merge-command failure converges by observation without a second merge mutation;
- unresolved observation reports uncertain effect rather than false success/failure;
- no local-default refresh occurs.

Hook:
- direct push blocked;
- direct PR create/merge blocked;
- compound covered publication blocked;
- maintained Node commands allowed;
- unrelated Bash allowed;
- hook-evaluation failure blocks only covered effects.

### Structural/readback validation

- verify every Agent router reference resolves to an installed file;
- verify both core skill metadata dependencies resolve;
- verify the publishable-change handoff refers to the installed direct Node command surface rather than `pnpm` or source-project helpers;
- verify `AGENTS.md` no longer claims the installed publication capability is absent;
- verify `.codex/project-memory/guideline.md` states the new repository-tooling capability without selecting an application runtime/toolchain;
- verify no Issue #1 context-structure files were created by this delivery;
- verify no `.codex/config.toml`, `package.json`, lockfile, application validation command, deployment/release tooling, dirty-change helper, or automated worktree manager was added;
- run `git diff --check` or equivalent whitespace validation.

Do not exercise a real push, PR creation, or merge merely as a test of the implementation branch. Unit/mock tests and read-only GitHub capability checks are the default validation boundary. The first real external publication should occur only through the separately authorized `open-or-update-pr` workflow after the implementation is approved and committed.

## Acceptance criteria

- The generic Agent router's existing publication and merge route keys resolve to installed target-owned workflows instead of missing files.
- An explicitly authorized Agent can publish a clean committed current feature branch through one maintained direct-Node command without staging/committing or creating duplicate PRs.
- A separately authorized exact PR can be merged through one maintained direct-Node command only after current mechanical readiness checks and expected-head protection, with truthful convergence on ambiguous effects.
- Direct Codex `git push` / `gh pr create` / `gh pr merge` bypasses are blocked after the maintained path is installed.
- No package manager, application runtime choice, app validation command, deployment/release tooling, machine-specific worktree root, or dirty-change recovery is introduced.
- Current `AGENTS.md` / Project Memory truthfully states the newly installed publication capability while keeping application toolchain choices open.

## Risks and rollback

Primary risks:

- accidentally importing Badminton's mature application/release assumptions;
- creating an Agent route that duplicates mechanical readiness logic instead of delegating it;
- reporting a failed merge command as definitely unmerged when the remote effect actually succeeded;
- blocking publication before a working legal path exists;
- turning Node repository tooling into an implied application-runtime choice.

Mitigations are the narrow module/command surface, no third-party dependencies, explicit ambiguous-effect observation, hook-last sequencing, and target-memory wording that identifies Node only as repository tooling.

Rollback is one focused implementation PR revert. The issue introduces no product data/schema/runtime migration. If the hook causes unexpected blocking, reverting/disabling the hook files restores the prior command surface while leaving no remote GitHub policy mutation behind.

## STOP conditions

Stop and return to planning/research if:

- Node >= 20, Git, or GitHub CLI is unavailable in the supported execution environment and satisfying it would require an unauthorized global-machine mutation;
- current Codex hook behavior or the existing Agent routing contract differs materially from the verified interfaces used by this plan;
- implementing `open-or-update-pr` or `merge-pr` requires application validation/package-manager/runtime selection;
- current repository merge settings no longer permit the planned squash method;
- a safe implementation appears to require worktree creation/management, machine-specific writable-root configuration, GitHub branch-protection mutation, deployment/release logic, or another external policy owner;
- existing repository evidence reveals a maintained publication owner already exists under another path, creating competing authority;
- Issue #1 or another accepted Task Decision changes the target ownership boundary materially.

## Review boundary

Review this as one Agent/repository-tooling capability: route/authorization semantics, deterministic publication/merge mechanics, focused tests, hook bypass guard, and truthful capability documentation. Do not review or request product upload architecture, application scaffolding, CI, deployment, server-side branch protection, or Issue #1's broader Project Memory restructuring as part of this delivery.
