// End-to-end proof for the tools that call an AI provider:
//   ai.write (53), ai.pdf (2), extra.ocr (2), extra.urlToPdf (1), speech.* (7)
// Every result is checked for real content, not just a 200.
//
//   node scripts/test-ai.mjs              # offline + keyed providers
//   TEST_LIVE=1 node scripts/test-ai.mjs  # also hit YouTube / social downloaders
//   ONLY=write node scripts/test-ai.mjs   # filter by route substring
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const run = promisify(execFile);

const envFile = path.join(process.cwd(), '.env.local');
try {
  for (const line of (await fs.readFile(envFile, 'utf8')).split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* no .env.local */ }

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';
const FIXTURES = path.join(process.cwd(), '.verify');
const ONLY = process.env.ONLY ?? '';
const LIVE = process.env.TEST_LIVE === '1';
const NETWORK_ENGINES = new Set([
  'ai.write', 'ai.pdf', 'extra.ocr', 'extra.urlToPdf',
  'speech.transcribe', 'speech.summarize', 'speech.youtube', 'speech.social',
]);

const SAMPLE =
  'Opening a small bakery is equal parts craft and logistics. Before signing a lease, model your monthly fixed costs: ' +
  'rent, insurance, equipment finance and two salaries. Then estimate how many loaves and pastries you must sell each ' +
  'morning to cover those costs before the first customer walks in. Most new bakeries fail not because the bread is bad, ' +
  'but because the morning bake is too large, the waste is unmeasured, and the wholesale price was never tested against ' +
  'the real cost of flour, butter and labour. Start with three products, sell out on purpose, and expand only when the ' +
  'same three keep selling out for six weeks in a row.';

async function loadCatalog() {
  const src = await fs.readFile(path.join(process.cwd(), 'lib', 'catalog.ts'), 'utf8');
  const start = src.indexOf('export const TOOLS: Tool[] = ') + 'export const TOOLS: Tool[] = '.length;
  const end = src.indexOf('\nexport const TOOL_MAP');
  return JSON.parse(src.slice(start, end).trim().replace(/;\s*$/, ''));
}

// ---------- fixtures ----------
async function makeFixtures() {
  await fs.mkdir(FIXTURES, { recursive: true });

  const pdf = path.join(FIXTURES, 'brief.pdf');
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  let y = 780;
  page.drawText('Bakery Launch Brief', { x: 50, y, size: 20, font });
  y -= 30;
  for (const line of SAMPLE.match(/.{1,92}(\s|$)/g)) {
    page.drawText(line.trim(), { x: 50, y, size: 11, font });
    y -= 16;
  }
  await fs.writeFile(pdf, await doc.save());

  const { createCanvas } = await import('@napi-rs/canvas');
  const canvas = createCanvas(900, 260);
  const g = canvas.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 900, 260);
  g.fillStyle = '#111111';
  g.font = 'bold 88px Arial';
  g.fillText('HELLO WORLD', 40, 120);
  g.font = '52px Arial';
  g.fillText('Invoice 12345', 40, 205);
  const png = path.join(FIXTURES, 'text.png');
  await fs.writeFile(png, canvas.toBuffer('image/png'));

  // Speech fixture: Windows SAPI synthesises a known sentence locally.
  const wav = path.join(FIXTURES, 'speech.wav');
  let haveSpeech = false;
  if (process.platform === 'win32') {
    const ps = [
      'Add-Type -AssemblyName System.Speech;',
      '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer;',
      `$s.SetOutputToWaveFile('${wav.replace(/'/g, "''")}');`,
      "$s.Speak('The quick brown fox jumps over the lazy dog.');",
      '$s.Dispose();',
    ].join(' ');
    try {
      await run('powershell', ['-NoProfile', '-Command', ps], { timeout: 60000 });
      haveSpeech = (await fs.stat(wav)).size > 1000;
    } catch {
      haveSpeech = false;
    }
  }
  return { pdf, png, wav: haveSpeech ? wav : null };
}

// ---------- http ----------
const MIME = { '.pdf': 'application/pdf', '.png': 'image/png', '.wav': 'audio/wav' };

