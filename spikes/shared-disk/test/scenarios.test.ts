import assert from 'node:assert/strict';
import { open, readdir, readFile, stat, utimes } from 'node:fs/promises';
import { request } from 'node:http';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { crc32 } from 'node:zlib';
import { ClientError, getSession, uploadFile } from '../src/client.ts';
import { stagingPath } from '../src/storage.ts';
import { crashedUpload, dropEnv, finalFile, makeEnv, makeFile, PART, shasum, startServer, stopServer, type Env, type Running } from './helpers.ts';

const SIZE = PART * 10 + 1234; // 11 parts, last one short

async function createSession(url: string, size: number): Promise<{ id: string }> {
  const res = await fetch(`${url}/sessions`, {
    method: 'POST',
    body: JSON.stringify({ fileName: 'manual.bin', fileSize: size, fingerprint: 'x' }),
  });
  return res.json();
}

describe('shared-disk upload scenarios (single server)', () => {
  let env: Env;
  let srv: Running;
  let file: string;

  before(async () => {
    env = await makeEnv('main');
    srv = await startServer(env);
    file = await makeFile(env.local, SIZE);
  });
  after(async () => {
    await stopServer(srv);
    await dropEnv(env);
  });

  test('parallel upload produces a byte-identical file', async () => {
    const s = await uploadFile(srv.url, file, { concurrency: 8 });
    assert.equal(s.state, 'COMPLETE');
    assert.equal(s.verifiedSha256, await shasum(file));
    assert.equal(await shasum(finalFile(env, s.id)), await shasum(file));
  });

  test('uploading the same part twice is idempotent', async () => {
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 0 });
    const buf = (await readFile(file)).subarray(0, PART);
    for (let i = 0; i < 2; i++) {
      const res = await fetch(`${srv.url}/sessions/${id}/parts/1`, {
        method: 'PUT',
        headers: { 'x-part-crc32': String(crc32(buf) >>> 0) },
        body: buf,
      });
      assert.equal(res.status, 200);
    }
    assert.deepEqual((await getSession(srv.url, id)).parts.map((p) => p.partNumber), [1]);
    const s = await uploadFile(srv.url, file, { sessionId: id });
    assert.equal(s.verifiedSha256, await shasum(file));
  });

  test('client crash then resume uploads only the missing parts, nothing published early', async () => {
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 3 });
    assert.deepEqual(await readdir(join(env.dataDir, 'final', id)).catch(() => []), []);
    let resent = 0;
    const s = await uploadFile(srv.url, file, { sessionId: id, onPart: () => resent++ });
    assert.equal(resent, 11 - 3);
    assert.equal(await shasum(finalFile(env, s.id)), await shasum(file));
  });

  test('wrong declared crc32 is rejected and not recorded', async () => {
    const { id } = await createSession(srv.url, SIZE);
    const buf = (await readFile(file)).subarray(0, PART);
    const res = await fetch(`${srv.url}/sessions/${id}/parts/1`, { method: 'PUT', headers: { 'x-part-crc32': '1' }, body: buf });
    assert.equal(res.status, 422);
    assert.deepEqual((await getSession(srv.url, id)).parts, []);
  });

  test('short part body is rejected and not recorded', async () => {
    const { id } = await createSession(srv.url, SIZE);
    const res = await fetch(`${srv.url}/sessions/${id}/parts/1`, { method: 'PUT', body: Buffer.alloc(100) });
    assert.equal(res.status, 400);
    assert.deepEqual((await getSession(srv.url, id)).parts, []);
  });

  test('bytes corrupted on disk after acceptance are caught at completion and only that part is re-sent', async () => {
    const id = await crashedUpload(srv.url, file, { stopAfterParts: 11 });
    // The client "crashes" after all 11 parts were accepted, before calling complete.
    const fh = await open(stagingPath(env.dataDir, id), 'r+');
    await fh.write(Buffer.from([0xff, 0x00, 0xff]), 0, 3, PART * 4 + 7); // inside part 5
    await fh.close();
    const resent: number[] = [];
    const s = await uploadFile(srv.url, file, { sessionId: id, onPart: (n) => resent.push(n) });
    assert.deepEqual(resent, [5]);
    assert.equal(await shasum(finalFile(env, s.id)), await shasum(file));
  });

  test('source changed before resume (mtime differs): resume is refused', async () => {
    const src = await makeFile(env.local, SIZE, 'changing.bin');
    const id = await crashedUpload(srv.url, src, { stopAfterParts: 2 });
    const t = new Date(Date.now() + 60_000);
    await utimes(src, t, t);
    const err = await uploadFile(srv.url, src, { sessionId: id }).catch((e) => e);
    assert.ok(err instanceof ClientError && err.status === 409, String(err));
  });

  test('source changed with identical size and mtime: caught by whole-file digest, never COMPLETE', async () => {
    const src = await makeFile(env.local, SIZE, 'sneaky.bin');
    const id = await crashedUpload(srv.url, src, { stopAfterParts: 2 });
    const st = await stat(src);
    const fh = await open(src, 'r+');
    await fh.write(Buffer.from('changed'), 0, 7, 10); // inside part 1, already uploaded
    await fh.close();
    await utimes(src, st.atimeMs / 1000, st.mtimeMs / 1000);
    const err = await uploadFile(srv.url, src, { sessionId: id }).catch((e) => e);
    assert.ok(err instanceof ClientError && err.status === 422, String(err));
    assert.equal((await getSession(srv.url, id)).session.state, 'FAILED');
  });

  test('complete is refused while a part write is still in flight', async () => {
    const { id } = await createSession(srv.url, SIZE);
    const req = request(`${srv.url}/sessions/${id}/parts/1`, { method: 'PUT', headers: { 'content-length': String(PART) } });
    req.on('error', () => {});
    req.write(Buffer.alloc(1000));
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch(`${srv.url}/sessions/${id}/complete`, { method: 'POST', body: '{}' });
    assert.equal(res.status, 409);
    assert.match(String((await res.json()).error), /in flight/);
    req.destroy();
  });
});
