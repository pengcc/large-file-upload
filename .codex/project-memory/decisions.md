# Project Decisions

## D-001 Keep application technology choices open during bootstrap

**Context:** The repository is being initialized for a >10 GB large-file-upload product, but the workflow/bootstrap experiment is not an application-architecture decision.

**Decision:** Do not select an application framework, runtime, package manager, persistence layer, object-storage provider, deployment platform, or hosting topology during workflow bootstrap. Target-specific architecture research owns those choices.

**Reason:** The source project is reusable engineering evidence, not the target product architecture. Premature stack selection would turn bootstrap reuse into inherited product design.

**Impact:** Architecture research must compare credible target-specific options using the product blueprint, current repository truth, and authoritative external evidence before such choices become accepted project facts.

## D-002 Adopt shared workflow semantics without source-project runtime dependency

**Context:** This project uses selected reusable Agent/project workflow semantics proven in another repository.

**Decision:** Materialize only the selected shared workflow/rule/skill files into this repository at an exact source revision while keeping `large-file-upload` responsible for its own Project Memory, product blueprint, technology choices, project-specific capabilities, product code, scripts, runtime, deployment, and operations.

**Reason:** Reuse should reduce workflow setup cost without coupling this product to another repository's domain, runtime, tooling, or operating assumptions.

**Impact:** Do not copy source-project Project Memory, product/domain code, `.codex/project-specific/**`, CMS capability, Mongo/dev-session/local-production/deployment/backup tooling, or other source-project machinery unless a later target-owned decision and real consumer justify a specific capability.

## D-003 Validation remains target-owned and currently unset

**Context:** Some adopted shared workflow text contains example or source-era application validation/publication commands, while this repository currently has no selected package manager or application toolchain.

**Decision:** No application validation command or package-manager command is current project truth yet. In particular, do not infer that `pnpm validate`, persistence-test commands, or source-project publication helpers apply here merely because adopted shared workflow text mentions them.

**Reason:** Validation and publication mechanics must be owned by the actual target toolchain and repository once those capabilities exist.

**Impact:** Bootstrap-only changes use structural Git/readback validation. Before product implementation, architecture/toolchain work must establish target-owned validation commands and update Project Memory if they become durable facts. Missing publication/PR helper capability must degrade or stop truthfully rather than emit a source-project command.
