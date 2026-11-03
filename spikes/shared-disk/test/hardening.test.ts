import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { request } from 'node:http';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { createHash } from 'node:crypto';
import { getSession, sha256File, uploadFile } from '../src/client.ts';
import { loadConfig } from '../src/config.ts';
import { Ledger } from '../src/ledger.ts';
import { cleanupExpired } from '../src/server.ts';
import { stagingPath } from '../src/storage.ts';
import { Sha256 } from '../public/sha256.js';
import { completeRaw, crashedUpload, dropEnv, makeEnv, makeFile, PART, shasum, startServer, stopServer, type Env, type Running } from './helpers.ts';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SIZE = PART * 10 + 1234;
const LAST = SIZE - PART * 10; // size of part 11

async function createRaw(url: string, fileName: string, size = SIZE) {
  return fetch(`${url}/sessions`, { method: 'POST', body: JSON.stringify({ fileName, fileSize: size, fingerprint: 'x' }) });
}

describe('input validation and error behaviour', () => {
  let env: Env;
  let srv: Running;
  let file: string;
  beforeEach(async () => {
    env = await makeEnv('hard');
    srv = await startServer(env);
    file = await makeFile(env.local, SIZE);
  });
  afterEach(async () => {
    await stopServer(srv);
    await dropEnv(env);
  });

  test('complete requires a well-formed sha256', async () => {
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 11 });
    for (const body of ['{}', '{"sha256":""}', '{"sha256":"abc"}', '{"sha256":123}']) {
      const res = await fetch(`${srv.url}/sessions/${id}/complete`, { method: 'POST', body });
      assert.equal(res.status, 400, body);
    }
    assert.equal((await getSession(srv.url, id)).session.state, 'UPLOADING', 'rejected requests claim nothing');
    assert.equal((await completeRaw(srv.url, id, file)).status, 200);
  });

  test('file names that could never be published are rejected at create', async () => {
    for (const name of ['a\u0000b', 'a\u001fb', 'x'.repeat(256), '', '.hidden', 'a/b', '..']) {
      assert.equal((await createRaw(srv.url, name)).status, 400, JSON.stringify(name).slice(0, 30));
    }
    assert.equal((await createRaw(srv.url, 'é'.repeat(127))).status, 201, '254 bytes is fine');
  });

  test('invalid part numbers are 400, never 500', async () => {
    const { id } = await (await createRaw(srv.url, 'p.bin')).json();
    for (const n of ['abc', '0', '-1', '1.5', '12', '99999999999999999999']) {
      const res = await fetch(`${srv.url}/sessions/${id}/parts/${n}`, { method: 'PUT', body: Buffer.alloc(10) });
      assert.equal(res.status, 400, n);
    }
  });

  test('error responses never echo server paths', async () => {
    const res = await fetch(`${srv.url}/sessions/does-not-exist/parts/1`, { method: 'PUT', body: Buffer.alloc(10) });
    const text = await res.text();
    assert.equal(res.status, 404);
    assert.ok(!text.includes(env.dataDir) && !text.includes('/private/'));
  });

  test('a rejected part PUT delivers its status instead of a connection reset', async () => {
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 1 });
    assert.equal((await fetch(`${srv.url}/sessions/${id}`, { method: 'DELETE' })).status, 200);
    const body = (await readFile(file)).subarray(0, PART);
    const res = await fetch(`${srv.url}/sessions/${id}/parts/2`, { method: 'PUT', body });
    assert.equal(res.status, 409);
  });
});

