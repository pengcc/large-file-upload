# Large File Upload Agent Guidance

This file supplements `AGENTS.md` with the small set of `large-file-upload`-specific boundaries that are not owned by shared collaboration contracts. Read it when product-specific architecture, storage/integrity behavior, or repository-capability assumptions materially affect the current task.

## Accepted architecture direction

Preserve the current accepted upload direction unless changed evidence or explicit user correction returns the question to its architecture owner:

- browser-to-object-storage multipart transfer is the data plane;
- the control plane is stateless at the service-instance/process boundary while durable upload metadata lives outside process memory;
- multipart assembly/final object construction is storage-side;
- resume identity, verified content identity, and storage-provider multipart identity are distinct concepts.

The detailed current-fact owner is `.codex/project-memory/topics/architecture-and-upload-lifecycle.md`; durable rationale is recorded in Project Decision D-004. Do not silently turn this direction into a provider, framework, database, checksum, finalization, or dedupe choice.

## Technical fact boundary

Use `docs-first-research` for consequential provider, object-storage multipart, checksum, browser/network API, consistency, limit, or version-specific behavior. Source-project precedent is not evidence for these external facts.

## Repository capability boundary

Use the installed target-owned `open-or-update-pr` and `merge-pr` workflows and `.repo-tools/scripts/repository-publication.mjs` for publication mechanics. Do not infer application validation, package-manager, application-runtime, deployment, automated-worktree, or other absent capabilities from shared or source-era text.

Node is currently required by repository publication tooling only; that does not select Node as the product application's runtime.

## Capability growth

Keep this supplement thin. Do not duplicate Task Alignment, planning, review, Git/publication, safety, or authorization contracts here. Add a project-specific rule, skill, prompt, or specialist only when a repeated target-specific consumer cannot be served cleanly by existing owners.
