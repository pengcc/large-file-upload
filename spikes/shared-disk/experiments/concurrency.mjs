// Experiment: N concurrent part writes to one shared file vs N separate files, 8 MiB coalesced writes.
// Usage: curl 'localhost:8797/mk?file=f.bin' then N parallel curl -X PUT --data-binary @part.bin
//   'localhost:8797/w?file=f.bin&off=<i*64MiB>'. See docs/research/shared-disk-spike-report.md.
import { createServer } from 'node:http';
import { open } from 'node:fs/promises';
const DIR = '/Volumes/upload-test/exp';
createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x'); const file = u.searchParams.get('file'), off = Number(u.searchParams.get('off'));
  if (u.pathname === '/mk') { const f = await open(`${DIR}/${file}`, 'w'); await f.truncate(1024 ** 3); await f.close(); return res.end('ok'); }
  const fh = await open(`${DIR}/${file}`, 'r+'); let at = off, pend = [], pb = 0;
  for await (const c of req) { pend.push(c); pb += c.length; if (pb >= 8 << 20) { const b = Buffer.concat(pend, pb); await fh.write(b, 0, b.length, at); at += b.length; pend = []; pb = 0; } }
  if (pb) { const b = Buffer.concat(pend, pb); await fh.write(b, 0, b.length, at); }
  await fh.sync(); await fh.close(); res.end('ok');
}).listen(8797, () => console.log('up'));
