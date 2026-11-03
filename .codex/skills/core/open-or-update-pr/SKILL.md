# Open or Update Pull Request

Use this workflow only when current authority permits publication of the exact completed delivery as one pull request.

Valid publication authority may come from:

- an explicit current user instruction to push/publish the exact delivery; or
- a recognized user request to execute ordinary implementation or same-delivery remediation, whose normal delivery outcome includes one review-ready PR unless the user explicitly chose `keep local`, `no push`, `no PR`, or an equivalent local-only constraint.

Direct bounded delivery, arbitrary file-producing work, plan approval, a commit request, generic readiness, and a publishable-change handoff do not independently authorize this workflow.

## Boundary

This workflow owns:

```txt
one exact completed feature-branch delivery
-> verify publication authority and repository/branch identity
-> select one supported runtime transport
-> create or reuse one PR for that branch
-> verify the exact remote branch/PR head
```

It never stages files, creates implementation commits, creates or switches implementation branches, rebases, force-pushes, implements fixes, merges, releases, deploys, changes credentials, repairs global tooling, or translates an inaccessible local-only commit into a remote delivery. Merge belongs to `merge-pr` and requires separate explicit authority.

## Required context

Before publication:

1. Pass the Project Memory Context Gate.
2. Resolve the exact repository, base branch, feature branch, and completed delivery head.
3. Confirm that current authority permits one PR create/update for this delivery and that no local-only constraint overrides it.
4. Preserve the approved implementation's actual validation evidence; this workflow does not invent or upgrade application validation.
5. Resolve whether the active runtime can use the maintained local-checkout transport or only the bounded connected-GitHub fallback.

## Transport selection

### A. Maintained local-checkout transport

When the active runtime has the compatible clean attached feature-branch checkout required by the repository command, invoke exactly once:

```bash
node .repo-tools/scripts/repository-publication.mjs pr-open-or-update
```

The repository command owns repository/origin identity, clean attached feature-branch checks, current remote-default ancestry, exact captured `HEAD`, non-force push, duplicate-PR prevention, remote-head verification, and final PR identity/head verification. Consume its JSON result rather than duplicating those mechanical checks in Agent reasoning.

### B. Connected GitHub fallback

Use this fallback only when the maintained local-checkout command cannot be executed by the active actor/runtime, connected GitHub mutation capability is available, and the completed delivery already exists on one exact remote feature branch. Actor identity alone does not select this path; the observed runtime capability and delivery location do.

The fallback must preserve the same publication contract:

1. verify the exact repository identity and default branch;
2. verify the exact remote feature branch exists, is not the default branch, and capture its current head SHA;
3. verify the captured feature-branch head contains the current remote default-branch truth;
4. verify the captured head is the completed delivery being published rather than an unrelated or stale branch state;
5. query existing open PRs for that exact head branch and stop if more than one candidate makes the target ambiguous;
6. reuse/update the one matching PR when it exists, otherwise create exactly one PR from the exact feature branch to the verified default branch;
7. do not force-update, synthesize, recreate, or otherwise mutate implementation commits as part of publication;
8. read back the resulting PR and remote feature branch; and
9. require the final PR head and remote branch head to equal the captured delivery head before reporting publication as verified.

When the delivery exists only as an inaccessible local/unpushed commit, this fallback is unavailable. Report that the remote feature branch does not contain the completed delivery and stop rather than manufacturing a connector-side equivalent commit.

## Stop conditions

Stop when any required publication fact or effect cannot be established safely, including when:

- no valid PR-publication authority exists or the user selected local-only completion;
- the local transport is selected but the worktree is dirty, detached, on the default branch, stale, or otherwise rejected by the maintained command;
- the connector fallback is selected but the exact completed delivery is not already present on one verified remote feature branch;
- the feature branch does not contain current remote-default truth;
- repository identity, Git/GitHub capability, authentication, base/head identity, or current PR state cannot be verified;
- more than one open PR matches the branch;
- branch/head context changes during publication;
- a push or PR mutation has an uncertain result that cannot be read back safely; or
- final remote/PR head verification does not match the captured delivery head.

Do not bypass a blocker by force-pushing, changing commits, creating a second PR, retrying an uncertain mutation automatically, using a different repository/branch, or treating another project's publication helper as current truth.

## Output

Report:

- transport used: maintained local command | connected GitHub fallback;
- created / updated / unchanged;
- repository;
- PR number/URL;
- base branch;
- head branch;
- verified head SHA;
- the execution validation evidence already available; and
- `Next workflow: Implementation Review` after a PR is created or updated.

When publication stops, report the exact missing authority/capability/state and do not invent a PR identifier or claim review readiness.
