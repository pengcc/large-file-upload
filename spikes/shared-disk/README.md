# Shared-disk upload spike

Research prototype, not product code. It does not select the project's runtime or stack (Project
Decision D-001 stays open) and it does not validate the accepted direct-to-object-storage
direction (D-004). It tests the alternative: the server receives parts and writes them at their
offsets into one preallocated file on a disk that may be a network mount (SMB on a NAS).

Requires Node 24+ (runs TypeScript via built-in type stripping, uses `node:sqlite`). No
dependencies.

## How it works

- `POST /sessions` fixes a part size for the session and preallocates `staging/<id>.upload`.
- `PUT /sessions/:id/parts/:n` streams the body to its offset, computes CRC32, fsyncs, then
  records the part in the ledger. An optional `x-part-crc32` header is checked.
- `POST /sessions/:id/complete` requires the client's whole-file SHA-256. It claims the session
  under a fresh per-claim token (a retry through the same process cannot become a second
  finalizer), checks every part is recorded, reads the whole staging file once (SHA-256 + per-part
  CRC32), compares with the ledger and the client digest, records the digest, renames into
  `final/<id>/<name>`, then marks COMPLETE. Any step can crash; a retry converges.
- Write fence: a part write registers in the ledger and renews that registration immediately before
  every disk write and its fsync; a finalizer cannot claim while a registration is live, and a
  writer whose registration lapsed or whose session was claimed is refused. Known limit: one write
  call stalling longer than `SPIKE_WRITE_LEASE_MS` (default 120 s) could still land late; instances
  sharing a ledger must have synchronized clocks. Abort is refused while FINALIZING.
- A ledger created before `last_activity` existed is migrated on open (column added, backfilled
  from `created_at`).
- Known gap: a session left FINALIZING by a finalizer that died is recovered only when a client
  calls complete again after the lease; `cleanup` sees only UPLOADING sessions, so such a session's
  staging file stays until then. A request rejected by the server has its remaining body drained
  without a size cap.
- The ledger (SQLite, WAL) lives on local disk and is the source of truth. Several server
  processes can share it.

## Run

```bash
npm test                       # all scenarios against a temp dir on local disk
npm start                      # server on :8787, browser page at http://localhost:8787/
node src/cli.ts upload <file>  # Node client
node src/cli.ts cleanup --older-than-hours 168
```

Environment: `SPIKE_DATA_DIR` (staging/final files), `SPIKE_LEDGER` (keep local),
`SPIKE_PORT`, `SPIKE_MIN_PART_SIZE`, `SPIKE_WRITE_LEASE_MS`, `SPIKE_FINALIZE_LEASE_MS`.

## Running against the NAS (WI-3)

1. Mount the dedicated shared folder (Finder: Cmd+K, `smb://<nas>/upload-test`).
2. Run the same scenarios with data on the mount and the ledger local:

   ```bash
   SPIKE_TEST_DATA_DIR=/Volumes/upload-test npm test
   ```

3. Large-file run: start the server with `SPIKE_DATA_DIR=/Volumes/upload-test`, then upload a
   10 GB file with the CLI or the browser page and compare `verifiedSha256` with
   `shasum -a 256 <file>`.
4. Manual: disconnect the network (or unmount) during an upload, reconnect, resume.

Never point `SPIKE_DATA_DIR` anywhere other than the dedicated test folder.
