import fs from 'node:fs/promises';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { EngineCtx, EngineOutput, UserError, baseName, paramInt, parsePageGroups, parsePages } from './types';

async function read(ctx: EngineCtx, i: number) {
  return fs.readFile(ctx.files[i].path);
}

function pdfName(ctx: EngineCtx, i = 0) {
  return baseName(ctx.files[i]?.name ?? 'document');
}

async function load(bytes: Uint8Array, label: string) {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    const message = String((err as Error).message ?? err);
    if (/encrypted/i.test(message)) {
      throw new UserError(`"${label}" is password-protected. Unlock it first, then retry.`);
    }
    throw new UserError(`"${label}" could not be read as a PDF (${message}).`);
  }
}

export const merge: EngineOutput_impl = async (ctx) => {
  if (ctx.files.length < 2) throw new UserError('Add at least two PDF files to merge.');
  const out = await PDFDocument.create();
  for (let i = 0; i < ctx.files.length; i++) {
    ctx.progress(Math.round((i / ctx.files.length) * 90), `Reading ${ctx.files[i].name}`);
    const src = await load(await read(ctx, i), ctx.files[i].name);
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
  }
  ctx.progress(95, 'Writing merged document');
  const bytes = await out.save();
  return [{ name: `${pdfName(ctx)}-merged.pdf`, mime: 'application/pdf', buffer: Buffer.from(bytes) }];
};

export const split: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF to split.');
  const src = await load(await read(ctx, 0), ctx.files[0].name);
  const total = src.getPageCount();
  const mode = ctx.params.mode ?? 'each';

  if (mode === 'ranges') {
    const spec = (ctx.params.ranges ?? '').trim();
    if (!spec) throw new UserError('Enter page ranges such as 1-3,4-6.');
    const groups = parsePageGroups(spec, total);
    const outputs: EngineOutput[] = [];
    for (let g = 0; g < groups.length; g++) {
      const doc = await PDFDocument.create();
      const pages = await doc.copyPages(src, groups[g]);
      pages.forEach((p) => doc.addPage(p));
      outputs.push({
        name: `${pdfName(ctx)}-part-${g + 1}.pdf`,
        mime: 'application/pdf',
        buffer: Buffer.from(await doc.save()),
      });
      ctx.progress(Math.round(((g + 1) / groups.length) * 95), `Part ${g + 1} of ${groups.length}`);
    }
    return outputs;
  }

  const outputs: EngineOutput[] = [];
  for (let i = 0; i < total; i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    outputs.push({
      name: `${pdfName(ctx)}-page-${i + 1}.pdf`,
      mime: 'application/pdf',
      buffer: Buffer.from(await doc.save()),
    });
    if (i % 5 === 0) ctx.progress(Math.round((i / total) * 95), `Page ${i + 1} of ${total}`);
  }
  return outputs;
};

export const compress: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF to compress.');
  const original = await read(ctx, 0);
  const src = await load(original, ctx.files[0].name);
  const level = ctx.params.level ?? 'balanced';

  if (level === 'strong') {
    src.setTitle('');
    src.setAuthor('');
    src.setSubject('');
    src.setKeywords([]);
    src.setProducer('');
    src.setCreator('');
  }
  ctx.progress(60, 'Rewriting object streams');
  const bytes = Buffer.from(await src.save({ useObjectStreams: true, addDefaultPage: false }));

  // Never hand back something larger than the input.
  const chosen = bytes.length < original.length ? bytes : original;
  const note = bytes.length < original.length
    ? ''
    : '';
  ctx.progress(98, note || 'Compressed');
  return [{
    name: `${pdfName(ctx)}-compressed.pdf`,
    mime: 'application/pdf',
    buffer: chosen,
  }];
};

