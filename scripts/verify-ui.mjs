// Browser proof: drives the real React workspace in headless Chrome over CDP,
// with no test doubles — file input, Run button, polling, download link.
// Needs the fixtures from scripts/test-tools.mjs, so run that first.
// Usage: node scripts/verify-ui.mjs   (BASE=… to point at another port)
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';
const CHROME = process.env.CHROME
  ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const FIX = path.resolve('.verify');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const need of ['alpha.pdf', 'beta.pdf']) {
  await fs.access(path.join(FIX, need)).catch(() => {
    throw new Error(`missing fixture ${FIX}/${need} — run node scripts/test-tools.mjs first`);
  });
}

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.resolve('.verify/chrome-ui')}`,
  'about:blank',
], { stdio: 'ignore' });

async function waitForDevtools() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('Chrome devtools did not start');
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  async eval(expression, awaitPromise = false) {
    const res = await this.send('Runtime.evaluate', {
      expression, awaitPromise, returnByValue: true, userGesture: true,
    });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? 'eval failed');
    return res.result.value;
  }
  close() { this.ws.close(); }
}

async function pollEval(cdp, expression, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await cdp.eval(expression);
    if (value) return value;
    await sleep(300);
  }
  throw new Error(`timed out waiting for: ${expression}`);
}

async function newPage(url) {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await res.json();
  const cdp = new Cdp(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');
  return cdp;
}

// React attaches its props/fiber to hydrated DOM nodes; wait for that before driving input,
// otherwise the first interaction can land before the client bundle has taken over.
async function waitHydrated(cdp, selector) {
  await pollEval(cdp, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    return Object.keys(el).some((k) => k.startsWith('__reactProps') || k.startsWith('__reactFiber'));
  })()`);
}

async function setFiles(cdp, files) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'input[type=file]' });
  if (!nodeId) throw new Error('no file input on the page');
  await cdp.send('DOM.setFileInputFiles', { nodeId, files });
}

const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push({ name, ok: true }); console.log(`PASS  ${name}`); }
  catch (err) { results.push({ name, ok: false, note: err.message }); console.log(`FAIL  ${name} — ${err.message}`); }
};

try {
  await waitForDevtools();

  await check('UI merges two PDFs and offers a signed download', async () => {
    const cdp = await newPage(`${BASE}/pdf/merge`);
    try {
      await pollEval(cdp, `document.querySelectorAll('.filelist li').length === 0 && !!document.querySelector('input[type=file]')`);
      await waitHydrated(cdp, '.dropzone');
      await setFiles(cdp, [`${FIX}/alpha.pdf`, `${FIX}/beta.pdf`]);
      await pollEval(cdp, `document.querySelectorAll('.filelist li').length === 2`);
      await cdp.eval(`document.querySelector('[data-testid=run]').click()`);
      const href = await pollEval(cdp, `(() => { const a = document.querySelector('.outputs a.dl'); return a ? a.getAttribute('href') : null; })()`);
      const info = await cdp.eval(`(async () => {
        const r = await fetch(${JSON.stringify(href)});
        const b = new Uint8Array(await r.arrayBuffer());
        return { status: r.status, len: b.length, head: String.fromCharCode(...b.slice(0, 5)) };
      })()`, true);
      if (info.status !== 200) throw new Error(`download status ${info.status}`);
      if (info.head !== '%PDF-') throw new Error(`not a PDF: ${info.head}`);
      if (info.len < 1000) throw new Error(`suspiciously small: ${info.len} bytes`);
      console.log(`      merged output ${info.len} bytes, header ${info.head}`);
    } finally { cdp.close(); }
  });

  await check('UI generates a QR code from the text field (no upload)', async () => {
    const cdp = await newPage(`${BASE}/other/qr-code`);
    try {
      await pollEval(cdp, `!!document.querySelector('#p-text')`);
      await waitHydrated(cdp, '#p-text');
      await cdp.eval(`(() => {
        const el = document.querySelector('#p-text');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(el, 'https://example.com/proven');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await cdp.eval(`document.querySelector('[data-testid=run]').click()`);
      const href = await pollEval(cdp, `(() => { const a = document.querySelector('.outputs a.dl'); return a ? a.getAttribute('href') : null; })()`);
      const info = await cdp.eval(`(async () => {
        const r = await fetch(${JSON.stringify(href)});
        const b = new Uint8Array(await r.arrayBuffer());
        return { status: r.status, len: b.length, head: String.fromCharCode(...b.slice(1, 4)) };
      })()`, true);
      if (info.status !== 200) throw new Error(`download status ${info.status}`);
      if (info.head !== 'PNG') throw new Error(`not a PNG: ${info.head}`);
      console.log(`      QR output ${info.len} bytes, Png header ${info.head}`);
    } finally { cdp.close(); }
  });

  await check('UI shows an error for a bad page range instead of a silent failure', async () => {
    const cdp = await newPage(`${BASE}/pdf/delete`);
    try {
      await pollEval(cdp, `!!document.querySelector('input[type=file]')`);
      await waitHydrated(cdp, '.dropzone');
      await setFiles(cdp, [`${FIX}/alpha.pdf`]);
      await pollEval(cdp, `document.querySelectorAll('.filelist li').length === 1`);
      await cdp.eval(`(() => {
        const el = document.querySelector('#p-pages');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, '99');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await cdp.eval(`document.querySelector('[data-testid=run]').click()`);
      const text = await pollEval(cdp, `document.querySelector('.alert.error')?.textContent || ''`);
      console.log(`      surfaced: ${JSON.stringify(text)}`);
    } finally { cdp.close(); }
  });

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} UI checks passed`);
  if (failed.length) process.exitCode = 1;
} finally {
  chrome.kill();
  await fs.rm(path.resolve('.verify/chrome-ui'), { recursive: true, force: true }).catch(() => {});
}
