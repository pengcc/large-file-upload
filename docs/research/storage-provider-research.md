# Object-storage and browser-upload research record

Status: research record, not accepted project fact. Compiled 2026-10-30 from three delegated
docs-first research passes (S3 multipart; other providers; browser hashing, dedupe security and
transport). The figures below are the passes' reports of official documentation; the compiling
agent did **not** re-open each cited page. Provider documentation changes: re-verify any item
before relying on it. "ND" means the pass found the page silent; "unverified" means not read.

## 1. Amazon S3 multipart (AWS docs, S3 User Guide and API reference)

- Limits: 5 MiB-5 GiB per part (last part exempt), 10,000 parts, 48.8 TiB object. With checksums,
  part numbers must be consecutive from 1.
- Presigned URLs: up to 7 days (IAM user, SigV4); with temporary credentials the URL dies when the
  credentials expire. Presigned `UploadPart` is not documented on the presigned-URL pages (ND).
  `ETag` exposure in CORS is not documented as required (inference only).
- `ListParts`: max 1,000 parts per page. The user guide says use it only for verification, not to
  build the Complete request; keep your own part/ETag list. Consistency of multipart listings is
  not stated (ND).
- Re-uploading a part number overwrites it. Concurrent uploads of one part number: ND.
- `CompleteMultipartUpload`: can return HTTP 200 with an error body; may take minutes; retry
  semantics after success are not documented as idempotent; `NoSuchUpload` may mean aborted or
  already completed. Concurrent Complete calls on one upload ID: ND. Which upload produced an
  object is not queryable (`GetObjectAttributes` has no upload ID). Supports `If-None-Match` /
  `If-Match` (412 on failed condition, 409 on conflict) and `x-amz-mp-object-size`.
- Abort and cleanup: in-flight parts after abort "might or might not succeed"; use
  `AbortIncompleteMultipartUpload` lifecycle rules; there is no expiry for in-progress uploads.
- Checksums: FULL_OBJECT type supports CRC64NVME, CRC32, CRC32C; COMPOSITE (checksum of part
  checksums) supports CRC32, CRC32C, SHA-1, SHA-256 and others. A client-supplied `x-amz-checksum-*`
  on `UploadPart` is validated. A whole-object SHA-256 for a multipart object is not available at
  upload time. Unverified inference: S3 Batch Operations "Compute checksum" could produce it at
  rest.
- `UploadPartCopy` exists for server-side recomposition.

## 2. Other providers

| | GCS | Azure Blob | Cloudflare R2 | MinIO / Ceph RGW | Backblaze B2 |
|---|---|---|---|---|---|
| Max object | 5 TiB | ~190.7 TiB | 5 TiB | MinIO 50 TiB (archived doc); Ceph ND | 10 TB |
| Part/block | 5 MiB-5 GiB, 10,000 parts | blocks up to 4,000 MiB, 50,000 committed / 100,000 uncommitted | 5 MiB-5 GiB, 10,000 parts, non-last parts equal size | MinIO min 5 MiB, 10,000 parts (M); Ceph ND | 5 MB-5 GB |
| Browser direct | signed URL up to 7 days; resumable session URI is a bearer token | SAS (Create/Write permission) | presigned 1 s-7 days (multipart presign ND) | not checked | presigned supported |
| List accepted parts | resumable: status PUT returns offset; XML ListParts page not read | Get Block List (uncommitted) | ListParts implemented | Ceph ListParts documented | ND |
| Per-part checksum | `x-goog-hash` CRC32C/MD5 validated | Content-MD5 / CRC64, transport only, not stored | Content-MD5; `x-amz-checksum-*` docs contradictory | MinIO ND; Ceph partial | SHA-1 required |
| Whole-object hash | CRC32C only | client-supplied MD5, not validated | composite ETag | ND | client-supplied SHA-1 |
| Completion idempotency | `NoSuchUpload` on retry after success; ND otherwise | `Put Block List` retry semantics ND (inference: `Latest` is retry-friendly) | ND | ND | ND |
| Incomplete-upload cleanup | lifecycle rule, no default | auto-deleted ~1 week after last block | auto-abort after 7 days (configurable) | ND | lifecycle rule, no default |
| Consistency | strong incl. list | not fetched | strong incl. list | ND | ND |

Other notes: GCS resumable uploads need 256 KiB-multiple chunks sent in order (no cross-chunk
parallelism), expire after 7 days, need `Origin` at session creation for CORS; GCS compose accepts
32 sources per request; GCS multipart does not support preconditions. R2 has a one-write-per-second
limit per object key, free egress, and multipart operations billed as Class A. MinIO community repo
was archived read-only on 2026-04-25 (AGPLv3, no prebuilt community binaries; commercial AIStor is
the successor). Ceph checksum behaviour varies by release (Red Hat bug reports, not official docs).
No evaluated provider offers a server-computed, readable whole-object SHA-256 after assembly.

## 3. Browser hashing, dedupe security, transport

- `crypto.subtle.digest` does not stream: MDN says the whole input must be read into memory.
  Streaming digest remains an open W3C proposal with no shipped support. Incremental hashing in a
  browser needs a WASM library (e.g. hash-wasm: incremental API, works in Web Workers; its
  benchmarks are vendor-claimed on 1 MB one-shot inputs). No browser-measured throughput for
  multi-GB files was found.
- BLAKE3 is tree-structured, so independent subtrees can be combined into one whole-file hash
  (part-aligned subtree chaining values are not the same as the standalone part hash); SHA-256 is
  sequential. Bao is labelled unaudited beta.
- Client-side dedupe keyed only on a client-claimed hash is a documented attack (Halevi et al.,
  CCS 2011; Mulazzani et al., USENIX Security 2011): knowing a hash can suffice to obtain the
  file. Documented mitigations: proofs of ownership (Merkle-based), challenge-response on random
  byte ranges, no cross-user dedupe. Existence side channel (Harnik et al., 2010): randomized
  thresholds, with residual leakage (secondary source).
- Transport: `XMLHttpRequest.upload` gives progress events; `fetch` upload progress and Firefox
  request-streaming status were not confirmed; streaming `fetch` bodies need `duplex: 'half'` and
  HTTP/2 or later. HTTP/1.x browsers commonly cap ~6 connections per host (not a spec value).
  Behaviour of in-flight requests in frozen or backgrounded tabs is not documented. `Blob.slice`
  laziness is not documented as a guarantee. `File` snapshots that no longer match disk fail reads
  with `NotReadableError`.
- tus: strictly ordered offset-based PATCH per upload; parallelism only via the concatenation
  extension; checksum extension covers each chunk, not the whole file; assumes a tus server that
  assembles.

## 4. Free-tier and trial facts used for planning (Google Cloud docs, read 2026-10-30/11-03)

Cloud Storage Always Free: 5 GB-months Standard storage in us-east1/us-west1/us-central1 only,
5,000 Class A and 50,000 Class B operations, 100 GB egress from North America per month. A billing
account is required; Free Trial is $300 for 90 days for new customers only, and expiry closes the
trial account without automatic charge. Pricing-page figures (about $0.02/GiB-month, Class A about
$0.005/1,000) came from search snippets; the internet egress rate was only a stale figure and is
not recorded here. Google Drive API: 5 TB max file, 750 GB/day upload per user, resumable session
URI expires after one week, chunks sequential in 256 KB multiples.
