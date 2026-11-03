// Experiment: how the server writes a 64 MiB part body to a network mount (strategy comparison).
// Not part of the spike server. Needs a mounted share at /Volumes/upload-test with an 'exp' dir,
// a 64 MiB file, and e.g.: curl -X PUT --data-binary @part.bin 'localhost:8796/w?mode=coalesce8&file=a.bin'
// See docs/research/shared-disk-spike-report.md.
import { createServer } from 'node:http';
import { createWriteStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
const DIR = '/Volumes/upload-test/exp';
const wr = (fh, b, at) => fh.write(b, 0, b.length, at);
const modes = {
  // createWriteStream via pipeline (what the first implementation did)
  stream: async (req, file) => { await pipeline(req, createWriteStream(`${DIR}/${file}`, { flags: 'r+', start: 0 })); },
  // same, but 'w' flags semantics aside: no explicit start (sequential append at fd position)
  streamNoStart: async (req, file) => { await pipeline(req, createWriteStream(`${DIR}/${file}`, { flags: 'r+' })); },
  // one awaited pwrite per received chunk
  perChunk: async (req, file) => { const fh = await open(`${DIR}/${file}`, 'r+'); let at = 0; for await (const c of req) { await wr(fh, c, at); at += c.length; } await fh.sync(); await fh.close(); },
  // gather chunks that arrived while the previous write was pending, then one writev
  writev: async (req, file) => { const fh = await open(`${DIR}/${file}`, 'r+'); let at = 0; let batch = []; for await (const c of req) { batch.push(c); if (batch.length >= 16) { const r = await fh.writev(batch, at); at += r.bytesWritten; batch = []; } } if (batch.length) { const r = await fh.writev(batch, at); at += r.bytesWritten; } await fh.sync(); await fh.close(); },
  // 8 MiB coalescing (the shipped fix)
  coalesce8: async (req, file) => { const fh = await open(`${DIR}/${file}`, 'r+'); let at = 0, pend = [], pb = 0; for await (const c of req) { pend.push(c); pb += c.length; if (pb >= 8 << 20) { const b = Buffer.concat(pend, pb); await wr(fh, b, at); at += b.length; pend = []; pb = 0; } } if (pb) { const b = Buffer.concat(pend, pb); await wr(fh, b, at); } await fh.sync(); await fh.close(); },
};
const made = new Set();
createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); const mode = u.searchParams.get('mode'), file = u.searchParams.get('file');
  const fh0 = await open(`${DIR}/${file}`, 'w'); await fh0.truncate(1024 ** 3); await fh0.close();
  await modes[mode](req, file); res.end('ok');
}).listen(8796, () => console.log('up'));
