# Shared-disk upload spike: measured results and analysis

Status: research record, not accepted project fact. Promote to Project Memory only through
`update-project-memory` after user confirmation.

Scope: the server-receives-parts alternative (offset writes into one preallocated file, SQLite
ledger, leased finalization). It does **not** validate D-004 (browser-to-object-storage multipart).
Code: `spikes/shared-disk/`; experiment scripts: `spikes/shared-disk/experiments/`.
Environment: macOS client, Node 24, Synology DS720+ (DSM 7.2, Btrfs) over SMB on a gigabit LAN,
dedicated shared folder with a 40 GB quota and a least-privilege user. One NAS, one client, one
network: every number below is specific to this setup.

## 1. Scenario results

25 automated scenarios pass both on local disk and with data on the NAS mount
(`SPIKE_TEST_DATA_DIR=/Volumes/upload-test npm test`): byte-identical parallel upload, idempotent
part retry, crash + resume sending only missing parts, rejected bad CRC / short body, post-accept
corruption caught at completion (only that part re-sent), source changed (mtime differs: refused;
same size and mtime: caught by whole-file digest, never COMPLETE), complete refused while a write is
in flight, server killed before recording a part, finalizer killed before and after publish
(retry converges, no re-upload), two instances completing the same session (one final file),
stale-session cleanup. Review remediation (see section 8) added: mandatory digest, invalid
names and part numbers, write-lease fence, same-process double complete, abort during
finalization, cleanup that spares active and finalizing sessions, rejected-part status delivery,
and the browser SHA-256 implementation against `node:crypto`.

## 2. 10 GB end-to-end runs

| Run | Result |
|---|---|
| First implementation (each socket chunk written via `createWriteStream`), 64 MiB parts, concurrency 4 | 1666 s, 6.4 MB/s |
| After coalescing writes into 8 MiB blocks, concurrency 1 | 344 s, 31 MB/s |

All 10 GB digests matched: server-reported, local `shasum -a 256` of the source, and an independent
`shasum` of the published file on the NAS. These are end-to-end figures: they include a full
client-side read (SHA-256 claim) and a full server-side read-back (verification). Rough breakdown of
the 344 s (estimate, not instrumented): 160 parts x ~1.4 s ≈ 225 s transfer, ~25 s client hash,
~100 s server verification read (a 1 GB completion took ~10 s).

## 3. Write-path optimization: what was found and how sure we are

### Observation
Per 64 MiB part sent to the server with data on SMB: ~7-8 s with the first implementation, versus
0.07 s with data on local disk. Raw SMB writes outside the server were fine (sequential ~95 MB/s,
out-of-order `pwrite`+`fsync` ~89 MB/s; Node `createWriteStream` from a generator ~62 MB/s; 64 MiB
at far offsets of a 2 GiB preallocated file ~53-98 MB/s). So the mount and Node were capable of
~60-90 MB/s, and the server's write pattern was the difference.

### Experiments (64 MiB part, fresh preallocated file each time, `experiments/write-strategy.mjs`)
| Write strategy | Samples |
|---|---|
| One awaited `pwrite` per received chunk (avg chunk ~64 KiB) | 8 runs: 5.6, 7.4, 7.3, 7.5, 7.8, 7.7, 9.3, 7.9 s (median 7.6 s, all > 4 s) |
| `createWriteStream` via `pipeline` (with or without `start`) | bimodal: 0.8-1.0 s in 2 of 6 runs, 7.4-10.2 s in the other 4 |
| Gather 16 chunks, one `writev` | 1.4-1.8 s in every run (11 runs) |
| Coalesce to 8 MiB, one `pwrite` per block | 1.2-1.6 s in every run (14 runs; 16 counting the block-size sweep) |
| Coalesce to 64 KiB / 256 KiB / 1 MiB / 4 MiB / 8 MiB / 64 MiB (first sweep) | 1.3-1.4 / 2.6-2.8 / 1.6-1.8 / 1.3 / 1.25-1.3 / 1.2 s |

Time inside a fast run is almost all the final `fsync` (~1.1-1.3 s of ~1.3 s, i.e. flushing 64 MiB
takes ~1.1 s, ≈ 58 MB/s); the `write` calls themselves return in tens of milliseconds because the
SMB client caches them. Ruled out as causes: CRC computation, `fsync` presence, abort-signal
handling, ledger access (all variants had them or not with the same result).

### Conclusion, with limits
- Writing each ~64 KiB network chunk as its own write is slow and, for `createWriteStream`,
  intermittently so (median ~6x slower than coalescing). Coalescing into >= 4 MiB writes (or one
  `writev` of many chunks) was fast in every run. The shipped fix uses 8 MiB blocks.
- **Unexplained:** in the first block-size sweep a per-64 KiB-chunk write was fast (1.3 s), yet the
  same pattern was slow in all later runs, including after deleting ~50 leftover test files from
  the share. NAS or SMB-client state is a plausible factor but was not isolated. Do not assume the
  slow path is deterministic, and do not assume the root cause is "small writes" as such; the
  evidence only supports "per-chunk writes are unreliable here, large writes were reliable".
- A cheaper, simpler alternative also worked in the tests (`writev` of chunks that arrived
  together); it was not adopted because 8 MiB coalescing was both fast and the most consistent.
