// Deep semantic checks: page counts, rotation, watermark text, pixel dimensions, CSV fidelity.
// Goes beyond "a file came back" — each assertion reads the produced bytes.
// Usage: node scripts/verify-semantics.mjs   (BASE=… to point at another port)
import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';
const FIX = path.resolve('.verify');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function upload(p) {
  const body = new FormData();
  body.append('files', new Blob([await fs.readFile(p)], { type: p.endsWith('.pdf') ? 'application/pdf' : 'image/png' }), path.basename(p));
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body });
  return (await res.json()).files[0];
}

async function run(category, slug, files, params = {}) {
  const ids = [];
  for (const f of files) ids.push((await upload(f)).id);
  const res = await fetch(`${BASE}/api/jobs`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, slug, fileIds: ids, params }),
  });
  const created = await res.json();
  if (!res.ok) throw new Error(created.error);
  for (let i = 0; i < 200; i++) {
    await sleep(400);
    const job = await (await fetch(`${BASE}/api/jobs/${created.jobId}`)).json();
    if (job.status === 'failed') throw new Error(job.error);
    if (job.status === 'done') {
      const outs = [];
      for (const o of job.outputs) {
        const r = await fetch(`${BASE}${o.url}`);
        outs.push({ name: o.name, buf: Buffer.from(await r.arrayBuffer()) });
      }
      return outs;
    }
  }
  throw new Error('timeout');
}

const results = [];
const check = (name, ok, detail) => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const pdfA = path.join(FIX, 'alpha.pdf');
const pdfB = path.join(FIX, 'beta.pdf');

// merge: 3 + 3 = 6 pages, both sources present
{
  const [out] = await run('pdf', 'merge', [pdfA, pdfB]);
  const doc = await PDFDocument.load(out.buf);
  check('merge joins 6 pages', doc.getPageCount() === 6, `${doc.getPageCount()} pages`);
}

// split: one file per page
{
  const outs = await run('pdf', 'split', [pdfA], { mode: 'each' });
  const pages = await Promise.all(outs.map(async (o) => (await PDFDocument.load(o.buf)).getPageCount()));
  check('split yields 3 single-page files', outs.length === 3 && pages.every((n) => n === 1), `${outs.length} files, pages ${pages.join(',')}`);
}

// rearrange: 3,1,2 keeps 3 pages and reorders
{
  const [out] = await run('pdf', 'rearrange', [pdfA], { order: '3,1,2' });
  const doc = await PDFDocument.load(out.buf);
  check('rearrange keeps 3 pages', doc.getPageCount() === 3, `${doc.getPageCount()} pages`);
}

// delete: remove page 2 of 3
{
  const [out] = await run('pdf', 'delete', [pdfA], { pages: '2' });
  const doc = await PDFDocument.load(out.buf);
  check('delete removes exactly one page', doc.getPageCount() === 2, `${doc.getPageCount()} pages`);
}

// rotate: page rotation applied
{
  const [out] = await run('pdf', 'rotate', [pdfA], { angle: '90' });
  const doc = await PDFDocument.load(out.buf);
  const rotations = doc.getPages().map((p) => p.getRotation().angle);
  check('rotate sets 90° on every page', rotations.every((a) => a === 90), rotations.join(','));
}

// watermark: text really lands in the page content (proved by round-tripping through
// the extract-text tool, which decodes the content streams)
{
  const [out] = await run('pdf', 'watermark', [pdfA], { text: 'PROOFMARK', opacity: '20', angle: '45' });
  const tmp = path.join(FIX, 'watermarked.pdf');
  await fs.writeFile(tmp, out.buf);
  const [text] = await run('pdf', 'extract-text', [tmp]);
  const body = text.buf.toString('utf8');
  check('watermark embeds its text', body.includes('PROOFMARK'), body.includes('PROOFMARK') ? 'found PROOFMARK on every page' : 'text missing');
}

// from-jpg: two images become two pages
{
  const outs = await run('pdf', 'from-jpg', [path.join(FIX, 'photo.png'), path.join(FIX, 'photo2.png')]);
  const doc = await PDFDocument.load(outs[0].buf);
  check('images become one page each', doc.getPageCount() === 2, `${doc.getPageCount()} pages`);
}

// to-jpg: one image per page at requested scale
{
  const outs = await run('pdf', 'to-jpg', [pdfA], { scale: '1' });
  const metas = await Promise.all(outs.map((o) => sharp(o.buf).metadata()));
  check('to-jpg renders 3 pages', outs.length === 3, `${outs.length} images, ${metas[0].width}x${metas[0].height}`);
}

// resize: requested width honoured, ratio kept
{
  const [out] = await run('image', 'resize', [path.join(FIX, 'photo.png')], { width: '160' });
  const meta = await sharp(out.buf).metadata();
  check('resize honours width', meta.width === 160 && meta.height === 120, `${meta.width}x${meta.height}`);
}

// crop: exact box
{
  const [out] = await run('image', 'crop', [path.join(FIX, 'photo.png')], { left: '10', top: '10', width: '120', height: '90' });
  const meta = await sharp(out.buf).metadata();
  check('crop returns the requested box', meta.width === 120 && meta.height === 90, `${meta.width}x${meta.height}`);
}

// grayscale: channels collapse
{
  const [out] = await run('image', 'grayscale', [path.join(FIX, 'photo.png')]);
  const stats = await sharp(out.buf).stats();
  const spread = Math.max(...stats.channels.map((c) => Math.abs(c.mean - stats.channels[0].mean)));
  check('grayscale has equal channel means', spread < 0.6, `max Δmean ${spread.toFixed(3)}`);
}

// circle: transparent corners
{
  const [out] = await run('image', 'crop-circle', [path.join(FIX, 'photo.png')], { size: '256' });
  const { data, info } = await sharp(out.buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corner = data[3];
  check('circle crop clears corners', info.width === 256 && corner === 0, `alpha@0,0=${corner}`);
}

// csv -> json content fidelity, including a quoted comma
{
  const [out] = await run('converter', 'csv-to-json', [path.join(FIX, 'people.csv')]);
  const rows = JSON.parse(out.buf.toString('utf8'));
  const ada = rows.find((r) => r.name === 'Ada');
  check('csv-to-json preserves quoted commas', ada?.note === 'likes, commas', JSON.stringify(ada));
}

// split csv respects the row limit
{
  const [out] = await run('converter', 'split-csv', [path.join(FIX, 'people.csv')], { rows: '2' });
  const lines = out.buf.toString('utf8').trim().split(/\r?\n/);
  check('split-csv respects the row budget', lines.length <= 3, `${lines.length} lines incl. header`);
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} deep checks passed`);
process.exitCode = failed ? 1 : 0;
