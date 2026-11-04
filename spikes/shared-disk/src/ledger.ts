import { DatabaseSync } from 'node:sqlite';

// The ledger is the durable truth for sessions and accepted parts. Several server processes may
// share one ledger file; every state transition runs in a BEGIN IMMEDIATE transaction.

export type SessionState = 'UPLOADING' | 'FINALIZING' | 'COMPLETE' | 'ABORTED' | 'FAILED';

export type Session = {
  id: string;
  fileName: string;
  fileSize: number;
  partSize: number;
  partCount: number;
  fingerprint: string;
  state: SessionState;
  finalizeOwner: string | null;
  finalizeLeaseUntil: number | null;
  verifiedSha256: string | null;
  finalPath: string | null;
  failure: string | null;
  createdAt: number;
  lastActivity: number;
};

export type Part = { partNumber: number; size: number; crc32: number };

type Row = Record<string, unknown>;

function toSession(r: Row): Session {
  return {
    id: r.id as string,
    fileName: r.file_name as string,
    fileSize: Number(r.file_size),
    partSize: Number(r.part_size),
    partCount: Number(r.part_count),
    fingerprint: r.fingerprint as string,
    state: r.state as SessionState,
    finalizeOwner: (r.finalize_owner as string | null) ?? null,
    finalizeLeaseUntil: r.finalize_lease_until == null ? null : Number(r.finalize_lease_until),
    verifiedSha256: (r.verified_sha256 as string | null) ?? null,
    finalPath: (r.final_path as string | null) ?? null,
    failure: (r.failure as string | null) ?? null,
    createdAt: Number(r.created_at),
    lastActivity: Number(r.last_activity),
  };
}