describe('fencing, ownership and lifecycle races', () => {
  let env: Env;
  let file: string;
  const running: Running[] = [];
  const start = async (extra: Record<string, string> = {}) => {
    const r = await startServer(env, extra);
    running.push(r);
    return r;
  };
  beforeEach(async () => {
    env = await makeEnv('race');
    file = await makeFile(env.local, SIZE);
  });
  afterEach(async () => {
    for (const r of running.splice(0)) await stopServer(r);
    await dropEnv(env);
  });

  test('a part write whose lease expired cannot land after finalization claimed the session', async () => {
    const srv = await start({ SPIKE_WRITE_LEASE_MS: '500' });
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 10 }); // part 11 still missing
    const bytes = (await readFile(file)).subarray(PART * 10);
    const stalled = new Promise<number>((resolve, reject) => {
      const req = request(`${srv.url}/sessions/${id}/parts/11`, { method: 'PUT', headers: { 'content-length': String(LAST) } }, (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      });
      req.on('error', reject);
      req.write(bytes.subarray(0, 100));
      setTimeout(() => req.end(bytes.subarray(100)), 1200); // resumes after the lease lapsed
    });
    await new Promise((r) => setTimeout(r, 800)); // lease (500 ms) expired, write still open
    const res = await completeRaw(srv.url, id, file);
    assert.equal(res.status, 409, 'finalizer proceeds past the expired registration and finds the part missing');
    assert.deepEqual((await res.json()).detail, { missing: [11] });
    assert.equal(await stalled, 409, 'the stalled writer is refused instead of landing its bytes');
    assert.deepEqual((await getSession(srv.url, id)).parts.map((p) => p.partNumber).includes(11), false);
    const staged = await readFile(stagingPath(env.dataDir, id));
    assert.ok(staged.subarray(PART * 10).every((b) => b === 0), 'no byte of part 11 reached the staging file');
  });

  test('a retry through the same process cannot become a second concurrent finalizer', async () => {
    const srv = await start({ SPIKE_FAULT: 'slow-scan' });
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 11 });
    const results = await Promise.all([completeRaw(srv.url, id, file), completeRaw(srv.url, id, file)]);
    const statuses = results.map((r) => r.status).sort();
    assert.deepEqual(statuses, [200, 409]);
    const loser = results.find((r) => r.status === 409)!;
    assert.match(String((await loser.json()).error), /in progress/);
    assert.deepEqual(await readdir(join(env.dataDir, 'final', id)), ['source.bin']);
    assert.equal((await getSession(srv.url, id)).session.state, 'COMPLETE');
  });

  test('abort is refused while FINALIZING and the upload still completes', async () => {
    const srv = await start({ SPIKE_FAULT: 'slow-scan' });
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 11 });
    const completing = completeRaw(srv.url, id, file);
    await new Promise((r) => setTimeout(r, 400));
    assert.equal((await fetch(`${srv.url}/sessions/${id}`, { method: 'DELETE' })).status, 409);
    assert.equal((await completing).status, 200);
    assert.equal(await shasum(join(env.dataDir, 'final', id, 'source.bin')), await shasum(file));
    assert.equal((await getSession(srv.url, id)).session.state, 'COMPLETE');
  });

  test('stale cleanup spares active and finalizing sessions, and ages from last activity', async () => {
    const srv = await start({ SPIKE_FAULT: 'slow-scan' });
    const active = await crashedUpload(srv.url, file, { stopAfterParts: 2 });
    const finalizing = await crashedUpload(srv.url, await makeFile(env.local, SIZE, 'other.bin'), { stopAfterParts: 11 });
    const cfg = loadConfig({ SPIKE_DATA_DIR: env.dataDir, SPIKE_LEDGER: env.ledger });
    const ledger = new Ledger(cfg.ledgerPath);
    try {
      const completing = completeRaw(srv.url, finalizing, join(env.local, 'other.bin'));
      await new Promise((r) => setTimeout(r, 400));
      const now = Date.now();
      assert.deepEqual(await cleanupExpired(cfg, ledger, 60_000, now), [], 'recently active session is not aged out');
      assert.deepEqual(await cleanupExpired(cfg, ledger, 60_000, now + 120_000), [active], 'idle session is aborted, finalizing one is spared');
      assert.equal(ledger.getSession(finalizing)?.state, 'FINALIZING');
      assert.equal((await completing).status, 200);
    } finally {
      ledger.close();
    }
  });
});

describe('browser SHA-256 implementation', () => {
  test('matches node:crypto for known vectors and random chunkings', async () => {
    assert.equal(new Sha256().hex(), createHash('sha256').update('').digest('hex'));
    assert.equal(new Sha256().update(new TextEncoder().encode('abc')).hex(), createHash('sha256').update('abc').digest('hex'));
    for (const len of [1, 55, 56, 63, 64, 65, 119, 120, 128, 1000, 70_001]) {
      const data = Buffer.alloc(len);
      for (let i = 0; i < len; i++) data[i] = (i * 31 + len) & 0xff;
      const h = new Sha256();
      for (let pos = 0; pos < len; ) {
        const step = 1 + ((pos * 7 + len) % 97);
        h.update(data.subarray(pos, pos + step));
        pos += step;
      }
      assert.equal(h.hex(), createHash('sha256').update(data).digest('hex'), `length ${len}`);
    }
  });

  test('hashes a file the way the server expects', async () => {
    const env = await makeEnv('sha');
    try {
      const file = await makeFile(env.local, 300_000);
      const h = new Sha256();
      h.update(new Uint8Array(await readFile(file)));
      assert.equal(h.hex(), await sha256File(file));
    } finally {
      await dropEnv(env);
    }
  });
});
