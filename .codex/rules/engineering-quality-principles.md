# Engineering Quality Principles

These principles are cross-technology engineering constraints for planning, implementation, and review.

They are not a standalone workflow skill.

Apply `task-and-change-safety-principles.md` for proportional task scope, focused changes,
validation and evidence, safe update methods, and the conditional Plausible Extension Check.
Operating authority and global-tooling approval remain directly owned by
`agent-operating-contract.md`.

They are applied by roles and workflows such as:

- agent-roles-and-capabilities
- plan-with-context
- execute-plan
- code-review
- future technology-specific skills

Project-specific conventions, lint/format/test configuration, and existing repo patterns take priority.

If project conventions conflict with these principles, report the conflict and ask the user or project memory to decide.

## 1. Project-Aligned Simplicity

Use the smallest clear design that solves the current need. Follow the project's established
domain language, configuration, style, file organization, and implementation patterns unless
verified evidence justifies a scoped change.

Consolidate behavior that represents one concept and is likely to change together. Preserve local
clarity when variation is uncertain; do not introduce abstractions, layers, or test infrastructure
merely for structural uniformity.

## 2. Understandable Responsibilities and Dependencies

Keep responsibilities, reasons to change, and dependency direction understandable. Prefer
explicit inputs and bounded side effects over hidden global state or cross-layer reach-through.
Split units when their responsibilities or testing concerns genuinely diverge, not by a mechanical
size threshold.

## 3. Testable Behavior and Explicit Failure

Design important behavior so it can be exercised through its real boundary. Validate inputs at
relevant trust boundaries, handle invalid or unavailable state deliberately, and surface or record
failures through the project's safe error boundary rather than swallowing them.

## 4. Scoped Pattern Changes

Inspect the current project pattern before introducing another one. When an established pattern is
harmful, explain the evidence and tradeoff, keep the replacement bounded, and avoid unrelated
cleanup or tooling change.

## 5. Engineering Validation

For implementation work, select checks that cover the affected engineering boundary. Typical
validation includes:

- typecheck
- lint
- unit tests
- integration tests
- e2e tests
- build
- manual verification

### Regression Test Value

Add or retain a test only when its failure identifies a meaningful regression. Prefer observable
behavior, installability, payload and ownership contracts, routing, stable commands or fields, and
safety boundaries over ordinary prose or mirrored implementation details.

For repository agent-tooling assets, tests should verify missing files, incorrect mappings, invalid
machine-readable structures, or executable tools that no longer work. Do not freeze mutable
Markdown headings, prose sentences, prompt wording, or skill-instruction wording unless the exact
text is itself a machine-consumed interface.
For frequently run tests, weigh maintenance and review cost as well as runtime cost, and preserve
the original regression signal when consolidating or replacing coverage.

## 6. Concrete UI Guidance

For concrete screens, pages, flows, forms, or UI-facing changes, preserve the project's design
system, components, tokens, accessibility practices, and product context, then apply
`ui-design-basics` inside the active planning, implementation, or review workflow. Product-wide UI
direction and professional accessibility evaluation remain separate boundaries.

## 7. Reassess the Runtime as Automation Grows

Shell is appropriate for small, linear glue around existing commands. Reassess the runtime before
a script becomes a workflow engine with complex state, structured data, interactive prompts,
backups, path-boundary enforcement, recovery logic, or extensive branching.

When those signals appear:

- warn that the current runtime may be increasing correctness and testability risk
- compare the cost of continued shell growth with migration to a more testable runtime
- research and plan the migration before the script becomes harder to replace
- preserve a bounded archive or rollback reference only when it has a clear ownership and support
  status

Node.js is one suitable choice in this repository, but the general rule is to select the runtime
that best supports the workflow's state model, validation needs, and long-term maintenance.

## 8. Composable Boundaries and Extension Seams

Compose focused units through small, explicit inputs, outputs, and contracts. Keep dependency
direction visible by passing external services, state, and configuration through deliberate
boundaries instead of hidden globals or cross-layer reach-through.

Add extension points only for demonstrated variation or integration needs. Prefer a later small
refactor over generalized interfaces. Separate domain decisions from adapters or side effects when
it improves testability and change isolation; do not impose layers mechanically.

## 9. Configuration, Secrets, and Security Boundaries

Separate deploy-varying configuration from code and validate required configuration at an
appropriate startup or trust boundary. Use project-approved runtime configuration and secret
management; never hard-code, commit, log, or place real secrets in examples, tests, or project
memory.

Keep authorization, credential handling, cryptography, destructive operations, and other
security-sensitive behavior behind small auditable boundaries with consistent enforcement. Prefer
secure defaults, least privilege, established libraries or patterns, and docs-first verification
over custom security mechanisms.

## 10. Module Depth and Seams

- Before adding another implementation layer, identify the existing natural owner of the
  responsibility. Judge ownership at the relevant responsibility boundary, not by how low-level
  the underlying mechanism is.
- Use an established language, framework, library, database, platform, or runtime mechanism
  directly when it already owns the required generic behavior and the application adds no distinct
  meaning.
- Add or retain a layer when it owns distinct application semantics, preserves a real ownership
  boundary, or provides demonstrated isolation of an external, volatile, or independently changing
  dependency.
- Prefer deep modules: a small, stable interface with meaningful implementation behind it.
- Avoid shallow pass-through or speculative abstractions that mainly rename or forward an existing
  mechanism. Consistency, naming convenience, hypothetical substitution, or easier mocking is not
  sufficient justification by itself.
- Keep adapters at external boundaries such as APIs, databases, file systems, queues, and payment
  providers.
- Test through the same interface real callers use instead of coupling tests to private details.
- Favor locality so related behavior is easy to find and change together.
- Architecture should increase leverage and reduce future cost, not add ceremony.

## 11. Authoritative State and Proportionate Convergence

Name the owner of authoritative state and transitions separately from caches, observers, and other
projections. Stale or out-of-order projection results must not overwrite newer authoritative truth.

Prefer bounded convergence at meaningful read, write, focus, or freshness boundaries. Continuous
polling, broadcast, or synchronization requires a demonstrated actor outcome that needs that
immediacy.

Once a primary persistent or external success is verified, a later non-authoritative projection,
reconciliation, or housekeeping failure is separate follow-up truth. Report and recover that
failure without rewriting the verified primary success.
