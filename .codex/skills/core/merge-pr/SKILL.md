# Merge Pull Request

Use this workflow only when the user explicitly authorizes immediate merge for one exact pull request.

## Boundary

This workflow owns only:

```txt
exact repository/PR + explicit merge authority
-> maintained deterministic merge command
-> current readiness + expected-head guard
-> one squash-merge attempt
-> bounded remote effect verification
```

It never implements fixes, commits, pushes implementation changes, creates PRs, mutates Task State or Project Memory, refreshes local branches, releases, or deploys.

## Required context

1. Pass the Project Memory Context Gate.
2. Resolve one exact repository and numeric PR target from the user's request.
3. Confirm explicit immediate-merge authority for that PR.

Do not infer merge authority from plan approval, implementation completion, PR creation, review approval, or a request that explicitly stops before merge.

## Canonical execution

Invoke exactly once:

```bash
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

The repository command owns GitHub capability and repository identity, squash-method availability, current PR/base/head state, draft/review/mergeability blockers, required checks, a final mutable-readiness reread, expected-head guarded merge, and bounded remote result verification.

Do not precompute a competing Agent readiness verdict or fall back to direct `gh pr merge`.

## Ambiguous effects

If the merge command fails after a potentially ambiguous transport failure, the command observes the exact PR without issuing a second merge mutation. Report `verified merged`, a concrete rejection, or `MERGE_EFFECT_UNCERTAIN` exactly as returned. Never automatically retry an uncertain merge effect.

## Output

Report the verified merge result or blocker. On verified merge, return repository, PR, base branch, observed head SHA, and merged state to the applicable closeout owner without performing closeout here.
