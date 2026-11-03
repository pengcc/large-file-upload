import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { getSession, uploadFile } from '../src/client.ts';
import { loadConfig } from '../src/config.ts';
import { Ledger } from '../src/ledger.ts';
import { cleanupExpired } from '../src/server.ts';
import { exists, stagingPath } from '../src/storage.ts';
import { completeRaw, crashedUpload, dropEnv, finalFile, makeEnv, makeFile, PART, shasum, startServer, stopServer, type Env, type Running } from './helpers.ts';

const SIZE = PART * 10 + 1234;
// Short leases so takeover after a crashed writer or finalizer happens within the test.
const LEASES = { SPIKE_WRITE_LEASE_MS: '500', SPIKE_FINALIZE_LEASE_MS: '1000' };

describe('crash and concurrency scenarios', () => {
  let env: Env;
  let file: string;
  const running: Running[] = [];
  const start = async (extra: Record<string, string> = {}) => {
    const r = await startServer(env, { ...LEASES, ...extra });
    running.push(r);
    return r;
  };

  beforeEach(async () => {
    env = await makeEnv('fault');
    file = await makeFile(env.local, SIZE);
  });
  afterEach(async () => {
    for (const r of running.splice(0)) await stopServer(r);
    await dropEnv(env);
  });

  test('server killed after writing a part but before recording it: part is re-sent after restart', async () => {
    const dying = await start({ SPIKE_FAULT: 'after-part-write' });
    let id = '';
    const err = await uploadFile(dying.url, file, { concurrency: 1, retries: 0, onSession: (s) => (id = s.id) }).catch((e) => e);
    assert.ok(err instanceof Error);
    await dying.exited;
    const srv = await start();
    assert.deepEqual((await getSession(srv.url, id)).parts, [], 'unrecorded write is not trusted');
    // Completion waits for the dead writer's in-flight registration to expire.
    const s = await uploadFile(srv.url, file, { sessionId: id });
    assert.equal(s.state, 'COMPLETE');
    assert.equal(await shasum(finalFile(env, id)), await shasum(file));
  });

  test('finalizer killed after verification, before publish: another attempt completes after lease expiry', async () => {
    const dying = await start({ SPIKE_FAULT: 'before-publish' });
    const id = await crashedUpload(dying.url, file, { stopAfterParts: 11 });
    const lost = await completeRaw(dying.url, id, file).catch((e) => e);
    assert.ok(lost instanceof Error, 'response lost');
    await dying.exited;
    const srv = await start();
    const s = await uploadFile(srv.url, file, { sessionId: id });
    assert.equal(s.state, 'COMPLETE');
    assert.equal(await shasum(finalFile(env, id)), await shasum(file));
  });

  test('finalizer killed after publish, before recording COMPLETE: retry converges without re-upload', async () => {
    const dying = await start({ SPIKE_FAULT: 'after-publish' });
    const id = await crashedUpload(dying.url, file, { stopAfterParts: 11 });
    const lost = await completeRaw(dying.url, id, file).catch((e) => e);
    assert.ok(lost instanceof Error, 'response lost');
    await dying.exited;
    assert.equal(await exists(stagingPath(env.dataDir, id)), false, 'staging already renamed');
    const srv = await start();
    let resent = 0;
    const s = await uploadFile(srv.url, file, { sessionId: id, onPart: () => resent++ });
    assert.equal(s.state, 'COMPLETE');
    assert.equal(resent, 0);
    assert.equal(await shasum(finalFile(env, id)), await shasum(file));
  });

  test('two server instances completing the same session at once publish exactly one file', async () => {
    const a = await start();
    const b = await start();
    const id = await crashedUpload(a.url, file, { stopAfterParts: 11 });
    const results = await Promise.all(
      [a, b].map((r) => completeRaw(r.url, id, file).then((res) => res.status)),
    );
    assert.ok(results.includes(200), `statuses ${results}`);
    for (const status of results) assert.ok(status === 200 || status === 409, `statuses ${results}`);
    const s = await uploadFile(b.url, file, { sessionId: id });
    assert.equal(s.state, 'COMPLETE');
    assert.deepEqual(await readdir(join(env.dataDir, 'final', id)), ['source.bin']);
    assert.equal(await shasum(finalFile(env, id)), await shasum(file));
  });

  test('cleanup aborts stale uploads and removes their staging files', async () => {
    const srv = await start();
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 2 });
    await stopServer(srv);
    const cfg = loadConfig({ SPIKE_DATA_DIR: env.dataDir, SPIKE_LEDGER: env.ledger });
    const ledger = new Ledger(cfg.ledgerPath);
    try {
      assert.deepEqual(await cleanupExpired(cfg, ledger, 0, Date.now() + 1), [id]);
      assert.equal(ledger.getSession(id)?.state, 'ABORTED');
    } finally {
      ledger.close();
    }
    assert.equal(await exists(stagingPath(env.dataDir, id)), false);
  });
});
