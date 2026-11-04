import { join } from 'node:path';

export type Config = {
  port: number;
  dataDir: string; // staging + final files; may be a network mount
  ledgerPath: string; // SQLite file; keep on local disk
  minPartSize: number;
  maxParts: number;
  writeLeaseMs: number; // write registration lifetime; renewed before each write, so it bounds a stall, not a part
  finalizeLeaseMs: number; // how long a finalizer owns a session before others may take over
  fault: string | undefined; // test-only fault injection point
};

const MiB = 1024 * 1024;

// The write heartbeat is a third of the lease but never below 100 ms, so a lease under 300 ms would
// leave live slow clients with almost no tolerated gap. Reject it instead of starving them.
export const MIN_WRITE_LEASE_MS = 300;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const dataDir = env.SPIKE_DATA_DIR ?? join(process.cwd(), '.spike-data');
  const writeLeaseMs = Number(env.SPIKE_WRITE_LEASE_MS ?? 120_000);
  if (!Number.isFinite(writeLeaseMs) || writeLeaseMs < MIN_WRITE_LEASE_MS) {
    throw new Error(`SPIKE_WRITE_LEASE_MS must be a number >= ${MIN_WRITE_LEASE_MS} (got ${env.SPIKE_WRITE_LEASE_MS})`);
  }
  return {
    port: Number(env.SPIKE_PORT ?? 8787),
    dataDir,
    ledgerPath: env.SPIKE_LEDGER ?? join(process.cwd(), '.spike-ledger.sqlite'),
    minPartSize: Number(env.SPIKE_MIN_PART_SIZE ?? 8 * MiB),
    maxParts: Number(env.SPIKE_MAX_PARTS ?? 10_000),
    writeLeaseMs,
    finalizeLeaseMs: Number(env.SPIKE_FINALIZE_LEASE_MS ?? 600_000),
    fault: env.SPIKE_FAULT || undefined,
  };
}

// Part size is fixed per session: at least minPartSize, large enough to stay under maxParts,
// rounded up to a multiple of minPartSize so sizes stay regular.
export function choosePartSize(fileSize: number, cfg: Pick<Config, 'minPartSize' | 'maxParts'>): number {
  const needed = Math.ceil(fileSize / cfg.maxParts);
  const units = Math.max(1, Math.ceil(needed / cfg.minPartSize));
  return units * cfg.minPartSize;
}
