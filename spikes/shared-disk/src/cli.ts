import { parseArgs } from 'node:util';
import { loadConfig } from './config.ts';
import { Ledger } from './ledger.ts';
import { cleanupExpired } from './server.ts';
import { uploadFile } from './client.ts';

// Usage:
//   node src/cli.ts upload <file> [--server URL] [--session ID] [--concurrency N]
//   node src/cli.ts cleanup [--older-than-hours H]

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    server: { type: 'string', default: 'http://localhost:8787' },
    session: { type: 'string' },
    concurrency: { type: 'string', default: '4' },
    'older-than-hours': { type: 'string', default: '168' },
  },
});

const [command, file] = positionals;
if (command === 'upload' && file) {
  const started = Date.now();
  let parts = 0;
  const result = await uploadFile(values.server, file, {
    sessionId: values.session,
    concurrency: Number(values.concurrency),
    onPart: () => {
      parts++;
      process.stderr.write(`\rparts accepted: ${parts}`);
    },
  });
  const secs = (Date.now() - started) / 1000;
  process.stderr.write('\n');
  console.log(JSON.stringify({ ...result, seconds: secs, mbPerSecond: result.fileSize / 1e6 / secs }, null, 2));
} else if (command === 'cleanup') {
  const cfg = loadConfig();
  const ledger = new Ledger(cfg.ledgerPath);
  const aborted = await cleanupExpired(cfg, ledger, Number(values['older-than-hours']) * 3_600_000);
  console.log(JSON.stringify({ aborted }));
  ledger.close();
} else {
  console.error('usage: cli.ts upload <file> [--server URL] [--session ID] [--concurrency N] | cleanup [--older-than-hours H]');
  process.exit(2);
}
