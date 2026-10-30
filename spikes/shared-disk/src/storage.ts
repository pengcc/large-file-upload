import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, open, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
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

// Streams `body` into the staging file at `offset`, computing CRC32 on the way. The write is
// fsynced (flush: true) before resolving. Rejects if the body length differs from `expected`.
export async function writePart(
  path: string,
  offset: number,
  expected: number,
  body: Readable,
  signal: AbortSignal,
): Promise<{ size: number; crc32: number }> {
  let size = 0;
  let crc = 0;
  const meter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      size += chunk.length;
      if (size > expected) return cb(new LengthMismatch(`body longer than ${expected}`));
      crc = crc32(chunk, crc);
      cb(null, chunk);
    },
  });
  await pipeline(body, meter, createWriteStream(path, { flags: 'r+', start: offset, flush: true }), { signal });
  if (size !== expected) throw new LengthMismatch(`body was ${size} bytes, expected ${expected}`);
  return { size, crc32: crc >>> 0 };
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
