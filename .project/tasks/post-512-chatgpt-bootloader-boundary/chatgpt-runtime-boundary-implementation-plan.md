# Post-#512 ChatGPT Bootloader and Runtime Boundary Implementation Plan

Execution Status: approved / active

Baseline: `baseline.md`
Applicable accepted Task Decisions: `task-decisions.md` (TD-01 through TD-04)
Planning repository baseline: `main@37d6f8f2e738e4d59e27a266d5dbaeff0984ff5d`

## Current evidence

- Current `main:.codex/chatgpt/project-instructions.md` remains `Project Instructions Version: 1` and already owns the configured/repository version check, `Project refresh required` mismatch behavior, routing through current `main:AGENTS.md`, current-repository truth boundary, no-static-authority rule, and missing-capability fallback/STOP behavior.
- Current `main:AGENTS.md` already routes ordinary work, Project Memory, Task Alignment, Implementation Review, publication/merge, and target-specific guidance through repository-owned owners. No additional pre-routing owner is currently demonstrated.
- Canonical Task State semantics already support actor-local branch-aware access, including connector-backed branch mutation with exact branch/workspace and remote-predecessor safeguards. No ChatGPT-specific Task State owner is required.
- `.codex/skills/core/implementation-review/SKILL.md` currently describes itself as a `Codex adapter` and says it retains `Codex context loading`, while its canonical contract, route record, and metadata are already actor-neutral. The same skill already contains the bounded GitHub actionable-result effect with exact PR/head verification, one top-level actionable comment, readback, clean-path no-publication behavior, truthful degradation, and no automatic retry of uncertain comment effects.
- `.codex/skills/core/implementation-review/metadata.yml` and the implementation-review route contain no Codex-only transport requirement.
- Repository publication/merge are already owned by `open-or-update-pr`, `merge-pr`, and `.repo-tools/scripts/repository-publication.mjs`; this task does not alter those authority or mechanical owners.
- No application package manager, application runtime, or root application validation command exists. Repository-only validation therefore uses the installed direct-Node repository-tool tests plus structural/readback checks.

## Recommendation and accepted solution

Use one focused repository-tooling documentation pass that keeps the existing Implementation Review owner and removes only the actor-excluding Codex framing that prevents it from being the normal shared owner for ChatGPT as well as Codex.

Modify only `.codex/skills/core/implementation-review/SKILL.md` unless verified current-main drift makes one of the explicit STOP conditions apply. Reframe the workflow as the repository-owned runtime-neutral adapter/owner of environment-local review mechanics while leaving all semantic authority with the canonical Project Collaboration Implementation Review contract. Keep the existing GitHub actionable-result behavior inside this owner, expressed as a capability- and authority-bounded actor/runtime effect rather than as a reason to create a separate ChatGPT adapter.

Do not create `.codex/chatgpt` runtime/transport files, a registry, dispatcher, synchronization layer, static fallback, or another semantic owner. Do not change the v1 bootloader merely to restate repository-owned evolution behind `AGENTS.md`.

### Reviewability decision

This is one focused execution pass: it has one coherent outcome, one expected implementation file, one compatible repository-only validation loop, and one review boundary. Fresh-conversation acceptance is merge-dependent runtime evidence and is therefore a later acceptance pass, not a second implementation work item or a reason to manufacture another PR.

## Implementation work

### 1. Make the existing Implementation Review workflow actor/runtime-neutral

In `.codex/skills/core/implementation-review/SKILL.md`:

- replace the top-level `Codex adapter` / `Codex context loading` framing with runtime-neutral ownership language;
- preserve the canonical Implementation Review contract as the sole owner of review inputs, evaluation, finding meaning, actionable versus clean behavior, remediation semantics, and withheld/provisional conclusions;
- preserve the existing route owner, Project Memory gate, Task State navigation rules, exact-target discipline, bounded supporting lenses, report behavior, and STOP conditions;
- do not generalize this task into removal of every Codex-specific mechanic elsewhere in the repository. Other workflow/runtime wording remains out of scope unless it directly prevents this exact Implementation Review normal path and current evidence proves that gap.

### 2. Keep GitHub actionable-result publication as a bounded existing-owner effect

In the same skill:

