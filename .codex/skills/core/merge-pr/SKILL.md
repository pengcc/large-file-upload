# Merge Pull Request

Use this workflow only when the user explicitly authorizes immediate merge for one exact pull request.

## Boundary

This workflow owns only:

```txt
exact repository/PR + explicit merge authority
-> verify current PR/base/head/readiness
-> select one supported runtime transport
-> one expected-head squash-merge attempt
-> bounded remote effect verification
```

It never implements fixes, commits, pushes implementation changes, creates PRs, mutates Task State or Project Memory, refreshes local branches, releases, or deploys.

## Required context

1. Pass the Project Memory Context Gate.
2. Resolve one exact repository and numeric PR target from the user's request.
3. Confirm explicit immediate-merge authority for that PR.
4. Resolve whether the active runtime can use the maintained local-checkout transport or only the bounded connected-GitHub fallback.

Do not infer merge authority from plan approval, implementation completion, PR creation, review approval, or a request that explicitly stops before merge.

## Transport selection

### A. Maintained local-checkout transport

When the active runtime has the compatible repository checkout required by the maintained command, invoke exactly once:

```bash
node .repo-tools/scripts/repository-publication.mjs pr-merge <PR>
```

The repository command owns GitHub capability and repository identity, squash-method availability, current PR/base/head state, draft/review/mergeability blockers, required checks, a final mutable-readiness reread, expected-head guarded merge, and bounded remote result verification. Consume its result rather than duplicating those mechanical checks in Agent reasoning.

### B. Connected GitHub fallback

Use this fallback only when the maintained local-checkout command cannot be executed by the active actor/runtime and connected GitHub merge capability is available. Actor identity alone does not select this path.

The fallback must preserve the same merge contract:

1. verify the exact repository identity and numeric PR;
2. read the current PR and require it to be open and non-draft;
3. capture the exact current base branch, head branch, and head SHA;
4. verify current mergeability/readiness evidence available through GitHub, including review/check blockers when they apply; stop when a material readiness requirement cannot be established safely;
5. issue exactly one squash-merge attempt guarded by the captured expected head SHA;
6. do not change the PR head, branch, metadata, reviews, checks, or repository settings to make merge succeed;
7. read back the exact PR after the merge attempt; and
8. report verified merged only when the PR is observed merged at the expected head. Report a concrete rejection when GitHub rejects the merge. If a transport/result ambiguity cannot be resolved by readback, report `MERGE_EFFECT_UNCERTAIN`.

Do not retry an uncertain merge mutation automatically. Do not substitute a different merge method, bypass branch protection, dismiss reviews, or weaken checks.

## Stop conditions

Stop before the merge mutation when:

- explicit immediate-merge authority for the exact PR is absent;
- repository or PR identity is ambiguous;
- the PR is closed, already merged, or draft in a way that does not match the requested effect;
- the current head cannot be captured and verified;
- required review/check/mergeability readiness is blocked or materially unverifiable;
- the selected transport lacks the required merge capability; or
- target identity changes before the mutation.

## Ambiguous effects

For either transport, an uncertain result must be resolved only through bounded readback of the exact PR. Never automatically issue a second merge mutation. Report `verified merged`, a concrete rejection, or `MERGE_EFFECT_UNCERTAIN` according to the observed result.

## Output

Report:

- transport used: maintained local command | connected GitHub fallback;
- repository;
- PR number;
- base branch;
- observed head SHA;
- merged state; and
- merge commit SHA when verified.

On verified merge, return the result to the applicable closeout owner without performing closeout here.
