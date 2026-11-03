import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { crc32 } from 'node:zlib';

// Staging and final files live under dataDir, which may be a network mount (e.g. SMB on a NAS).
// A session's bytes are written at their offsets into one preallocated staging file, so no
// concatenation step is needed. Publishing is a single rename into a per-session final directory.

export function stagingPath(dataDir: string, sessionId: string): string {
  return join(dataDir, 'staging', `${sessionId}.upload`);
}

export function finalPathFor(dataDir: string, sessionId: string, fileName: string): string {
  return join(dataDir, 'final', sessionId, fileName);
}

export async function createStaging(dataDir: string, sessionId: string, size: number): Promise<void> {
  await mkdir(join(dataDir, 'staging'), { recursive: true });
  const fh = await open(stagingPath(dataDir, sessionId), 'wx');
  try {
    await fh.truncate(size);
    await fh.sync();
  } finally {
    await fh.close();
  }
}

export class LengthMismatch extends Error {}

// Larger writes matter on network mounts: writing each ~64 KiB socket chunk separately (or via
// createWriteStream) was intermittently slow over SMB (median 7.6 s per 64 MiB part vs 1.3 s coalesced); see docs/research/shared-disk-spike-report.md.
const WRITE_BLOCK = 8 * 1024 * 1024;
// While a slow client is still sending, keep the write registration alive this often.
const HEARTBEAT_MS = 10_000;

// Writes `body` into the staging file at `offset` in WRITE_BLOCK-sized writes, computing CRC32 on
// the way, and fsyncs before resolving. Rejects if the body length differs from `expected`.
// `renew` must throw when the caller's write registration is no longer valid; it runs immediately
// before every disk write and before the fsync, so no write starts after finalization claimed the
// session. A single write call that stalls longer than the registration lease can still land late.
export async function writePart(
  path: string,
  offset: number,
  expected: number,
  body: Readable,
  renew: () => void,
): Promise<{ size: number; crc32: number }> {
  const fh = await open(path, 'r+');
  try {
    let size = 0;
    let crc = 0;
    let pending: Buffer[] = [];
    let pendingBytes = 0;
    let writeAt = offset;
    let lastRenew = Date.now();
    const flushPending = async () => {
      if (!pendingBytes) return;
      const block = Buffer.concat(pending, pendingBytes);
      pending = [];
      pendingBytes = 0;
      renew();
      lastRenew = Date.now();
      await fh.write(block, 0, block.length, writeAt);
      writeAt += block.length;
    };
    for await (const chunk of body as AsyncIterable<Buffer>) {
      if (Date.now() - lastRenew > HEARTBEAT_MS) {
        renew();
        lastRenew = Date.now();
      }
      size += chunk.length;
      if (size > expected) throw new LengthMismatch(`body longer than ${expected}`);
      crc = crc32(chunk, crc);
      pending.push(chunk);
      pendingBytes += chunk.length;
      if (pendingBytes >= WRITE_BLOCK) await flushPending();
    }
    await flushPending();
    if (size !== expected) throw new LengthMismatch(`body was ${size} bytes, expected ${expected}`);
    renew();
    await fh.sync();
    return { size, crc32: crc >>> 0 };
  } finally {
    await fh.close();
  }
}

// One sequential pass: whole-file SHA-256 plus per-part CRC32 for comparison with the ledger.
export async function scanFile(path: string, partSize: number): Promise<{ sha256: string; partCrcs: number[]; size: number }> {
  const hash = createHash('sha256');
  const partCrcs: number[] = [];
  let crc = 0;
  let inPart = 0;
  let size = 0;
  for await (const chunk of createReadStream(path, { highWaterMark: 4 * 1024 * 1024 }) as AsyncIterable<Buffer>) {
    hash.update(chunk);
    size += chunk.length;
    let pos = 0;
    while (pos < chunk.length) {
      const take = Math.min(partSize - inPart, chunk.length - pos);
      crc = crc32(chunk.subarray(pos, pos + take), crc);
      inPart += take;
      pos += take;
      if (inPart === partSize) {
        partCrcs.push(crc >>> 0);
        crc = 0;
        inPart = 0;
      }
    }
  }
  if (inPart > 0) partCrcs.push(crc >>> 0);
  return { sha256: hash.digest('hex'), partCrcs, size };
}

export async function publish(from: string, to: string): Promise<void> {
  await mkdir(join(to, '..'), { recursive: true });
  await rename(from, to);
}

export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw err;
  }
}
