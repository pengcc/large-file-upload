# Lessons Learned

## Measure I/O paths on the real target mount

**Category:** Keep
**Context:** Shared-disk upload spike, 2026-11. The same server code took ~0.07 s per 64 MiB part on local disk and 7-8 s per part on an SMB mount, while raw writes to the mount ran at ~90 MB/s.
**Lesson:** Local-disk throughput does not predict network-mount behavior, and raw-write benchmarks do not predict an application's write pattern on that mount.
**Reuse:** Before relying on any storage-path claim, measure the real application path against the real mount or provider.
**Related:** `docs/research/shared-disk-spike-report.md`, `spikes/shared-disk/src/storage.ts`

## Repeat and interleave performance samples before concluding

**Category:** Keep
**Context:** Same spike. Two early samples showed small writes as fast; later runs showed them slow. A first explanation ("small writes are 6x slower") was wrong in shape: the slow path was intermittent for one write strategy and consistent for another.
**Lesson:** One or two samples, or runs in a fixed order, mislead. Eight or more interleaved samples per variant exposed the distribution.
**Reuse:** Report distributions, not single runs, and state what remains unexplained instead of filling it with a plausible cause.
**Related:** `docs/research/shared-disk-spike-report.md`
