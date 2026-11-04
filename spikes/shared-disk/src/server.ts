import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { choosePartSize, loadConfig, type Config } from './config.ts';
import { Ledger, LedgerError, type Session } from './ledger.ts';
import { createStaging, exists, finalPathFor, LengthMismatch, publish, scanFile, stagingPath, writePart } from './storage.ts';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const SHA256_HEX = /^[0-9a-f]{64}$/i;
const CLIENT_ABORT_CODES = new Set(['ECONNRESET', 'ERR_STREAM_PREMATURE_CLOSE', 'ECONNABORTED']);

// Names must be a single path segment the filesystem will accept and safe to echo.
function validFileName(name: string): boolean {
  return (
    name.length > 0 &&
    Buffer.byteLength(name) <= 255 &&
    basename(name) === name &&
    !name.startsWith('.') &&
    !/[\u0000-\u001f\u007f]/.test(name)
  );
}

class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function send(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
  res.end(text);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > 64 * 1024) throw new HttpError(413, 'json body too large');
    chunks.push(chunk);
  }
  try {
    return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
  } catch {
    throw new HttpError(400, 'invalid json');
  }
}

function view(s: Session) {
  return {
    id: s.id,
    fileName: s.fileName,
    fileSize: s.fileSize,
    partSize: s.partSize,
    partCount: s.partCount,
    fingerprint: s.fingerprint,
    state: s.state,
    verifiedSha256: s.verifiedSha256,
    failure: s.failure,
  };
}

function expectedPartSize(s: Session, n: number): number {
  return n < s.partCount ? s.partSize : s.fileSize - s.partSize * (s.partCount - 1);
}

