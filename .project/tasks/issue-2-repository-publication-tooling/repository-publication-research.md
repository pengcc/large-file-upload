# Issue #2 — Bounded Agent / Repository Publication Tooling Research

## Research question

Determine the smallest target-owned Agent + repository publication capability that closes the current `large-file-upload` delivery gap without importing Badminton's product/runtime tooling or preselecting the future application toolchain.

## Verified target state

- `large-file-upload` has no `.repo-tools`, package manifest, application validation command, publication helper, deployment workflow, or product runtime.
- `AGENTS.md` explicitly treats source-era publication commands as unavailable and says the missing publishable-change handoff must stop truthfully rather than invent a substitute.
- The installed `agent-roles-and-capabilities` router already advertises `open-or-update-pr` and `merge-pr` routes, but their referenced route files are absent.
- The corresponding core `open-or-update-pr` and `merge-pr` skills are also absent, and `.codex/rules/references/publishable-change-handoff.md` is absent.
- Therefore the current Agent publication route is intentionally incomplete at bootstrap and would fail the repository's Explicit Target Reference Guardrail if selected now.
- The repository default branch is `main`; GitHub currently allows merge, squash, and rebase merge and does not currently protect `main`.

## Badminton evidence: reusable vs project-specific

Badminton's current publication surface contains a useful generic core but also substantial project-specific machinery.

### Reusable engineering evidence

Keep/adapt these semantics:

- separate Agent workflows for `open-or-update-pr` and `merge-pr` with separate explicit authorization boundaries;
- clean committed feature-branch publication only for the Agent path;
- block default-branch publication and stale/wrong branch context;
- verify repository identity, default branch, GitHub capability/authentication, exact branch, local head, remote head, and PR head;
- create at most one open PR for the exact feature branch and re-use/update it rather than creating duplicates;
- merge only one exact PR after re-reading mutable readiness;
- verify PR is open, targets the expected default branch, is not draft, has no `CHANGES_REQUESTED`, is not conflicting/unknown, and has no failed/pending required checks;
- use operation-local expected-head protection for merge (`--match-head-commit` or equivalent);
- verify the remote PR reaches a merged state after the merge effect;
- keep local default-branch refresh outside merge;
- use a Codex PreToolUse hook to block direct `git push`, `gh pr create`, `gh pr merge`, and compound publication commands only after the maintained path exists;
- treat GitHub CLI/network/credential-capability failure as a blocker/uncertain capability context, not as authority to rewrite credentials or machine configuration.

### Do not port

Do not copy these Badminton-specific or unnecessary parts into the initial target capability:

- `change:pr` / `change:merge` dirty-worktree and dirty-default recovery;
- automatic staging, commit creation, or recovery branch creation;
- application-path classification such as `apps/web/` vs repository-only roots;
- `pnpm validate`, `test:repo-tools`, persistence-test selection, or other application validation coupling;
- deployment/release/local-production/dev-session/environment bootstrap machinery;
- automatic local-default refresh;
- Badminton-specific Issue/stage projection or product workflow rules.

## Tooling substrate conclusion

Use Node `.mjs` as a **repository-tooling runtime only**, not as an application-runtime decision.

Why this is the smallest credible substrate:

- the maintained Codex hook path itself can use the same runtime;
- Badminton's proven generic publication logic is already expressed as dependency-light `.mjs` modules using Node built-ins plus `git`/`gh` subprocesses;
- Node's built-in test runner permits direct tests without adding a package manager or third-party dependencies;
- a shell-only port would save the Node runtime declaration but increase parsing, JSON/error-handling, and test complexity and would need another helper such as `jq` or brittle shell parsing.

Initial target commands should therefore be direct repository commands, for example:

