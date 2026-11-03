# Shared-disk upload spike: measured results

Status: research record, not accepted project fact. Promote to Project Memory only through
`update-project-memory` after user confirmation.

Scope: the server-receives-parts alternative (offset writes into one preallocated file, SQLite
ledger, leased finalization). It does **not** validate D-004 (browser-to-object-storage multipart).
Code: `spikes/shared-disk/`. Environment: macOS client, Node 24, Synology DS720+ (DSM 7.2, Btrfs)
over SMB on a gigabit LAN, dedicated shared folder and a least-privilege user.

## Scenario results

14 automated scenarios pass both on local disk and with data on the NAS mount
(`SPIKE_TEST_DATA_DIR=/Volumes/upload-test npm test`): byte-identical parallel upload, idempotent
part retry, crash + resume sending only missing parts, rejected bad CRC / short body, post-accept
corruption caught at completion (only that part re-sent), source changed (mtime differs: refused;
same size and mtime: caught by whole-file digest, never COMPLETE), complete refused while a write is
in flight, server killed before recording a part, finalizer killed before and after publish
(retry converges, no re-upload), two instances completing the same session (one final file),
stale-session cleanup.

## Measurements

| Run | Result |
|---|---|
| Raw SMB write, sequential / out-of-order pwrite+fsync | ~95 / ~89 MB/s |
| 10 GB upload, first implementation (streamed writes), concurrency 4 | 1666 s, 6.4 MB/s |
| Same implementation, single 64 MiB part via HTTP | 7-8 s (local disk: 0.07 s) |
| Isolated test: streamed write vs one buffered write of a 64 MiB part | 7-8 s vs 1.3 s |
| After coalescing writes into 8 MiB blocks, 1 GB, concurrency 1 / 4 | 23 s (46 MB/s) / 45 s (24 MB/s) |
| 10 GB upload, coalesced writes, concurrency 1 | 344 s, 31 MB/s, client peak RSS ~680 MB |

All 10 GB digests matched: server-reported, local `shasum -a 256` of the source, and an independent
`shasum` of the published file on the NAS. The 31 MB/s figure includes a full client-side read
(SHA-256 claim) and a full server-side read-back (verification), so it is end-to-end, not raw write
speed.

## Findings

- Over SMB, streaming a request body into `createWriteStream` was ~6x slower than coalesced
  writes, independent of CRC, fsync or abort-signal handling. Raw SMB throughput was fine, so
  small-write behaviour of the client/mount combination was the cause. Cause not isolated further.
- More concurrent writers to one file made it slower on this NAS (24 vs 46 MB/s). Concurrency that
  helps over object storage did not help here.
- Local-disk numbers (hundreds of MB/s) say nothing about network mounts; always measure on the
  real mount.
- The design needs explicit write registration in the ledger so completion cannot start while a
  part write may still land, and lease expiry means a crashed writer or finalizer delays recovery
  (defaults: 2 min write lease, 10 min finalize lease).
- Node client memory (~680 MB at 10 GB, concurrency 1) is higher than expected; not investigated.
- Browser page, measured with in-memory generated files (optimistic): 50 MB and 200 MB uploads
  matched; stop and resume worked; pure-JS CRC32 ~400 MB/s; per-8-MiB Web Crypto SHA-256 ~1400
  MB/s. No whole-file hashing library was added (zero-dependency constraint), so whole-file SHA-256
  is computed server-side.

## Not done / not verified

- Manual network-disconnect and unmount-during-upload test (needs the user).
- Confirmation that `upload-tester` cannot open other shares (expected from the DSM permission rules
  shown in the wizard, not tested).
- Real-disk browser measurements for multi-GB files.
- Power-loss durability: only `fsync` behaviour was relied on, not tested.
- Everything about object storage (GCS, S3, others); that is a separate spike.
