import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { open, stat } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { crc32 } from 'node:zlib';

// Node test client. It plays the browser's role so the protocol and failure paths can be
// exercised from scripts; the browser page in public/ does the same with Blob.slice + XHR.

export type SessionView = {
  id: string;
  fileName: string;
  fileSize: number;
  partSize: number;
  partCount: number;
  fingerprint: string;
  state: string;
  verifiedSha256: string | null;
  failure: string | null;
};

export type UploadOptions = {
  sessionId?: string;
  concurrency?: number;
  claimSha256?: boolean;
  stopAfterParts?: number; // test hook: simulate a client crash after this many parts
  onSession?: (session: SessionView) => void;
  onPart?: (partNumber: number) => void;
  retries?: number;
};

export class ClientError extends Error {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(`${status}: ${String(body.error ?? 'request failed')}`);
    this.status = status;
    this.body = body;
  }
}

export class SimulatedCrash extends Error {}

async function call(url: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
  const res = await fetch(url, init);
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ClientError(res.status, body);
  return body;
}

function retryable(err: unknown): boolean {
  if (err instanceof ClientError) return err.status >= 500;
  return err instanceof TypeError; // fetch network failure
}

async function withRetry<T>(retries: number, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !retryable(err)) throw err;
      await sleep(Math.min(2000, 100 * 2 ** attempt));
    }
  }
}

export function fingerprintOf(size: number, mtimeMs: number): string {
  return `${size}:${Math.trunc(mtimeMs)}`;
}

export async function getSession(server: string, id: string): Promise<{ session: SessionView; parts: { partNumber: number }[] }> {
  return (await call(`${server}/sessions/${id}`)) as never;
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path, { highWaterMark: 4 * 1024 * 1024 })) hash.update(chunk as Buffer);
  return hash.digest('hex');
}

export async function uploadFile(server: string, path: string, opts: UploadOptions = {}): Promise<SessionView> {
  const retries = opts.retries ?? 5;
  const st = await stat(path);
  const fingerprint = fingerprintOf(st.size, st.mtimeMs);
  const fileName = path.split('/').pop()!;

  let session: SessionView;
  let have = new Set<number>();
  if (opts.sessionId) {
    const got = await getSession(server, opts.sessionId);
    session = got.session;
    if (session.fingerprint !== fingerprint) throw new ClientError(409, { error: 'file fingerprint changed' });
    have = new Set(got.parts.map((p) => p.partNumber));
  } else {
    session = (await call(`${server}/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fileName, fileSize: st.size, fingerprint }),
    })) as SessionView;
  }
  opts.onSession?.(session);
  if (session.state === 'COMPLETE') return session;

  const fh = await open(path, 'r');
  let sent = 0;
  const uploadParts = async (numbers: number[]) => {
    const queue = [...numbers];
    const worker = async () => {
      for (let n = queue.shift(); n !== undefined; n = queue.shift()) {
        if (opts.stopAfterParts !== undefined && sent >= opts.stopAfterParts) throw new SimulatedCrash('client stopped');
        const offset = (n - 1) * session.partSize;
        const len = Math.min(session.partSize, session.fileSize - offset);
        const buf = Buffer.alloc(len);
        await fh.read(buf, 0, len, offset);
        const crc = crc32(buf) >>> 0;
        await withRetry(retries, () =>
          call(`${server}/sessions/${session.id}/parts/${n}`, {
            method: 'PUT',
            headers: { 'x-part-crc32': String(crc), 'x-file-fingerprint': fingerprint },
            body: buf,
          }),
        );
        sent++;
        opts.onPart?.(n);
      }
    };
    await Promise.all(Array.from({ length: opts.concurrency ?? 4 }, worker));
  };

  try {
    const todo: number[] = [];
    for (let n = 1; n <= session.partCount; n++) if (!have.has(n)) todo.push(n);
    await uploadParts(todo);
    if (opts.stopAfterParts !== undefined) throw new SimulatedCrash('client stopped before complete');

    const sha256 = opts.claimSha256 === false ? undefined : await sha256File(path);
    for (let round = 0; round < 60; round++) {
      try {
        return (await withRetry(retries, () =>
          call(`${server}/sessions/${session.id}/complete`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ sha256 }),
          }),
        )) as SessionView;
      } catch (err) {
        if (!(err instanceof ClientError)) throw err;
        const detail = (err.body.detail ?? {}) as Record<string, unknown>;
        if (err.status === 409 && Array.isArray(detail.missing)) await uploadParts(detail.missing as number[]);
        else if (err.status === 422 && Array.isArray(detail.badParts)) await uploadParts(detail.badParts as number[]);
        else if (err.status === 409 && /in progress|in flight/.test(String(err.body.error))) await sleep(500);
        else throw err;
      }
    }
    throw new Error('complete did not converge');
  } finally {
    await fh.close();
  }
}