```txt
node .repo-tools/scripts/repository-publication.mjs pr-open-or-update
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

Do not add `package.json` merely to alias these commands. If the future application later adopts a package manager, ergonomic aliases may be added then without changing the owner.

Before implementation, verify `node`, `git`, and `gh` are available in the actual supported execution environment. Missing/incompatible tooling is a STOP condition; do not mutate global tooling or credentials to make the path work.

## Minimum Agent-side capability

Close the already-advertised route instead of inventing a second routing system:

- add/adapt `.codex/skills/core/open-or-update-pr/`;
- add/adapt `.codex/skills/core/merge-pr/`;
- add their missing canonical route references under `agent-roles-and-capabilities/references/routes/`;
- add the publishable-change handoff reference once the maintained repo path exists;
- update `AGENTS.md` / the operating contract only as narrowly needed to remove the bootstrap-era "publication unavailable" state and route to the installed owners.

The Agent workflow owns authorization, routing, Task Context/handoff semantics, and result presentation. It must not duplicate mechanical readiness logic that the repository command owns.

## Minimum repository-side capability

A small Node implementation should contain only the reusable boundaries needed by the two commands, approximately:

```txt
.repo-tools/
  scripts/
    repository-publication.mjs
    shared/
      repository-tool-error.mjs
      command-runner.mjs
    repository-publication/
      git-client.mjs
      gh-client.mjs
      branch-safety.mjs
      validation.mjs
      pr-open-or-update-flow.mjs
      merge-pr-flow.mjs
      *.test.mjs
    agent-hooks/
      codex-publication-policy.mjs
      codex-publication-policy.test.mjs

.codex/
  hooks.json
  hooks/pre-tool-use.mjs
```

Exact filenames may be narrowed during planning, but the ownership split should remain: clients/adapters, branch/readiness rules, two flows, and hook policy.

## PR-open/update behavior boundary

The initial Agent publication command should:

1. resolve repo root/origin/default branch and verify `gh` capability;
2. require a clean non-default non-detached feature branch;
3. require the branch to contain current `origin/main` (otherwise return to execution freshness handling);
4. capture the exact local HEAD SHA;
5. push only that existing committed HEAD to the exact same remote feature branch;
6. verify the remote branch head equals the captured SHA;
7. find the exact open PR for that head branch;
8. create one when absent or preserve/update the one existing PR when present;
9. verify repository/base/head branch/head SHA and return the exact PR URL/action.

It must not stage, commit, merge, rebase, force-push, or run application validation.

## Merge behavior boundary

The initial merge command should:

1. require an exact PR number from the authorized Agent workflow;
2. resolve and verify repository identity and default branch;
3. read the current PR and required checks;
4. fail closed on closed/draft/wrong-base/conflicting/unknown/changes-requested/failed-or-pending-required-check states;
5. re-read mutable readiness immediately before merge;
6. execute one squash merge with the current PR head SHA as the operation-local expected-head guard while squash remains allowed by current repository settings;
7. poll/read back only far enough to verify the PR is remotely merged;
8. return verified repository, PR, base, observed head, and merged state without refreshing local branches or performing semantic closeout.

If repository merge policy changes before implementation, planning must re-evaluate the merge-method choice rather than assuming squash remains valid.

## Worktree / Codex configuration conclusion

Do **not** commit a machine-specific external worktree root in `.codex/config.toml` in the initial pass.

Current Codex workspace-write semantics add the current workspace plus configured `writable_roots`; the configured writable roots are absolute paths. A committed `/Users/.../large-file-upload-worktrees/` path would therefore make public repository configuration machine-specific.

Issue #2 should instead require the implementation actor to operate inside an already established safe feature worktree/checkout. It should not create external worktrees. If future workflow evidence shows that Codex itself must create/manage external worktrees, establish a separate local-permission/worktree capability and choose the appropriate per-machine configuration then.

## Hook conclusion

Adopt the narrow Badminton policy shape after the maintained commands exist:

- block direct `git push`;
- block direct `gh pr create` and `gh pr merge`;
- block compound shell commands containing publication/merge effects when they cannot be classified safely;
- allow the maintained Node publication commands;
- fail closed only for covered publication/merge calls when the hook itself cannot evaluate them.

Do not use the hook as a general shell policy engine.

## GitHub server-policy follow-up

`main` is currently unprotected. Server-side PR-only protection/rulesets would strengthen the same boundary beyond Codex hooks, but changing repository settings is a separate external effect and is not required to bootstrap the maintained publication owner. Evaluate it after the first maintained PR path is working; do not silently bundle it into this implementation.

## Research conclusion

The smallest coherent target is **not** a port of Badminton `.repo-tools`. It is a two-command repository publication kernel plus the matching two Agent workflows and a narrow Codex bypass guard.

This closes the current latent route gap while intentionally excluding dirty-change recovery, package/application validation, deployment/release tooling, automated worktree management, and server-policy mutation.

No further architecture-blocking research is required before implementation planning, provided the plan retains environment preflight for `node`, `git`, and `gh` and the STOP conditions above.