export const rotate: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF to rotate.');
  const src = await load(await read(ctx, 0), ctx.files[0].name);
  const total = src.getPageCount();
  const angle = paramInt(ctx.params, 'angle', 90);
  const spec = (ctx.params.pages ?? '').trim();
  const targets = spec ? parsePages(spec, total) : src.getPageIndices();

  for (const idx of targets) {
    const page = src.getPage(idx);
    const next = (page.getRotation().angle + angle) % 360;
    page.setRotation(degrees(next));
  }
  ctx.progress(85, 'Writing rotated document');
  return [{
    name: `${pdfName(ctx)}-rotated.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await src.save()),
  }];
};

export const rearrange: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF to rearrange.');
  const spec = (ctx.params.order ?? '').trim();
  if (!spec) throw new UserError('Enter the new page order, for example 3,1,2.');
  const src = await load(await read(ctx, 0), ctx.files[0].name);
  const order = parsePages(spec.replace(/\s*-\s*/g, '-'), src.getPageCount());
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, order);
  pages.forEach((p) => doc.addPage(p));
  ctx.progress(90, 'Rebuilding document');
  return [{
    name: `${pdfName(ctx)}-reordered.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

export const removePages: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF.');
  const spec = (ctx.params.pages ?? '').trim();
  if (!spec) throw new UserError('Enter which pages to delete, for example 2,4-6.');
  const src = await load(await read(ctx, 0), ctx.files[0].name);
  const total = src.getPageCount();
  const doomed = new Set(parsePages(spec, total));
  const keep = src.getPageIndices().filter((i) => !doomed.has(i));
  if (!keep.length) throw new UserError('That would delete every page.');
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, keep);
  pages.forEach((p) => doc.addPage(p));
  ctx.progress(90, `${keep.length} of ${total} pages kept`);
  return [{
    name: `${pdfName(ctx)}-edited.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

const PAGE_SIZES: Record<string, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export const create: EngineOutput_impl = async (ctx) => {
  const text = (ctx.params.text ?? '').trim();
  if (!text) throw new UserError('Type some text to turn into a PDF.');
  const [width, height] = PAGE_SIZES[ctx.params.size ?? 'a4'] ?? PAGE_SIZES.a4;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  const margin = 56;
  const maxWidth = width - margin * 2;

  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    let current = '';
    for (const wordChunk of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${wordChunk}` : wordChunk;
      if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
        lines.push(current);
        current = wordChunk;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }

  const perPage = Math.floor((height - margin * 2) / lineHeight);
  const pageCount = Math.max(1, Math.ceil(lines.length / perPage));
  for (let p = 0; p < pageCount; p++) {
    const page = doc.addPage([width, height]);
    const slice = lines.slice(p * perPage, (p + 1) * perPage);
    slice.forEach((line, i) => {
      page.drawText(line, {
        x: margin,
        y: height - margin - (i + 1) * lineHeight + lineHeight * 0.3,
        size: fontSize,
        font,
        color: rgb(0.1, 0.12, 0.16),
      });
    });
    ctx.progress(Math.round(((p + 1) / pageCount) * 90), `Page ${p + 1} of ${pageCount}`);
  }
  return [{ name: 'document.pdf', mime: 'application/pdf', buffer: Buffer.from(await doc.save()) }];
};

export const watermark: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF to watermark.');
  const text = (ctx.params.text ?? '').trim() || 'CONFIDENTIAL';
  const opacity = Math.min(100, Math.max(1, paramInt(ctx.params, 'opacity', 18))) / 100;
  const angle = paramInt(ctx.params, 'angle', 45);
  const src = await load(await read(ctx, 0), ctx.files[0].name);
  const font = await src.embedFont(StandardFonts.HelveticaBold);

  const pages = src.getPages();
  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    const size = Math.max(18, Math.min(width, height) / 12);
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size,
      font,
      color: rgb(0.45, 0.45, 0.5),
      opacity,
      rotate: degrees(angle),
    });
    if (i % 10 === 0) ctx.progress(Math.round(((i + 1) / pages.length) * 90), `Page ${i + 1}`);
  });
  return [{
    name: `${pdfName(ctx)}-watermarked.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await src.save()),
  }];
};

export const fromImage: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add at least one JPG or PNG image.');
  const doc = await PDFDocument.create();
  for (let i = 0; i < ctx.files.length; i++) {
    const file = ctx.files[i];
    const bytes = await read(ctx, i);
    let image;
    try {
      image = /png$/i.test(file.mime) || /\.png$/i.test(file.name)
        ? await doc.embedPng(bytes)
        : await doc.embedJpg(bytes);
    } catch {
      throw new UserError(`"${file.name}" is not a JPG or PNG. Convert it first.`);
    }
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    ctx.progress(Math.round(((i + 1) / ctx.files.length) * 90), `Added ${i + 1} of ${ctx.files.length}`);
  }
  return [{ name: `${pdfName(ctx)}.pdf`, mime: 'application/pdf', buffer: Buffer.from(await doc.save()) }];
};

// ---- pdf.js backed: text extraction + rasterisation --------------------
type PdfjsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

async function loadPdfjs(): Promise<PdfjsModule> {
  const mod = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as PdfjsModule;
  return mod;
}

export const extractText: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF.');
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await read(ctx, 0));
  ctx.progress(15, 'Opening document');
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;
  const chunks: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/[ \t]+/g, ' ')
      .trim();
    chunks.push(`--- Page ${p} ---\n${pageText}`);
    ctx.progress(15 + Math.round((p / doc.numPages) * 75), `Page ${p} of ${doc.numPages}`);
  }
  await doc.destroy();
  const text = chunks.join('\n\n');
  if (!text.replace(/--- Page \d+ ---/g, '').trim()) {
    throw new UserError('This PDF has no text layer (it looks scanned). That needs OCR.');
  }
  return [{ name: `${pdfName(ctx)}.txt`, mime: 'text/plain; charset=utf-8', buffer: Buffer.from(text, 'utf8') }];
};

export const toImage: EngineOutput_impl = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add a PDF.');
  const format = ctx.fixed.format === 'png' ? 'png' : 'jpeg';
  const scale = Math.min(3, Math.max(1, paramInt(ctx.params, 'scale', 2)));
  const pdfjs = await loadPdfjs();
  const { createCanvas, Path2D, ImageData } = (await import('@napi-rs/canvas')) as unknown as {
    createCanvas: (w: number, h: number) => {
      getContext: (t: '2d') => CanvasRenderingContext2D;
      toBuffer: (mime: string, quality?: number) => Buffer;
    };
    Path2D: unknown;
    ImageData: unknown;
  };
  const g = globalThis as Record<string, unknown>;
  if (Path2D) g.Path2D ??= Path2D;
  if (ImageData) g.ImageData ??= ImageData;

  const data = new Uint8Array(await read(ctx, 0));
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;
  const outputs: EngineOutput[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const canvasContext = canvas.getContext('2d');
    await page.render({ canvasContext, viewport } as never).promise;
    const buffer = format === 'png' ? canvas.toBuffer('image/png') : canvas.toBuffer('image/jpeg', 92);
    outputs.push({
      name: `${pdfName(ctx)}-page-${p}.${format === 'png' ? 'png' : 'jpg'}`,
      mime: format === 'png' ? 'image/png' : 'image/jpeg',
      buffer,
    });
    ctx.progress(Math.round((p / doc.numPages) * 95), `Rendered ${p} of ${doc.numPages}`);
  }
  await doc.destroy();
  return outputs;
};

// Local alias keeps the engine signatures readable.
type EngineOutput_impl = (ctx: EngineCtx) => Promise<EngineOutput[]>;
