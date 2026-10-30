import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { choosePartSize, loadConfig, type Config } from './config.ts';
import { Ledger, LedgerError, type Session } from './ledger.ts';
import { createStaging, exists, finalPathFor, LengthMismatch, publish, scanFile, stagingPath, writePart } from './storage.ts';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
// A writer aborts itself at writeLeaseMs; its ledger registration lasts this much longer so a
// finalizer can never start while the write might still be landing bytes.
const WRITE_LEASE_MARGIN_MS = 5_000;

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

  async function createSession(req: IncomingMessage, res: ServerResponse) {
    const body = await readJson(req);
    const fileName = String(body.fileName ?? '');
    const fileSize = Number(body.fileSize);
    const fingerprint = String(body.fingerprint ?? '');
    if (!fileName || basename(fileName) !== fileName || fileName.startsWith('.')) throw new HttpError(400, 'invalid fileName');
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

  async function putPart(id: string, n: number, req: IncomingMessage, res: ServerResponse) {
    const writerId = randomUUID();
    const s = ledger.beginWrite(id, n, writerId, Date.now() + cfg.writeLeaseMs + WRITE_LEASE_MARGIN_MS);
    try {
      if (!Number.isInteger(n) || n < 1 || n > s.partCount) throw new HttpError(400, 'invalid part number');
      const fp = req.headers['x-file-fingerprint'];
      if (fp !== undefined && fp !== s.fingerprint) throw new HttpError(409, 'file fingerprint changed');
      const expected = expectedPartSize(s, n);
      const declared = req.headers['x-part-crc32'];
      const signal = AbortSignal.timeout(cfg.writeLeaseMs);
      let written: { size: number; crc32: number };
      try {
        written = await writePart(stagingPath(cfg.dataDir, id), (n - 1) * s.partSize, expected, req, signal);
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
    const claimedSha256 = typeof body.sha256 === 'string' ? body.sha256.toLowerCase() : undefined;
    const claim = ledger.claimFinalize(id, instanceId, Date.now(), cfg.finalizeLeaseMs);
    if (!claim.ok) {
      if (claim.status === 200 && claim.session) return send(res, 200, view(claim.session));
      throw new HttpError(claim.status, claim.reason, claim.session ? view(claim.session) : undefined);
    }
    const s = claim.session;
    const staging = stagingPath(cfg.dataDir, id);
    const finalPath = finalPathFor(cfg.dataDir, id, s.fileName);

    // Recovery: a previous finalizer verified and renamed but did not record COMPLETE.
    if (s.verifiedSha256 && !(await exists(staging)) && (await exists(finalPath))) {
      const scan = await scanFile(finalPath, s.partSize);
      if (scan.sha256 === s.verifiedSha256 && scan.size === s.fileSize) {
        ledger.markComplete(id, instanceId);
      } else {
        ledger.markFailed(id, instanceId, 'published file does not match verified digest');
      }
      return send(res, 200, view(ledger.getSession(id)!));
    }
    if (!(await exists(staging))) {
      ledger.markFailed(id, instanceId, 'staging file missing');
      throw new HttpError(500, 'staging file missing');
    }

    const parts = ledger.parts(id);
    const have = new Map(parts.map((p) => [p.partNumber, p]));
    const missing: number[] = [];
    for (let n = 1; n <= s.partCount; n++) if (!have.has(n)) missing.push(n);
    if (missing.length) {
      ledger.reopenWithBadParts(id, instanceId, []);
      throw new HttpError(409, 'parts missing', { missing });
    }

    const scan = await scanFile(staging, s.partSize);
    const bad = parts.filter((p) => scan.partCrcs[p.partNumber - 1] !== p.crc32).map((p) => p.partNumber);
    if (bad.length || scan.size !== s.fileSize) {
      ledger.reopenWithBadParts(id, instanceId, bad);
      throw new HttpError(422, 'stored bytes do not match accepted parts', { badParts: bad });
    }
    if (claimedSha256 && claimedSha256 !== scan.sha256) {
      ledger.markFailed(id, instanceId, 'content differs from client digest (source file changed?)');
      throw new HttpError(422, 'sha256 mismatch', { claimed: claimedSha256, actual: scan.sha256 });
    }

    ledger.recordVerified(id, instanceId, scan.sha256, finalPath);
    fault('before-publish');
    try {
      await publish(staging, finalPath);
    } catch (err) {
      // Another finalizer whose lease expired under us may already have published.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT' || !(await exists(finalPath))) throw err;
    }
    fault('after-publish');
    ledger.markComplete(id, instanceId);
    send(res, 200, view(ledger.getSession(id)!));
  }

  async function abort(id: string, res: ServerResponse) {
    const s = ledger.abort(id);
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
    if (seg.length === 4 && seg[2] === 'parts' && m === 'PUT') return putPart(id, Number(seg[3]), req, res);
    throw new HttpError(404, 'not found');
  }

  const server = createServer((req, res) => {
    route(req, res).catch((err: unknown) => {
      const status = err instanceof HttpError || err instanceof LedgerError ? err.status : 500;
      const body = err instanceof HttpError ? err.body : undefined;
      if (status === 500) console.error(err);
      if (res.headersSent) return res.destroy();
      // The request body may still be streaming; don't let it keep the socket busy.
      res.setHeader('connection', 'close');
      send(res, status, { error: (err as Error).message, detail: body });
    });
  });
  return { server, ledger, instanceId };
}

// Aborts UPLOADING sessions older than maxAgeMs and removes their staging files.
export async function cleanupExpired(cfg: Config, ledger: Ledger, maxAgeMs: number, now = Date.now()): Promise<string[]> {
  const aborted: string[] = [];
  for (const s of ledger.listSessions()) {
    if (s.state === 'UPLOADING' && now - s.createdAt > maxAgeMs) {
      ledger.abort(s.id);
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
