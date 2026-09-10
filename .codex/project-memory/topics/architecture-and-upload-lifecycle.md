# Architecture and Upload Lifecycle

This topic owns current `large-file-upload` architecture facts that are relevant when planning, reviewing, or changing the upload lifecycle, identity model, finalization, integrity, or dedupe behavior. Project Decision D-004 records the durable rationale for the accepted direction.

## Accepted direction

The current architecture direction is:

- **Data plane:** the browser transfers file parts directly to object storage using the provider's multipart mechanism rather than proxying the large-file payload through the application control plane.
- **Control plane:** service instances remain stateless with respect to in-process upload ownership; durable upload metadata is stored outside process memory so retries, restarts, and multiple instances can converge on shared state.
- **Assembly:** multipart assembly/final object construction is performed by object storage rather than by concatenating the full file in application memory or local disk.
- **Identity:** resume/session identity, verified content identity, and storage-provider multipart identity are separate concepts and must not be treated as interchangeable identifiers.

This is architecture direction, not an approved API, schema, provider, or implementation plan.

## Still open

The accepted direction does not yet select:

- object-storage provider;
- application runtime or framework;
- durable metadata/persistence technology;
- deployment topology;
- exact checksum/integrity mechanism.

Those choices remain with their target-specific research/planning owners.

## Residual architecture questions

The following details remain unresolved until their owning architecture research establishes durable conclusions:

- authoritative finalization and recovery convergence when multipart completion succeeds but the response or metadata commit is ambiguous;
- the whole-file integrity and dedupe trust model, including when a client-claimed digest becomes verified content identity and how instant-upload can be safe without forcing every non-duplicate >10 GB file through an unjustified mandatory two-pass read.

Do not fill these gaps from another product repository or provider habit.

## Product boundary

`docs/product-blueprint.md` remains the product/research boundary for the complete logical upload lifecycle, reliability constraints, and architecture success criteria. This topic records accepted current architecture facts without copying that blueprint.
