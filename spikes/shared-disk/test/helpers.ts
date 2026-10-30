import assert from 'node:assert/strict';
import { spawn, execFile, type ChildProcess } from 'node:child_process';
import { SimulatedCrash, uploadFile, type UploadOptions } from '../src/client.ts';
import { randomBytes } from 'node:crypto';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const SERVER = fileURLToPath(new URL('../src/server.ts', import.meta.url));
export const PART = 64 * 1024;

export type Env = { dataDir: string; ledger: string; local: string };

// Data goes to SPIKE_TEST_DATA_DIR when set (e.g. a NAS mount), otherwise to a temp dir.
// The ledger always stays on local disk.
export async function makeEnv(name: string): Promise<Env> {
  const local = await mkdtemp(join(tmpdir(), `spike-${name}-`));
  const base = process.env.SPIKE_TEST_DATA_DIR;
  const dataDir = base ? await mkdtemp(join(base, `spike-${name}-`)) : join(local, 'data');
  return { dataDir, ledger: join(local, 'ledger.sqlite'), local };
}

export async function dropEnv(env: Env): Promise<void> {
  await rm(env.local, { recursive: true, force: true });
  await rm(env.dataDir, { recursive: true, force: true });
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, () => {
      const port = (s.address() as { port: number }).port;
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

export type Running = { url: string; proc: ChildProcess; exited: Promise<number | null> };

export async function startServer(env: Env, extra: Record<string, string> = {}): Promise<Running> {
  const port = await freePort();
  const proc = spawn(process.execPath, ['--no-warnings', SERVER], {
    env: {
      ...process.env,
      SPIKE_PORT: String(port),
      SPIKE_DATA_DIR: env.dataDir,
      SPIKE_LEDGER: env.ledger,
      SPIKE_MIN_PART_SIZE: String(PART),
      ...extra,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const exited = new Promise<number | null>((resolve) => proc.on('exit', (code) => resolve(code)));
  let stderr = '';
  proc.stderr!.on('data', (d) => (stderr += d));
  await new Promise<void>((resolve, reject) => {
    proc.stdout!.on('data', (d) => String(d).includes('listening') && resolve());
    proc.on('exit', () => reject(new Error(`server exited early: ${stderr}`)));
  });
  return { url: `http://localhost:${port}`, proc, exited };
}

export async function stopServer(r: Running): Promise<void> {
  if (r.proc.exitCode === null && r.proc.signalCode === null) {
    r.proc.kill('SIGKILL');
    await r.exited;
  }
}

export async function makeFile(dir: string, size: number, name = 'source.bin'): Promise<string> {
  const path = join(dir, name);
  await writeFile(path, randomBytes(size));
  return path;
}

export function finalFile(env: Env, id: string, name = 'source.bin'): string {
  return join(env.dataDir, 'final', id, name);
}

// Runs an upload that is expected to stop early and returns the session id it created.
export async function crashedUpload(url: string, path: string, opts: UploadOptions): Promise<string> {
  let id = '';
  const err = await uploadFile(url, path, { concurrency: 1, ...opts, onSession: (s) => (id = s.id) }).catch((e) => e);
  assert.ok(err instanceof SimulatedCrash, `expected simulated crash, got ${err}`);
  return id;
}

// Independent digest via the OS tool, so verification does not rely on the code under test.
export async function shasum(path: string): Promise<string> {
  const { stdout } = await promisify(execFile)('shasum', ['-a', '256', path]);
  return stdout.split(' ')[0];
}
