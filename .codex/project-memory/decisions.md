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

**Context:** Some adopted shared workflow text contains example or source-era application validation/publication commands, while this repository currently has no selected package manager or application toolchain. Target-owned repository publication/merge commands now exist separately from the application toolchain.

**Decision:** No application validation command or package-manager command is current project truth yet. In particular, do not infer that `pnpm validate`, persistence-test commands, or source-project publication helpers apply here merely because adopted shared workflow text mentions them.

**Reason:** Validation and publication mechanics must be owned by the actual target toolchain and repository once those capabilities exist.

**Impact:** Repository/context changes use structural Git/readback checks and the installed repository-tool tests as applicable. Before product implementation, architecture/toolchain work must establish target-owned application validation commands and update Project Memory if they become durable facts. Authorized publication/merge uses the installed target-owned workflow and repository command owner; source-project publication helpers remain non-applicable.

## D-004 Use browser-to-object-storage multipart with a stateless control plane

**Context:** The product must reliably transfer files larger than 10 GB across unreliable networks, resume without unnecessary retransmission, remain correct across service restarts and multiple instances, and separate transfer progress from trustworthy final completion. The architecture direction was narrowed without selecting a provider or application technology stack.

**Decision:** Use browser-to-object-storage multipart transfer as the large-file data plane. Keep application control-plane instances stateless with respect to in-process upload ownership while persisting durable upload metadata outside process memory. Let object storage perform multipart assembly/final object construction. Treat resume/session identity, verified content identity, and storage-provider multipart identity as distinct concepts.

**Reason:** This keeps large payloads out of the application control plane, avoids instance-local upload ownership, uses storage-native multipart assembly, and prevents different recovery/integrity/storage identities from being conflated as the system evolves.

**Impact:** Provider, application runtime/framework, persistence technology, deployment topology, checksum mechanism, finalization convergence details, and the dedupe/whole-file-integrity verification model remain open until their owning research settles them. Later implementation planning must preserve the accepted direction unless changed evidence or explicit user correction returns it to the architecture owner.

**Related files:** `docs/product-blueprint.md`, `.codex/project-memory/topics/architecture-and-upload-lifecycle.md`, `.codex/project-specific/agent-guidance.md`