async function upload(filePath) {
  const body = new FormData();
  body.append('files', new Blob([await fs.readFile(filePath)], { type: MIME[path.extname(filePath)] ?? 'application/octet-stream' }), path.basename(filePath));
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(`upload failed: ${data.error}`);
  return data.files[0];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(jobId, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const data = await (await fetch(`${BASE}/api/jobs/${jobId}`, { cache: 'no-store' })).json();
    if (data.status === 'done' || data.status === 'failed') return data;
    await sleep(500);
  }
  throw new Error('job timed out');
}

async function download(url) {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------- per-tool expectations ----------
const REWRITE = new Set([
  'ai-rephraser', 'article-rewriter', 'content-improver', 'grammar-fixer', 'humanizer-ai',
  'paragraph-rewriter', 'paraphrasing', 'post-rewriter', 'sentence-rewriter', 'shorten-content',
  'title-rewriter', 'translate',
]);

function assert(tool, outputs, files) {
  const text = outputs.filter((o) => o.text).map((o) => o.text).join('\n');
  if (tool.engine === 'ai.write') {
    if (tool.fixed.route === 'word-counter') {
      if (!/Words:\s+\d+/.test(text)) throw new Error('no word count produced');
      return `${text.match(/Words:\s+(\d+)/)[1]} words counted`;
    }
    if (text.trim().length < 40) throw new Error(`answer too short (${text.trim().length} chars)`);
    if (REWRITE.has(tool.fixed.route) && text.trim() === SAMPLE) throw new Error('output is the input verbatim');
    if (tool.fixed.route === 'ai-detector' && !/%/.test(text)) throw new Error('no percentage score');
    return `${text.trim().length} chars: "${text.trim().replace(/\s+/g, ' ').slice(0, 48)}…"`;
  }
  if (tool.engine === 'ai.pdf') {
    if (tool.fixed.op === 'translate') {
      const pdfOut = outputs.find((o) => o.name.endsWith('.pdf'));
      if (!pdfOut || pdfOut.buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error('translated PDF missing');
      if (text.trim().length < 100) throw new Error('translation too short');
      return `translated ${text.split(/\s+/).length} words + PDF`;
    }
    if (!text.toLowerCase().includes('bakery') && !text.toLowerCase().includes('loaf')) throw new Error('summary does not mention the document');
    return `summary ${text.split(/\s+/).length} words`;
  }
  if (tool.engine === 'extra.ocr') {
    if (!/hello\s+world/i.test(text)) throw new Error(`OCR did not read the text: ${text.slice(0, 60)}`);
    return 'read "HELLO WORLD"';
  }
  if (tool.engine === 'extra.urlToPdf') {
    const pdf = outputs[0].buffer;
    if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('not a PDF');
    return `${pdf.length} B PDF`;
  }
  if (tool.engine === 'speech.transcribe') {
    if (!/quick|brown|fox|lazy|dog/i.test(text)) throw new Error(`transcript looks wrong: ${text.slice(0, 80)}`);
    const srt = outputs.find((o) => o.name.endsWith('.srt'));
    return `transcript${srt ? ' + SRT' : ''}: "${text.trim().slice(0, 42)}…"`;
  }
  if (tool.engine === 'speech.summarize') {
    if (outputs.length < 2) throw new Error('expected a summary and a transcript');
    if (!/quick|brown|fox|lazy|dog/i.test(text)) throw new Error('transcript looks wrong');
    return `${outputs.length} outputs`;
  }
  if (tool.engine === 'speech.youtube' || tool.engine === 'speech.social') {
    if (!outputs.length) throw new Error('no output');
    return `${outputs[0].name} (${outputs[0].buffer.length} B)`;
  }
  return 'ok';
}

// ---------- run ----------
async function main() {
  const health = await fetch(BASE).catch(() => null);
  if (!health || !health.ok) throw new Error(`app is not responding at ${BASE}`);

  const status = await (await fetch(`${BASE}/api/ai/status`)).json();
  console.log(`AI chain: ${status.rows.map((r) => `${r.provider}:${r.model}${r.status === 'cooling' ? '(cooling)' : ''}`).join(' → ')}`);
  console.log(`Providers with keys: ${Object.entries(status.providers).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}\n`);

  const fx = await makeFixtures();
  // ONLY is matched as a plain substring: Git Bash rewrites values that look
  // like absolute paths, so a leading slash never survives to the process.
  const only = ONLY.replace(/^\/+/, '');
  const tools = (await loadCatalog()).filter((t) => t.engine && NETWORK_ENGINES.has(t.engine))
    .filter((t) => !only || `${t.category}/${t.slug}`.includes(only));

  const results = [];
  const queue = [...tools];
  const concurrency = Number(process.env.JOBS ?? 3);

  async function worker() {
    while (queue.length) {
      const tool = queue.shift();
      const label = `${tool.category}/${tool.slug}`;
      const started = Date.now();
      try {
        if (tool.engine === 'speech.youtube' || tool.engine === 'speech.social') {
          if (!LIVE) {
            results.push({ label, ok: true, skipped: true, note: 'skipped (set TEST_LIVE=1 to hit the network)' });
            console.log(`SKIP  ${label.padEnd(34)} ${'needs TEST_LIVE=1'}`);
            continue;
          }
        }
        if (tool.engine === 'speech.transcribe' || tool.engine === 'speech.summarize') {
          if (!fx.wav) throw new Error('no speech fixture available on this host');
        }

        const params = Object.fromEntries(tool.params.map((p) => [p.key, p.default ?? '']));
        const uploaded = [];
        if (tool.engine === 'ai.write') {
          params.text = SAMPLE;
          if (tool.fixed.route === 'translate') params.language = 'Spanish';
        } else if (tool.engine === 'ai.pdf') {
          if (tool.fixed.op === 'translate') params.language = 'Spanish';
          uploaded.push(await upload(fx.pdf));
        } else if (tool.engine === 'extra.ocr') {
          uploaded.push(await upload(fx.png));
        } else if (tool.engine === 'extra.urlToPdf') {
          params.url = process.env.TEST_URL ?? 'https://example.com';
        } else if (tool.engine === 'speech.transcribe' || tool.engine === 'speech.summarize') {
          uploaded.push(await upload(fx.wav));
        } else if (tool.engine === 'speech.youtube') {
          params.url = process.env.TEST_YOUTUBE ?? 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
        } else if (tool.engine === 'speech.social') {
          const link = process.env[`TEST_SOCIAL_${tool.slug.toUpperCase().replace(/-/g, '_')}`];
          if (!link) {
            results.push({ label, ok: true, skipped: true, note: 'needs its own public link' });
            console.log(`SKIP  ${label.padEnd(34)} set TEST_SOCIAL_${tool.slug.toUpperCase().replace(/-/g, '_')}=<url>`);
            continue;
          }
          params.url = link;
        }

        const created = await fetch(`${BASE}/api/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: tool.category, slug: tool.slug, fileIds: uploaded.map((f) => f.id), params }),
        });
        const createdBody = await created.json();
        if (created.status !== 200) throw new Error(`job create ${created.status}: ${createdBody.error}`);

        const job = await waitFor(createdBody.jobId);
        if (job.status !== 'done') throw new Error(job.error ?? 'job failed');

        const outputs = [];
        for (const out of job.outputs) outputs.push({ name: out.name, text: '', buffer: await download(out.url) });
        for (const o of outputs) {
          if (/\.txt$|\.md$|\.srt$/.test(o.name)) o.text = o.buffer.toString('utf8');
        }
        const note = assert(tool, outputs, fx);
        results.push({ label, ok: true, note });
        console.log(`PASS  ${label.padEnd(34)} ${String(Date.now() - started).padStart(6)}ms  ${note}`);
      } catch (err) {
        results.push({ label, ok: false, note: err.message });
        console.log(`FAIL  ${label.padEnd(34)} ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  const pass = results.filter((r) => r.ok && !r.skipped);
  const skip = results.filter((r) => r.skipped);
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${pass.length}/${results.length - skip.length} AI tools passed, ${skip.length} skipped`);
  if (failed.length) {
    console.log('\nFailures:');
    for (const f of failed) console.log(` - ${f.label}: ${f.note}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
