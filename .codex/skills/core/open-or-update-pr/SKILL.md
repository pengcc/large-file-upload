# Open or Update Pull Request

Use this workflow only when the user explicitly authorizes pushing the current clean committed feature branch and creating or updating its pull request.

## Boundary

This workflow owns:

```txt
clean committed feature branch
-> maintained repository publication command
-> exact non-force push
-> create or reuse one PR for that branch
-> verified remote branch/PR head
```

It never stages files, creates commits, creates or switches branches, rebases, force-pushes, merges, releases, deploys, changes credentials, or repairs global tooling. Merge belongs to `merge-pr` and requires separate explicit authority.

## Required context

Before publication:

1. Pass the Project Memory Context Gate.
2. Resolve the exact repository and current feature branch.
3. Confirm the user's current instruction authorizes push plus PR create/update for this delivery.
4. Preserve the approved implementation's actual validation evidence; this workflow does not invent or rerun application validation.

Do not infer PR authorization from implementation approval alone unless the same user instruction explicitly asked for a review-ready PR.

## Canonical execution

Invoke exactly once:

```bash
node .repo-tools/scripts/repository-publication.mjs pr-open-or-update
```

The repository command owns repository/origin identity, clean attached feature-branch checks, current remote-default ancestry, exact captured HEAD, non-force push, duplicate-PR prevention, remote-head verification, and final PR identity/head verification.

Consume its JSON result rather than duplicating those mechanical checks in Agent reasoning.

## Stop conditions

Stop on the command's blocker when the worktree is dirty, the branch is detached/default/stale, Git/GitHub capability is unavailable, repository identity is inconsistent, more than one open PR matches the branch, branch/HEAD context drifts, push fails, or remote/PR head verification fails. Do not bypass the maintained command with direct `git push` or `gh pr create`.

## Output

Report created / updated / unchanged, repository, PR number/URL, base branch, head branch, verified head SHA, the execution validation evidence already available, and recommend `implementation-review` next.
