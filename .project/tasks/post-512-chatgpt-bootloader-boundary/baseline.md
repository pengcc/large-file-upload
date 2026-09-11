Task State branch: `task/post-512-chatgpt-bootloader-boundary`
Task Workspace: `.project/tasks/post-512-chatgpt-bootloader-boundary/`

# Task Baseline

## Intent

Make the configured Large File Upload ChatGPT Project a thin runtime projection of current repository truth, so a fresh conversation can discover current project/workflow semantics from `pengcc/large-file-upload` rather than depending on copied Project resources, Badminton state, or stale configured context.

At the same time, preserve genuinely actor-specific ChatGPT effects only where the ChatGPT runtime needs them and keep those effects subordinate to repository-owned semantic and authority owners.

## Expected Outcome

The permanent tooling boundary establishes:

```text
configured Large File Upload ChatGPT Project
        |
        v
repo-owned versioned Project Instructions
        |
        +-- compare configured/repository Project Instructions Version
        |      mismatch -> Project refresh required
        |
        v
current main:AGENTS.md
        |
        v
only current owners required for this task
        |
        +-- ChatGPT-specific transport only where a real actor-local effect requires it
```

No static Project Resource File is required as a semantic authority. Current `AGENTS.md` already routes Project Memory, collaboration contracts, implementation review, publication/merge, and missing-capability behavior from repository-owned sources.

## Scope

This task covers the configured Project surface, bootloader/version gate, current-repository routing, persisted Task State access from ChatGPT, exact-PR Implementation Review transport, unsupported-capability behavior, and fresh-conversation acceptance.

It does not select or modify product architecture, application runtime/toolchain, deployment, storage, validation command, implementation-to-PR authority, or Badminton-specific workflow machinery.

## Key boundaries

`large-file-upload` remains the owner of its current Project Memory, workflow truth and application decisions. Shared semantics become current only after materialization here; another repository remains provenance/evidence, not a runtime dependency.

Task Alignment itself is actor-neutral. Persisted Task State is conditional rather than mandatory, and the existing repository rules already define branch-aware, exact-workspace, compare-and-swap-safe persistence with connector-backed access as a valid mechanism.

The important loss boundary is accidental duplication of semantic authority: a ChatGPT adapter must not become another owner for Task Baseline, Task Decisions, review meaning, plan meaning, or current repository truth.

## Value and risk

The value is that future Project changes normally become repository changes rather than simultaneous repository + configured-Project synchronization work.

The main risk is solving actor differences by adding a broad “ChatGPT runtime layer” that duplicates existing contracts. The repository's own Agent Tooling Design Principles explicitly favor the smallest component with a demonstrated consumer and reject registries, dispatchers, synchronization machinery, or always-loaded infrastructure without a real need.

## Success boundary

A fresh configured Project obtains required Large File Upload truth through the matching bootloader and current `main:AGENTS.md`; current owners remain authoritative; unsupported capabilities degrade truthfully; ChatGPT-specific effects exist only where necessary; and later repository-only evolution does not normally force configured-Project refresh.