export function createApp(cfg: Config): { server: Server; ledger: Ledger; instanceId: string } {
  const ledger = new Ledger(cfg.ledgerPath);
  const instanceId = randomUUID();

  const fault = (point: string) => {
    if (cfg.fault === point) {
      // Simulates a crash at a precise point: no cleanup, no response.
      process.kill(process.pid, 'SIGKILL');
    }
  };
  // Test-only: makes a phase slow so overlapping requests can be exercised deterministically.
  const slow = async (point: string) => {
    if (cfg.fault === point) await sleep(1500);
  };

  async function createSession(req: IncomingMessage, res: ServerResponse) {
    const body = await readJson(req);
    const fileName = String(body.fileName ?? '');
    const fileSize = Number(body.fileSize);
    const fingerprint = String(body.fingerprint ?? '');
    if (!validFileName(fileName)) throw new HttpError(400, 'invalid fileName');
    if (!Number.isSafeInteger(fileSize) || fileSize <= 0) throw new HttpError(400, 'invalid fileSize');
    const partSize = choosePartSize(fileSize, cfg);
    const partCount = Math.ceil(fileSize / partSize);
    if (partCount > cfg.maxParts) throw new HttpError(400, 'file too large for part limit');
    const id = randomUUID();
    await createStaging(cfg.dataDir, id, fileSize);
    ledger.createSession({ id, fileName, fileSize, partSize, partCount, fingerprint, createdAt: Date.now() });
    send(res, 201, view(ledger.getSession(id)!));
  }

  function getSession(id: string, res: ServerResponse) {
    const s = ledger.getSession(id);
    if (!s) throw new HttpError(404, 'no such session');
    send(res, 200, { session: view(s), parts: ledger.parts(id) });
  }

  async function putPart(id: string, rawPart: string, req: IncomingMessage, res: ServerResponse) {
    const n = /^[0-9]+$/.test(rawPart) ? Number(rawPart) : NaN;
    const known = ledger.getSession(id);
    if (!known) throw new HttpError(404, 'no such session');
    if (!Number.isSafeInteger(n) || n < 1 || n > known.partCount) throw new HttpError(400, 'invalid part number');
    const writerId = randomUUID();
    const s = ledger.beginWrite(id, n, writerId, Date.now() + cfg.writeLeaseMs);
    const heartbeatMs = Math.max(100, Math.floor(cfg.writeLeaseMs / 3));
    const renew = () => {
      if (!ledger.renewWrite(writerId, Date.now(), Date.now() + cfg.writeLeaseMs)) throw new HttpError(409, 'write lease lost');
    };
    try {
      const fp = req.headers['x-file-fingerprint'];
      if (fp !== undefined && fp !== s.fingerprint) throw new HttpError(409, 'file fingerprint changed');
      const expected = expectedPartSize(s, n);
      const declared = req.headers['x-part-crc32'];
      let written: { size: number; crc32: number };
      try {
        written = await writePart(stagingPath(cfg.dataDir, id), (n - 1) * s.partSize, expected, req, renew, heartbeatMs);
      } catch (err) {
        if (err instanceof LengthMismatch) throw new HttpError(400, err.message);
        throw err;
      }
      if (declared !== undefined && Number(declared) !== written.crc32) {
        throw new HttpError(422, 'crc32 mismatch', { expected: Number(declared), actual: written.crc32 });
      }
      fault('after-part-write');
      ledger.acceptPart(id, writerId, { partNumber: n, size: written.size, crc32: written.crc32 });
      send(res, 200, { partNumber: n, size: written.size, crc32: written.crc32 });
    } finally {
      ledger.endWrite(writerId);
    }
  }

  async function complete(id: string, req: IncomingMessage, res: ServerResponse) {
    const body = await readJson(req);
    // The digest is mandatory: it is the only check that the bytes the client sent are the bytes of
    // the source file it claims, so a client that cannot produce one cannot complete.
    if (typeof body.sha256 !== 'string' || !SHA256_HEX.test(body.sha256)) throw new HttpError(400, 'sha256 (64 hex chars) is required');
    const claimedSha256 = body.sha256.toLowerCase();
    const token = randomUUID(); // per claim, not per process: a retry through this process is a different claim
    const claim = ledger.claimFinalize(id, token, Date.now(), cfg.finalizeLeaseMs);
    if (!claim.ok) {
      if (claim.status === 200 && claim.session) return send(res, 200, view(claim.session));
      throw new HttpError(claim.status, claim.reason, claim.session ? view(claim.session) : undefined);
    }
    try {
      await finalize(id, token, claimedSha256, res);
    } catch (err) {
      // Our claim may have been superseded after the file was already published and recorded.
      if (err instanceof LedgerError && err.status === 409) {
        const now = ledger.getSession(id);
        if (now?.state === 'COMPLETE') return send(res, 200, view(now));
      }
      throw err;
    }
  }

  async function finalize(id: string, token: string, claimedSha256: string, res: ServerResponse) {
    const s = ledger.getSession(id)!;
    const staging = stagingPath(cfg.dataDir, id);
    const finalPath = finalPathFor(cfg.dataDir, id, s.fileName);
    await slow('slow-scan');

    // Recovery: a previous finalizer verified and renamed but did not record COMPLETE.
    if (s.verifiedSha256 && !(await exists(staging)) && (await exists(finalPath))) {
      const scan = await scanFile(finalPath, s.partSize);
      if (scan.sha256 === s.verifiedSha256 && scan.size === s.fileSize) {
        ledger.markComplete(id, token);
      } else {
        ledger.markFailed(id, token, 'published file does not match verified digest');
      }
      return send(res, 200, view(ledger.getSession(id)!));
    }
    if (!(await exists(staging))) {
      ledger.markFailed(id, token, 'staging file missing');
      throw new HttpError(500, 'staging file missing');
    }

    const parts = ledger.parts(id);
    const have = new Map(parts.map((p) => [p.partNumber, p]));
    const missing: number[] = [];
    for (let n = 1; n <= s.partCount; n++) if (!have.has(n)) missing.push(n);
    if (missing.length) {
      ledger.reopenWithBadParts(id, token, []);
      throw new HttpError(409, 'parts missing', { missing });
    }

    const scan = await scanFile(staging, s.partSize);
    const bad = parts.filter((p) => scan.partCrcs[p.partNumber - 1] !== p.crc32).map((p) => p.partNumber);
    if (bad.length || scan.size !== s.fileSize) {
      ledger.reopenWithBadParts(id, token, bad);
      throw new HttpError(422, 'stored bytes do not match accepted parts', { badParts: bad });
    }
    if (claimedSha256 !== scan.sha256) {
      ledger.markFailed(id, token, 'content differs from client digest (source file changed?)');
      throw new HttpError(422, 'sha256 mismatch', { claimed: claimedSha256, actual: scan.sha256 });
    }

    ledger.recordVerified(id, token, scan.sha256, finalPath);
    fault('before-publish');
    // Residual hazard, deliberately documented rather than detected: the write fence (ledger
    // registration renewed before every write) stops any write that starts after the claim, but a
    // single write call that stalls longer than writeLeaseMs could still land after the scan. An
    // mtime/size comparison around the scan was tried and rejected: on SMB, merely reading the file
    // moves its mtime, so it reported healthy uploads as modified.
    try {
      await publish(staging, finalPath);
    } catch (err) {
      // Another finalizer whose lease expired under us may already have published.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT' || !(await exists(finalPath))) throw err;
    }
    fault('after-publish');
    ledger.markComplete(id, token);
    send(res, 200, view(ledger.getSession(id)!));
  }

  async function abort(id: string, res: ServerResponse) {
    const s = ledger.abort(id); // throws 409 while FINALIZING or COMPLETE
    await rm(stagingPath(cfg.dataDir, id), { force: true });
    send(res, 200, view(s));
  }

  async function serveStatic(path: string, res: ServerResponse) {
    const name = path === '/' ? 'index.html' : path.slice(1);
    if (!/^[a-z0-9-]+\.(html|js)$/.test(name)) throw new HttpError(404, 'not found');
    const text = await readFile(join(PUBLIC_DIR, name)).catch(() => {
      throw new HttpError(404, 'not found');
    });
    res.writeHead(200, { 'content-type': name.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript' });
    res.end(text);
  }

  async function route(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const seg = url.pathname.split('/').filter(Boolean);
    const m = req.method;
    if (seg[0] !== 'sessions') {
      if (m === 'GET') return serveStatic(url.pathname, res);
      throw new HttpError(404, 'not found');
    }
    if (seg.length === 1 && m === 'POST') return createSession(req, res);
    const id = seg[1];
    if (seg.length === 2 && m === 'GET') return getSession(id, res);
    if (seg.length === 2 && m === 'DELETE') return abort(id, res);
    if (seg.length === 3 && seg[2] === 'complete' && m === 'POST') return complete(id, req, res);
    if (seg.length === 4 && seg[2] === 'parts' && m === 'PUT') return putPart(id, seg[3], req, res);
    throw new HttpError(404, 'not found');
  }

  const server = createServer((req, res) => {
    route(req, res).catch((err: unknown) => {
      const code = (err as NodeJS.ErrnoException).code;
      // A request destroyed before its body completed means the client went away; a fully read request is
      // destroyed automatically by Node and must still get its error response.
      if ((code && CLIENT_ABORT_CODES.has(code)) || (req.destroyed && !req.complete)) return res.destroy();
      const status = err instanceof HttpError || err instanceof LedgerError ? err.status : 500;
      const body = err instanceof HttpError ? err.body : undefined;
      if (status === 500) console.error(err);
      if (res.headersSent) return res.destroy();
      // Discard whatever part of the request body is still arriving so the client reads our status
      // instead of a connection reset; the connection stays usable.
      if (!req.complete) req.resume();
      // 500 bodies never echo internals (paths, SQL); details stay in the server log.
      send(res, status, { error: status === 500 ? 'internal error' : (err as Error).message, detail: body });
    });
  });
  return { server, ledger, instanceId };
}

// Aborts UPLOADING sessions idle for longer than maxIdleMs and removes their staging files. The
// abort is conditional in the ledger, so a session that is finalizing or still receiving is spared.
export async function cleanupExpired(cfg: Config, ledger: Ledger, maxIdleMs: number, now = Date.now()): Promise<string[]> {
  const aborted: string[] = [];
  for (const s of ledger.listSessions()) {
    if (s.state === 'UPLOADING' && ledger.abortIfStale(s.id, now - maxIdleMs, now)) {
      await rm(stagingPath(cfg.dataDir, s.id), { force: true });
      aborted.push(s.id);
    }
  }
  return aborted;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cfg = loadConfig();
  const { server } = createApp(cfg);
  server.listen(cfg.port, () => {
    console.log(`listening on http://localhost:${cfg.port} data=${cfg.dataDir} ledger=${cfg.ledgerPath}`);
  });
}
