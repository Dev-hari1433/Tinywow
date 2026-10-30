import fs from 'node:fs/promises';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { ocrImage } from '../ai/router';
import { EngineCtx, EngineOutput, UserError, baseName, paramInt } from './types';

// ---------------------------------------------------------------------------
// Upscaling (Lanczos + unsharp mask). Not a generative model: it is a genuine
// high-quality resample, so the output is predictable for every image.
// ---------------------------------------------------------------------------

export const upscale = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add an image to upscale.');
  const sharp = (await import('sharp')).default;
  const factor = Math.min(4, Math.max(2, paramInt(ctx.params, 'factor', 2)));

  const meta = await sharp(file.path).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new UserError('That file is not an image I can read.');
  if (Math.max(width, height) * factor > 8000) {
    throw new UserError(`That would be ${width * factor}px wide. The limit is 8000px — use a smaller factor or image.`);
  }

  ctx.progress(40, `Upscaling ${width}x${height} → ${width * factor}x${height * factor}`);
  const format = (ctx.params.format ?? 'png') === 'jpeg' ? 'jpeg' : 'png';
  const buffer = await sharp(file.path)
    .resize(Math.round(width * factor), Math.round(height * factor), { kernel: 'lanczos3', fit: 'fill' })
    .sharpen({ sigma: 1.1, m1: 0.6, m2: 2.2 })
    .toFormat(format, format === 'jpeg' ? { quality: 95 } : {})
    .toBuffer();

  ctx.progress(90, 'Encoding');
  return [{
    name: `${baseName(file.name)}-${factor}x.${format === 'jpeg' ? 'jpg' : 'png'}`,
    mime: format === 'jpeg' ? 'image/jpeg' : 'image/png',
    buffer,
  }];
};

// ---------------------------------------------------------------------------
// OCR through Mistral OCR. Text comes back as markdown, so headings survive.
// ---------------------------------------------------------------------------

export const ocr = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add the image to read.');
  const sharp = (await import('sharp')).default;

  ctx.progress(20, 'Preparing the page');
  const png = await sharp(file.path).png().toBuffer();
  if (png.length > 12 * 1024 * 1024) throw new UserError('That image is too large for OCR. Resize it under 12 MB.');

  ctx.progress(45, 'Reading text');
  const { markdown, pages } = await ocrImage(png, 'image/png');
  if (!markdown.trim()) throw new UserError('No text was found in that image.');

  return [{
    name: `${baseName(file.name)}-text.txt`,
    mime: 'text/plain; charset=utf-8',
    buffer: Buffer.from(`${markdown}\n\n---\nOCR: Mistral OCR · ${pages} page${pages === 1 ? '' : 's'}\n`, 'utf8'),
  }];
};

// ---------------------------------------------------------------------------
// Word / PowerPoint / web page -> PDF (text-faithful conversion).
// ---------------------------------------------------------------------------

function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) { lines.push(''); continue; }
    let line = '';
    for (const word of raw.split(/\s+/)) {
      if ((line + ' ' + word).trim().length > width && line) {
        lines.push(line.trim());
        line = word;
      } else {
        line = `${line} ${word}`.trim();
      }
    }
    if (line) lines.push(line.trim());
  }
  return lines;
}

async function textPdf(text: string, title: string): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const clean = (s: string) => s.replace(/[^\x20-\x7E\n]/g, ' ').replace(/[ \t]+/g, ' ');
  let page = doc.addPage([595, 842]);
  const margin = 54;
  let y = 792;
  page.drawText(clean(title).slice(0, 90), { x: margin, y, size: 16, font: bold });
  y -= 28;
  for (const line of wrap(clean(text), 92)) {
    if (y < 60) { page = doc.addPage([595, 842]); y = 792; }
    page.drawText(line, { x: margin, y, size: 10.5, font });
    y -= 15;
  }
  return Buffer.from(await doc.save());
}

async function docxText(filePath: string): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const { value } = await mammoth.extractRawText({ path: filePath });
  return value;
}

async function pptxText(filePath: string): Promise<string> {
  const zip = await JSZip.loadAsync(await fs.readFile(filePath));
  const slides = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => Number(a.match(/(\d+)/)?.[1]) - Number(b.match(/(\d+)/)?.[1]));
  const out: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    const xml = await zip.files[slides[i]].async('string');
    const runs = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
    out.push(`--- Slide ${i + 1} ---\n${runs.join('\n').trim()}`);
  }
  return out.join('\n\n');
}

async function htmlText(url: string): Promise<{ text: string; title: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TinyClone/1.0)' },
    signal: AbortSignal.timeout(30000),
    redirect: 'follow',
  });
  if (!res.ok) throw new UserError(`That page returned HTTP ${res.status}.`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('html') && !type.includes('text')) throw new UserError('That URL is not a web page.');
  const html = await res.text();
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? url;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text, title };
}

/** from-word, from-ppt, from-url */
export const docToPdf = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const mode = ctx.fixed.format ?? 'word';
  const file = ctx.files[0];
  let text = '';
  let title = '';

  if (mode === 'url') {
    const url = (ctx.params.url ?? '').trim();
    if (!/^https?:\/\//i.test(url)) throw new UserError('Paste a full link starting with http:// or https://.');
    ctx.progress(20, 'Fetching the page');
    const page = await htmlText(url);
    text = page.text;
    title = page.title;
    if (!text.trim()) throw new UserError('That page had no readable text.');
  } else {
    if (!file) throw new UserError(mode === 'ppt' ? 'Add a .pptx file.' : 'Add a .docx file.');
    ctx.progress(25, 'Reading the document');
    text = mode === 'ppt' ? await pptxText(file.path) : await docxText(file.path);
    title = baseName(file.name);
    if (!text.trim()) throw new UserError('That document has no readable text.');
  }

  ctx.progress(70, 'Laying out the PDF');
  const pdf = await textPdf(text, title);
  return [{
    name: `${(title || 'document').replace(/[^\w.\- ]+/g, '_').slice(0, 60) || 'document'}.pdf`,
    mime: 'application/pdf',
    buffer: pdf,
  }];
};
