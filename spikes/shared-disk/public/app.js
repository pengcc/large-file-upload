import { Sha256 } from './sha256.js';

// Browser client for the shared-disk spike. Plain JS (browsers cannot run TypeScript directly and
// the spike has no build step). Mirrors src/client.ts: Blob.slice per part, XHR PUT for upload
// progress events, per-part CRC32, resume via the server's part list.

const $ = (id) => document.getElementById(id);
const log = (msg) => ($('log').textContent = `${new Date().toLocaleTimeString()} ${msg}\n` + $('log').textContent);

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes, crc = 0) {
  crc = ~crc >>> 0;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return ~crc >>> 0;
}

async function api(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`${res.status} ${json.error}`), { status: res.status, body: json });
  return json;
}

function putPart(sessionId, n, blob, crc, fingerprint, onProgress, signal) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/sessions/${sessionId}/parts/${n}`);
    xhr.setRequestHeader('x-part-crc32', String(crc));
    xhr.setRequestHeader('x-file-fingerprint', fingerprint);
    xhr.upload.onprogress = (e) => onProgress(e.loaded);
    xhr.onload = () => {
      if (xhr.status === 200) return resolve();
      let serverError;
      try {
        serverError = JSON.parse(xhr.responseText).error;
      } catch {}
      reject(Object.assign(new Error(`part ${n}: ${xhr.status} ${serverError ?? ''}`), { status: xhr.status, serverError }));
    };
    xhr.onerror = () => reject(new Error(`part ${n}: network error`));
    signal.addEventListener('abort', () => xhr.abort());
    xhr.onabort = () => reject(new Error('stopped'));
    xhr.send(blob);
  });
}

async function hashFile(file, onProgress) {
  const h = new Sha256();
  const block = 8 * 1024 * 1024;
  for (let start = 0; start < file.size; start += block) {
    h.update(new Uint8Array(await file.slice(start, Math.min(start + block, file.size)).arrayBuffer()));
    onProgress(Math.min(start + block, file.size));
  }
  return h.hex();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let controller;

async function upload() {
  const file = $('file').files[0];
  if (!file) return log('先选择文件');
  controller = new AbortController();
  const { signal } = controller;
  const fingerprint = `${file.size}:${Math.trunc(file.lastModified)}`;
  const key = `spike-session:${file.name}:${fingerprint}`;
  let sessionId = localStorage.getItem(key);
  let session;
  let have = new Set();
  if (sessionId) {
    try {
      const got = await api('GET', `/sessions/${sessionId}`);
      session = got.session;
      have = new Set(got.parts.map((p) => p.partNumber));
      log(`续传会话 ${sessionId}，已确认 ${have.size}/${session.partCount} 块`);
    } catch {
      sessionId = null;
    }
  }
  if (!session || ['ABORTED', 'FAILED'].includes(session.state)) {
    session = await api('POST', '/sessions', { fileName: file.name, fileSize: file.size, fingerprint });
    have = new Set();
    localStorage.setItem(key, session.id);
    log(`新会话 ${session.id}，${session.partCount} 块 × ${session.partSize / 1048576} MiB`);
  }
  if (session.state === 'COMPLETE') return showDone(session);

  const started = performance.now();
  const inFlight = new Map();
  let ackedBytes = 0;
  for (const n of have) ackedBytes += Math.min(session.partSize, session.fileSize - (n - 1) * session.partSize);
  const render = () => {
    let sent = ackedBytes;
    for (const v of inFlight.values()) sent += v;
    $('sent').value = sent / session.fileSize;
    $('acked').value = ackedBytes / session.fileSize;
    const secs = (performance.now() - started) / 1000;
    $('state').textContent = `${(ackedBytes / 1e6).toFixed(0)} / ${(session.fileSize / 1e6).toFixed(0)} MB 已确认，${secs.toFixed(0)} 秒`;
  };

  const uploadParts = async (numbers) => {
    const queue = [...numbers];
    const worker = async () => {
      for (let n = queue.shift(); n !== undefined; n = queue.shift()) {
        const start = (n - 1) * session.partSize;
        const blob = file.slice(start, Math.min(start + session.partSize, file.size));
        const crc = crc32(new Uint8Array(await blob.arrayBuffer()));
        for (let attempt = 0; ; attempt++) {
          try {
            await putPart(session.id, n, blob, crc, fingerprint, (loaded) => (inFlight.set(n, loaded), render()), signal);
            break;
          } catch (err) {
            inFlight.delete(n);
            // 4xx is fatal, except a lapsed write lease: that part is simply re-sent.
            const leaseLapsed = err.status === 409 && err.serverError === 'write lease lost';
            if (signal.aborted || attempt >= 5 || (err.status && err.status < 500 && !leaseLapsed)) throw err;
            await sleep(Math.min(5000, 250 * 2 ** attempt));
          }
        }
        inFlight.delete(n);
        ackedBytes += blob.size;
        render();
      }
    };
    await Promise.all(Array.from({ length: Number($('concurrency').value) }, worker));
  };

  const todo = [];
  for (let n = 1; n <= session.partCount; n++) if (!have.has(n)) todo.push(n);
  await uploadParts(todo);
  const uploadSecs = (performance.now() - started) / 1000;
  log(`传输完成：${uploadSecs.toFixed(1)} 秒，${(file.size / 1e6 / uploadSecs).toFixed(1)} MB/s；开始服务端校验`);

  // The server requires the whole-file SHA-256. Web Crypto cannot stream, so hash with an
  // incremental JS implementation (one extra read of the file, and the slowest step of this client).
  const hashStart = performance.now();
  const sha256 = await hashFile(file, (done) => ($('state').textContent = `计算 SHA-256：${(done / 1e6).toFixed(0)} / ${(file.size / 1e6).toFixed(0)} MB`));
  log(`SHA-256 计算：${((performance.now() - hashStart) / 1000).toFixed(1)} 秒，${(file.size / 1e6 / ((performance.now() - hashStart) / 1000)).toFixed(0)} MB/s`);

  for (let round = 0; round < 120; round++) {
    try {
      const done = await api('POST', `/sessions/${session.id}/complete`, { sha256 });
      return showDone(done, (performance.now() - started) / 1000);
    } catch (err) {
      const detail = err.body?.detail ?? {};
      if (err.status === 409 && detail.missing) await uploadParts(detail.missing);
      else if (err.status === 422 && detail.badParts) await uploadParts(detail.badParts);
      else if (err.status === 409 && /in progress|in flight/.test(err.body?.error)) await sleep(1000);
      else throw err;
    }
  }
}

function showDone(s, secs) {
  $('acked').value = 1;
  $('state').textContent = `COMPLETE${secs ? `，总计 ${secs.toFixed(1)} 秒` : ''}`;
  log(`完成。服务端 SHA-256：${s.verifiedSha256}\n请在本机运行 shasum -a 256 <文件> 对比`);
}

async function measure(kind) {
  const file = $('file').files[0];
  if (!file) return log('先选择文件');
  const partSize = 8 * 1024 * 1024;
  const t0 = performance.now();
  let crc = 0;
  for (let start = 0; start < file.size; start += partSize) {
    const buf = await file.slice(start, start + partSize).arrayBuffer();
    if (kind === 'crc') crc = crc32(new Uint8Array(buf), crc);
    else await crypto.subtle.digest('SHA-256', buf);
  }
  const secs = (performance.now() - t0) / 1000;
  log(`${kind === 'crc' ? 'CRC32（纯 JS，整文件）' : 'SHA-256（Web Crypto，每 8 MiB 一次，不是整文件摘要）'}：${(file.size / 1e6).toFixed(0)} MB，${secs.toFixed(1)} 秒，${(file.size / 1e6 / secs).toFixed(1)} MB/s（含读文件）`);
}

$('start').onclick = () => upload().catch((err) => log(`出错：${err.message}`));
$('stop').onclick = () => controller?.abort();
$('measure-sha-js').onclick = async () => {
  const file = $('file').files[0];
  if (!file) return log('先选择文件');
  const t0 = performance.now();
  const hex = await hashFile(file, () => {});
  const secs = (performance.now() - t0) / 1000;
  log(`SHA-256（整文件，纯 JS 增量）：${(file.size / 1e6).toFixed(0)} MB，${secs.toFixed(1)} 秒，${(file.size / 1e6 / secs).toFixed(1)} MB/s，${hex}`);
};
$('measure-crc').onclick = () => measure('crc').catch((err) => log(`出错：${err.message}`));
$('measure-sha').onclick = () => measure('sha').catch((err) => log(`出错：${err.message}`));