- describe actionable-result publication as an actor/runtime-specific external effect served by the current environment's available connected GitHub comment capability when authority and capability exist;
- keep repository identity, numeric PR, current reviewed head, and authentication/capability verification immediately before publication;
- keep one top-level PR Conversation comment containing only actionable findings and the exact reviewed head;
- keep stable-result readback and the minimum remediation handoff;
- keep the clean path free of positive comments, markers, or remediation handoffs;
- keep approval/request-changes, thread resolution, fixes, branch/PR metadata mutation, merge, release, and deployment outside this transport authority;
- keep truthful chat-only degradation when publication capability, identity, authentication, or authority is unavailable, and never auto-retry an uncertain comment mutation;
- state or preserve the boundary that ChatGPT actor identity alone does not require a separate repository adapter. If a later real runtime gap prevents this existing owner from serving ChatGPT safely, that evidence returns to planning instead of causing an adapter to be invented during execution.

### 3. Preserve all no-change owners

Do not modify as part of this pass:

- `.codex/chatgpt/project-instructions.md` or `Project Instructions Version: 1`;
- `AGENTS.md`;
- `.codex/project-collaboration/contracts/implementation-review.md`;
- `.codex/skills/core/implementation-review/metadata.yml`;
- `.codex/skills/meta/agent-roles-and-capabilities/references/routes/implementation-review.md`;
- Task Alignment, Task State persistence, planning, execution, publication, or merge semantics;
- `.repo-tools/**` or Codex publication hooks;
- Project Memory, unless implementation discovers a genuinely new durable current-project fact not already represented by the existing workflow owner. Wording-only actor-neutralization is not by itself a Project Memory admission reason;
- application architecture, package manager/runtime, validation, deployment, storage, persistence, checksum, dedupe, or upload behavior.

No configured ChatGPT Project Resource File mutation is part of repository implementation. The accepted permanent surface remains Project Instructions only; actual configured Resource File inventory must be observed from the configured Project/runtime when acceptance can do so honestly, not inferred from repository files.

## Validation

Use only the current repository-owned repository/context validation boundary.

### Repository-tool regression

Run the installed direct-Node repository-tool tests:

```bash
node --test .repo-tools/scripts/*.test.mjs .repo-tools/scripts/agent-hooks/*.test.mjs
```

These are regression guards for the installed repository publication/hook capability; they do not prove Implementation Review semantics by themselves.

### Structural and semantic validation

- run `git diff --check`;
- verify the implementation diff is confined to `.codex/skills/core/implementation-review/SKILL.md`;
- read back the complete changed skill and confirm it no longer defines the whole workflow as a Codex-only adapter or depends on `Codex context loading` for its semantic contract;
- confirm the canonical contract still owns all semantic review behavior and was not modified;
- confirm the actionable GitHub path still verifies exact repository/PR/head and capability/authority, publishes at most one actionable top-level comment, reads back a stable identifier, emits no clean marker, and degrades truthfully when unavailable;
- confirm no new `.codex/chatgpt/**` adapter/transport file, registry, dispatcher, fallback, or synchronization mechanism was added;
- confirm `.codex/chatgpt/project-instructions.md` is unchanged and still declares `Project Instructions Version: 1`;
- confirm `AGENTS.md`, Task State mechanics, Implementation Review metadata/route, publication/merge workflows, `.repo-tools/**`, Project Memory, and application/runtime areas are unchanged;
- search the changed text for any new dependency on Badminton or another product repository as current Large File Upload truth;
- inspect the final diff for accidental weakening of publication authority, clean-path behavior, exact-target freshness, withheld/provisional behavior, or STOP conditions.

Do not run or invent `pnpm validate`, application builds, application tests, deployment checks, or another absent application command.

## Acceptance criteria for the repository delivery

- `implementation-review` remains one existing repository owner rather than being split into Codex and ChatGPT semantic owners.
- A ChatGPT actor can consume the same Implementation Review owner without the skill declaring the workflow itself Codex-only.
- Canonical review semantics remain unchanged and clearly subordinate/authoritative relative to environment-specific mechanics.
- Exact-PR actionable publication remains a narrowly bounded actor/runtime effect with exact-target recheck and stable readback.
- Clean review still creates no GitHub marker or remediation handoff.
- Missing or unauthorized GitHub publication capability produces a truthful chat result / transport limitation rather than an invented fallback.
- No ChatGPT-specific adapter, static configured copy, registry, dispatcher, synchronization layer, version bump, or source-project dependency is introduced.
- `Project Instructions Version: 1` and the stable `AGENTS.md` entrypoint remain unchanged.
- Existing Task State, publication/merge, Project Memory, product architecture, and application/toolchain ownership boundaries remain intact.

## Post-merge fresh-conversation acceptance boundary

Fresh-conversation acceptance consumes the merged `main`; it is not valid evidence against an unmerged implementation branch.

After verified merge, perform a fresh configured-Project acceptance pass using representative real Large File Upload scenarios:

