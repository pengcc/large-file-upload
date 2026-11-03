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

## Verified provider constraints (official docs read 2026-10-30; re-verify before relying)

- None of S3, GCS, Azure Blob or R2 documents a server-computed, readable whole-object SHA-256 after multipart assembly. S3 offers full-object CRC64NVME/CRC32/CRC32C; GCS exposes CRC32C; S3's multipart SHA-256 is composite (a checksum of part checksums).
- None documents an idempotent completion call. S3 and GCS return `NoSuchUpload` for a completed upload, and S3 can return HTTP 200 with an error body. An ambiguous completion has to be reconciled by reading object metadata.
- S3 documents `ListParts` as verification only; completion should use the caller's own part ledger.
- Not verified: S3 Batch Operations computing a SHA-256 at rest for multipart objects; presigned `UploadPart` for S3, R2 and GCS XML multipart; R2 `x-amz-checksum-*` support.

These constrain but do not settle the residual questions above. Sources and the full comparison are in `docs/research/storage-provider-research.md`, a research record compiled from delegated reports and not re-verified page by page.

## Product boundary

`docs/product-blueprint.md` remains the product/research boundary for the complete logical upload lifecycle, reliability constraints, and architecture success criteria. This topic records accepted current architecture facts without copying that blueprint.