- Because the result may depend on the SMB client (macOS) and server (DSM Samba on Btrfs), it must
  be re-measured on any other mount; no claim is made for NFS or other clients.

## 4. Concurrency

Four concurrent whole-part writes of 64 MiB each (8 MiB coalesced), aggregate throughput
(`experiments/concurrency.mjs`, 2 rounds each):

| Writers | Same file, different offsets | Separate files |
|---|---|---|
| 1 | 46-47 MB/s | 48-49 MB/s |
| 2 | 52 MB/s | 53-56 MB/s |
| 4 | **25 MB/s** | **57-58 MB/s** |

Throughput saturates near 50-58 MB/s with one or two writers. Four writers on the same file halve
it, while four writers on separate files do not, so the slowdown is contention on one file, not
the NAS's total bandwidth. In the full 1 GB uploads, concurrency 4 was likewise slower than 1
(24 vs 46 MB/s).

Design implication (a hypothesis, not tested end-to-end): writing each part to its own file removes
this contention but adds a concatenation pass (another full read and write of the file, plus
temporary space), which is the cost the single-file offset design avoids. Over object storage the
per-part concurrency has no such shared-file cost.

## 5. Client memory

Peak RSS of the Node client uploading 1 GB to a local-disk server (to exclude the NAS):

| Part size | Concurrency 1 | Concurrency 4 |
|---|---|---|
| 8 MiB | 313 MiB | 421 MiB |
| 64 MiB | 635 MiB | 1344 MiB |

Memory scales with part size x in-flight parts, roughly 5-10x the part size per in-flight part,
not with file size, so it is not a leak. A probe shows allocated part buffers live outside the JS
heap and are released lazily (after reading six 64 MiB parts, RSS stayed 241 MiB until GC). Not
investigated further: where exactly the extra copies come from (read buffer, request body, fetch
internals). Mitigations to test if it matters: smaller parts, reusing one buffer per worker.

## 6. Other findings

- Local-disk throughput (hundreds of MB/s) says nothing about network mounts; always measure on the
  real mount.
- The design needs explicit write registration in the ledger so completion cannot start while a
  part write may still land. Lease expiry means a crashed writer or finalizer delays recovery
  (defaults: 2 min write lease, 10 min finalize lease).
- Browser page, measured with in-memory generated files (optimistic): 50 MB and 200 MB uploads
  matched; stop and resume worked; pure-JS CRC32 ~400 MB/s; per-8-MiB Web Crypto SHA-256 ~1400
  MB/s. No whole-file hashing library was added (zero-dependency constraint), so whole-file SHA-256
  is computed server-side.

## 7. Not done / not verified

- Manual network-disconnect and unmount-during-upload test (needs the user).
- Confirmation that `upload-tester` cannot open other shares (expected from the DSM permission rules
  shown in the wizard, not tested).
- Real-disk browser measurements for multi-GB files.
- Power-loss durability: only `fsync` behaviour was relied on, not tested.
- Root cause of the intermittent slow path (section 3) and the memory copies (section 5).
- Everything about object storage (GCS, S3, others); that is a separate spike.

## 8. Review remediation (PR review of head 59111e4)

An independent read of the spike found three must-fix and five should-fix defects; all were fixed
and each fix is covered by a test that fails when the fix is reverted (checked by reverting the
fence, the per-claim token and the abort rule one at a time).

- **Write fence.** The first design only waited for a time margin, so a stalled SMB write could
  land after a finalizer claimed and verified the session. Now a writer renews its ledger
  registration immediately before every disk write and before the fsync, and the renewal fails once
  the session is claimed or the registration lapsed. The bound that remains: one write call
  stalling longer than the lease (default 120 s) can still land late, and cross-process clock
  skew shrinks that margin.
- **Detecting late writes by mtime does not work on SMB.** An mtime/size comparison around the
  verification scan was added and then removed: on this mount, reading a file moves its mtime
  (probe: stable for 6 s after write, then a ~7 s jump after one full read), so healthy uploads
  were reported as modified and the suite failed on the NAS while passing locally.
- **Browser whole-file digest.** The server now rejects `complete` without a 64-hex SHA-256; before,
  a browser upload whose source changed mid-upload could be marked COMPLETE. Web Crypto cannot
  stream, so the page uses a plain-JS incremental SHA-256 (verified against `node:crypto`). Measured
  on a 300 MB in-memory file: ~226 MB/s, matching the whole-buffer Web Crypto digest; a 10 GB file
  would take roughly 45 s by extrapolation (optimistic, not measured on a real 10 GB file).
- **Per-claim token.** The finalization owner was the process, so a retry through the same process
  became a second concurrent finalizer. The owner is now a fresh token per claim.
- **Other fixes.** Abort refused while FINALIZING; file names with NUL/control characters or over
  255 bytes rejected; non-numeric part numbers return 400; internal errors no longer echo paths;
  cleanup ages from last activity and aborts conditionally; rejected part PUTs deliver their
  status instead of a connection reset.
- **After remediation.** 25/25 scenarios pass on local disk and on the NAS mount; a 1 GB upload to
  the NAS took 27.6 s (38.9 MB/s, concurrency 1) against 23 s before the fence was added: a single
  run, so no regression or improvement is claimed. The 10 GB NAS run in section 2 predates the
  remediation and was not repeated.