1. **Normal routing:** matching configured/repository v1 reaches current `main:AGENTS.md` and current repository owners.
2. **Ordinary repository truth:** a real repository/tooling question reaches current target-owned Project Memory without static Project Resource Files or Badminton substitution.
3. **Exact-PR Implementation Review:** a real exact PR resolves current authority and target through existing owners. On a clean review, verify no positive GitHub marker is published. If genuine actionable findings exist, verify the bounded connected-GitHub publication path and stable readback; do not manufacture a finding.
4. **Unsupported capability:** a real unavailable/unsupported request follows the current fallback, provisional, or STOP path rather than inventing an equivalent capability.
5. **Task State:** when a genuine later task warrants persisted state, use only the existing connector-capable Task State owner; do not create a dummy Task Workspace merely for acceptance.
6. **Configured surface:** when the configured Project/runtime can actually expose Resource File inventory, verify the permanent target surface is Project Instructions only. If inventory cannot be observed, report that exact acceptance conclusion as unverified rather than inferring it from repository state.
7. **Negative controls:** do not manufacture a version mismatch, connector failure, fake workflow change, destructive failure, or meaningless repository mutation.

The later genuine repository-only self-hosting proof remains explicitly pending until a naturally occurring routing/semantic change behind the stable v1 entrypoint is consumed by a fresh conversation without configured-Project refresh.

## Risks and rollback

The main risk is over-correcting Codex-specific wording and accidentally weakening real review, authority, exact-target, or publication safeguards. Limit the change to ownership/runtime framing plus the existing actionable-result transport boundary; preserve the canonical contract and all safety semantics verbatim by meaning.

A second risk is broad actor-neutralization scope creep. This task does not justify rewriting every shared skill, Codex hook, publication command, route, or repository tool simply because another actor exists.

The repository change is documentation/workflow-semantics only. Rollback is a normal revert of the focused implementation commit/PR. No application data, runtime migration, configured Project version migration, or deployment rollback is required.

## STOP conditions

Stop execution and return to the planning/alignment owner instead of improvising if:

- current `main` changes materially invalidate the accepted Baseline, TD-01 through TD-04, or the one-file ownership model used by this plan;
- the required result would change `.codex/chatgpt/project-instructions.md`, `Project Instructions Version`, the permanent configured Project bootstrap contract, or another pre-`AGENTS.md` authority;
- a separate `.codex/chatgpt` runtime/transport adapter or another standing owner appears necessary to make ChatGPT review work safely;
- actor-neutralization would require changing canonical Implementation Review semantics rather than only environment-local mechanics;
- implementation would need to modify Task State semantics, publication/merge authority, `.repo-tools/**`, Codex publication hooks, Project Memory ownership, or application/runtime/toolchain behavior;
- the current ChatGPT/GitHub runtime exposes a material transport limitation that the existing owner cannot represent through its current truthful degradation path;
- required repository-tool validation cannot be executed because the maintained Node repository-tool runtime is unavailable or broken; do not install or mutate global tooling without separate authority;
- configured Project Resource File cleanup or another external configured-Project mutation is required but the inventory or mutation authority cannot be established safely.

A STOP triggered by a demonstrated ChatGPT transport gap is evidence for reconsidering the conditional narrow-binding option in TD-02; it is not authority to create that binding inside this execution pass.

## Review and delivery boundary

Implementation Review should review one focused repository delivery whose intended implementation diff is limited to `.codex/skills/core/implementation-review/SKILL.md`. The review must verify the accepted Task Baseline and TD-01 through TD-04, not just wording quality.

Task State files remain on `task/post-512-chatgpt-bootloader-boundary` and are not implementation files or part of the implementation PR. The implementation pass must use a separate implementation branch based on freshly verified current `main` according to the existing execution owner.

Publication of a review-ready PR, merge, configured-Project mutation, post-merge fresh-conversation acceptance, and closeout each retain their existing separate authority/effect boundaries. This plan does not change implementation-to-review-ready-PR authority semantics.

## Project Memory impact

Project Memory update needed: no, based on current evidence.

Reason: the change makes an existing workflow owner actor/runtime-neutral without changing the repository's durable product, architecture, publication/merge, validation, or runtime capability facts. If execution uncovers a genuinely new durable tooling fact, route it through `update-project-memory` rather than silently adding it in this pass.

## Plan Review conclusion

Ready for approval.

The plan preserves the accepted Baseline and TD-01 through TD-04, uses the smallest demonstrated solution, keeps one focused implementation/review boundary, leaves merge-dependent fresh-conversation acceptance to the correct later truth event, and introduces no unsupported adapter or version/configuration churn. No blocking planning question remains.