export class Ledger {
  readonly db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    // Several server processes may open one ledger at the same moment. SQLite can answer "database is
    // locked" immediately (without waiting out busy_timeout) for the journal-mode switch and for lock
    // upgrades, so initialization, which is idempotent, is retried briefly instead of failing the start.
    for (let attempt = 0; ; attempt++) {
      try {
        this.init();
        return;
      } catch (err) {
        if (attempt >= 100 || !/database is locked|SQLITE_BUSY/i.test(String((err as Error).message))) throw err;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25 + Math.floor(Math.random() * 75));
      }
    }
  }

  private init(): void {
    this.db.exec(`
      PRAGMA busy_timeout = 10000;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        part_size INTEGER NOT NULL,
        part_count INTEGER NOT NULL,
        fingerprint TEXT NOT NULL,
        state TEXT NOT NULL,
        finalize_owner TEXT,
        finalize_lease_until INTEGER,
        verified_sha256 TEXT,
        final_path TEXT,
        failure TEXT,
        created_at INTEGER NOT NULL,
        last_activity INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS parts (
        session_id TEXT NOT NULL,
        part_number INTEGER NOT NULL,
        size INTEGER NOT NULL,
        crc32 INTEGER NOT NULL,
        PRIMARY KEY (session_id, part_number)
      );
      CREATE TABLE IF NOT EXISTS writes_in_flight (
        writer_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        part_number INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      );
    `);
    this.migrate();
  }

  // Ledgers created before `last_activity` existed: add the column and age those sessions from creation.
  // The column check runs inside the same transaction as the ALTER, so two processes starting at once
  // on an old ledger cannot both decide to add it (the loser would fail with "duplicate column name").
  private migrate(): void {
    this.tx(() => {
      const cols = (this.db.prepare('PRAGMA table_info(sessions)').all() as Row[]).map((c) => c.name);
      if (cols.includes('last_activity')) return;
      this.db.exec('ALTER TABLE sessions ADD COLUMN last_activity INTEGER NOT NULL DEFAULT 0');
      this.db.exec('UPDATE sessions SET last_activity = created_at');
    });
  }

  close(): void {
    this.db.close();
  }

  tx<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  createSession(
    s: Omit<Session, 'state' | 'finalizeOwner' | 'finalizeLeaseUntil' | 'verifiedSha256' | 'finalPath' | 'failure' | 'lastActivity'>,
  ): void {
    this.db
      .prepare(
        `INSERT INTO sessions (id, file_name, file_size, part_size, part_count, fingerprint, state, created_at, last_activity)
         VALUES (?, ?, ?, ?, ?, ?, 'UPLOADING', ?, ?)`,
      )
      .run(s.id, s.fileName, s.fileSize, s.partSize, s.partCount, s.fingerprint, s.createdAt, s.createdAt);
  }

  getSession(id: string): Session | undefined {
    const row = this.db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Row | undefined;
    return row ? toSession(row) : undefined;
  }

  listSessions(): Session[] {
    return (this.db.prepare('SELECT * FROM sessions').all() as Row[]).map(toSession);
  }

  parts(sessionId: string): Part[] {
    return (
      this.db
        .prepare('SELECT part_number, size, crc32 FROM parts WHERE session_id = ? ORDER BY part_number')
        .all(sessionId) as Row[]
    ).map((r) => ({ partNumber: Number(r.part_number), size: Number(r.size), crc32: Number(r.crc32) }));
  }

  // Registers a part write. Fails unless the session is still UPLOADING, so no write can start
  // after a finalizer has claimed the session.
  beginWrite(sessionId: string, partNumber: number, writerId: string, expiresAt: number): Session {
    return this.tx(() => {
      const s = this.getSession(sessionId);
      if (!s) throw new LedgerError(404, 'no such session');
      if (s.state !== 'UPLOADING') throw new LedgerError(409, `session is ${s.state}`);
      this.db
        .prepare('INSERT INTO writes_in_flight (writer_id, session_id, part_number, expires_at) VALUES (?, ?, ?, ?)')
        .run(writerId, sessionId, partNumber, expiresAt);
      return s;
    });
  }

  // Extends a live write registration. Returns false when the registration is gone or expired, or
  // the session is no longer UPLOADING (a finalizer claimed it). A writer must call this
  // immediately before every disk write and before its fsync, and stop on false: this is the fence
  // that keeps a write from landing after finalization. It bounds, but cannot remove, the risk of
  // a single write call stalling longer than the lease (documented limit).
  renewWrite(writerId: string, now: number, newExpiresAt: number): boolean {
    return this.tx(() => {
      const r = this.db
        .prepare(
          `UPDATE writes_in_flight SET expires_at = ?
           WHERE writer_id = ? AND expires_at > ?
             AND EXISTS (SELECT 1 FROM sessions s WHERE s.id = writes_in_flight.session_id AND s.state = 'UPLOADING')`,
        )
        .run(newExpiresAt, writerId, now);
      return Number(r.changes) > 0;
    });
  }

  endWrite(writerId: string): void {
    this.db.prepare('DELETE FROM writes_in_flight WHERE writer_id = ?').run(writerId);
  }

  // Records an accepted part and releases the write registration in one transaction.
  acceptPart(sessionId: string, writerId: string, part: Part): void {
    this.tx(() => {
      const s = this.getSession(sessionId);
      if (!s || s.state !== 'UPLOADING') throw new LedgerError(409, `session is ${s?.state ?? 'missing'}`);
      this.db
        .prepare(
          `INSERT INTO parts (session_id, part_number, size, crc32) VALUES (?, ?, ?, ?)
           ON CONFLICT (session_id, part_number) DO UPDATE SET size = excluded.size, crc32 = excluded.crc32`,
        )
        .run(sessionId, part.partNumber, part.size, part.crc32);
      this.db.prepare('UPDATE sessions SET last_activity = ? WHERE id = ?').run(Date.now(), sessionId);
      this.endWrite(writerId);
    });
  }

  // Claims the session for finalization under a fresh per-claim token. While another claim's lease
  // is live nobody else may claim, including a retry of the same request through the same process.
  claimFinalize(
    sessionId: string,
    token: string,
    now: number,
    leaseMs: number,
  ): { ok: true; session: Session } | { ok: false; status: number; reason: string; session?: Session } {
    return this.tx(() => {
      const s = this.getSession(sessionId);
      if (!s) return { ok: false, status: 404, reason: 'no such session' };
      if (s.state === 'COMPLETE') return { ok: false, status: 200, reason: 'already complete', session: s };
      if (s.state === 'ABORTED' || s.state === 'FAILED') return { ok: false, status: 409, reason: `session is ${s.state}`, session: s };
      if (s.state === 'FINALIZING' && (s.finalizeLeaseUntil ?? 0) > now) {
        return { ok: false, status: 409, reason: 'finalization in progress elsewhere', session: s };
      }
      const live = this.db
        .prepare('SELECT COUNT(*) AS n FROM writes_in_flight WHERE session_id = ? AND expires_at > ?')
        .get(sessionId, now) as Row;
      if (Number(live.n) > 0) return { ok: false, status: 409, reason: 'part writes still in flight', session: s };
      this.db
        .prepare(`UPDATE sessions SET state = 'FINALIZING', finalize_owner = ?, finalize_lease_until = ? WHERE id = ?`)
        .run(token, now + leaseMs, sessionId);
      return { ok: true, session: this.getSession(sessionId)! };
    });
  }

  private ownedUpdate(sessionId: string, token: string, sql: string, ...params: (string | number | null)[]): void {
    this.tx(() => {
      const s = this.getSession(sessionId);
      if (!s || s.state !== 'FINALIZING' || s.finalizeOwner !== token) {
        throw new LedgerError(409, 'lost finalization ownership');
      }
      this.db.prepare(sql).run(...params, sessionId);
    });
  }

  recordVerified(sessionId: string, token: string, sha256: string, finalPath: string): void {
    this.ownedUpdate(sessionId, token, 'UPDATE sessions SET verified_sha256 = ?, final_path = ? WHERE id = ?', sha256, finalPath);
  }

  // Idempotent: a session already COMPLETE (e.g. completed by the claim that this request lost) stays so.
  markComplete(sessionId: string, token: string): void {
    this.tx(() => {
      const s = this.getSession(sessionId);
      if (s?.state === 'COMPLETE') return;
      if (!s || s.state !== 'FINALIZING' || s.finalizeOwner !== token) throw new LedgerError(409, 'lost finalization ownership');
      this.db
        .prepare(`UPDATE sessions SET state = 'COMPLETE', finalize_owner = NULL, finalize_lease_until = NULL WHERE id = ?`)
        .run(sessionId);
    });
  }

  // Verification found bad parts: drop them and return the session to UPLOADING for re-upload.
  reopenWithBadParts(sessionId: string, token: string, badParts: number[]): void {
    this.tx(() => {
      const s = this.getSession(sessionId);
      if (!s || s.state !== 'FINALIZING' || s.finalizeOwner !== token) throw new LedgerError(409, 'lost finalization ownership');
      const del = this.db.prepare('DELETE FROM parts WHERE session_id = ? AND part_number = ?');
      for (const n of badParts) del.run(sessionId, n);
      this.db
        .prepare(`UPDATE sessions SET state = 'UPLOADING', finalize_owner = NULL, finalize_lease_until = NULL, verified_sha256 = NULL, final_path = NULL WHERE id = ?`)
        .run(sessionId);
    });
  }

  markFailed(sessionId: string, token: string, failure: string): void {
    this.ownedUpdate(sessionId, token, `UPDATE sessions SET state = 'FAILED', failure = ?, finalize_owner = NULL, finalize_lease_until = NULL WHERE id = ?`, failure);
  }

  // Refused while FINALIZING: a finalizer may be about to publish. A dead finalizer is recovered by
  // calling complete again once its lease expires, not by abort.
  abort(sessionId: string): Session {
    return this.tx(() => {
      const s = this.getSession(sessionId);
      if (!s) throw new LedgerError(404, 'no such session');
      if (s.state === 'COMPLETE' || s.state === 'FINALIZING') throw new LedgerError(409, `session is ${s.state}`);
      if (s.state === 'UPLOADING') this.db.prepare(`UPDATE sessions SET state = 'ABORTED' WHERE id = ?`).run(sessionId);
      return this.getSession(sessionId)!;
    });
  }

  // Aborts only if still UPLOADING, idle since before `cutoff`, and with no live write. One
  // transaction, so a session that just started finalizing or receiving parts is never aborted.
  abortIfStale(sessionId: string, cutoff: number, now: number): boolean {
    return this.tx(() => {
      const r = this.db
        .prepare(
          `UPDATE sessions SET state = 'ABORTED'
           WHERE id = ? AND state = 'UPLOADING' AND last_activity < ?
             AND NOT EXISTS (SELECT 1 FROM writes_in_flight w WHERE w.session_id = sessions.id AND w.expires_at > ?)`,
        )
        .run(sessionId, cutoff, now);
      return Number(r.changes) > 0;
    });
  }
}

export class LedgerError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
