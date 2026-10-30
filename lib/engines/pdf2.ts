// Second PDF engine: overlays, cropping, image extraction, signing and
// exports to Word / PowerPoint / Excel / CSV / TIFF.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';
import {
  PDFDocument, PDFName, PDFRawStream, PDFArray, PDFDict, StandardFonts, degrees, rgb,
} from 'pdf-lib';
import { EngineCtx, EngineFn, EngineOutput, UserError, baseName, paramInt, parsePages } from './types';
import { xlsxModule } from './data';

async function loadPdf(ctx: EngineCtx, index = 0) {
  const file = ctx.files[index];
  if (!file) throw new UserError('Add a PDF first.');
  const bytes = await fs.readFile(file.path);
  try {
    return { doc: await PDFDocument.load(bytes, { updateMetadata: false }), file };
  } catch (err) {
    const message = String((err as Error).message ?? err);
    if (/encrypted/i.test(message)) throw new UserError(`"${file.name}" is password-protected.`);
    throw new UserError(`"${file.name}" could not be read as a PDF (${message}).`);
  }
}

function pdfName(ctx: EngineCtx, index = 0) {
  return baseName(ctx.files[index]?.name ?? 'document');
}

function hexToRgb(raw: string | undefined, fallback = '#111827') {
  const value = /^#[0-9a-f]{6}$/i.test(raw ?? '') ? (raw as string) : fallback;
  return rgb(
    parseInt(value.slice(1, 3), 16) / 255,
    parseInt(value.slice(3, 5), 16) / 255,
    parseInt(value.slice(5, 7), 16) / 255,
  );
}

async function embedImage(doc: PDFDocument, filePath: string, fileName: string) {
  const raw = await fs.readFile(filePath);
  if (/\.png$/i.test(fileName)) return doc.embedPng(raw);
  if (/\.jpe?g$/i.test(fileName)) return doc.embedJpg(raw);
  const png = await sharp(raw).rotate().png().toBuffer();
  return doc.embedPng(png);
}

const pct = (value: number, total: number) => (Math.min(100, Math.max(0, value)) / 100) * total;

// ---- overlays -----------------------------------------------------------

export const addText: EngineFn = async (ctx) => {
  const text = (ctx.params.text ?? '').trim();
  if (!text) throw new UserError('Type the text to place on the page.');
  const { doc, file } = await loadPdf(ctx);
  const pages = doc.getPages();
  const targets = (ctx.params.pages ?? '').trim()
    ? parsePages(ctx.params.pages as string, pages.length)
    : pages.map((_, i) => i);
  const size = Math.min(200, Math.max(4, paramInt(ctx.params, 'size', 18)));
  const colour = hexToRgb(ctx.params.color);
  const xPct = Math.min(100, Math.max(0, paramInt(ctx.params, 'x', 8)));
  const yPct = Math.min(100, Math.max(0, paramInt(ctx.params, 'y', 8)));
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const lines = text.split(/\r?\n/);
  targets.forEach((index, n) => {
    const page = pages[index];
    if (!page) return;
    const { width, height } = page.getSize();
    const lineHeight = size * 1.35;
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: pct(xPct, width),
        y: height - pct(yPct, height) - i * lineHeight - size,
        size,
        font,
        color: colour,
      });
    });
    if (n % 10 === 0) ctx.progress(Math.round(((n + 1) / targets.length) * 88), `Page ${index + 1}`);
  });
  return [{
    name: `${pdfName(ctx)}-text.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

export const annotate: EngineFn = async (ctx) => {
  const { doc } = await loadPdf(ctx);
  const pages = doc.getPages();
  const targets = (ctx.params.pages ?? '').trim()
    ? parsePages(ctx.params.pages as string, pages.length)
    : [0];
  const colour = hexToRgb(ctx.params.color, '#f59e0b');
  const opacity = Math.min(1, Math.max(0.05, paramInt(ctx.params, 'opacity', 35) / 100));
  const xPct = Math.min(95, Math.max(0, paramInt(ctx.params, 'x', 10)));
  const yPct = Math.min(95, Math.max(0, paramInt(ctx.params, 'y', 10)));
  const wPct = Math.min(100, Math.max(1, paramInt(ctx.params, 'width', 40)));
  const hPct = Math.min(100, Math.max(1, paramInt(ctx.params, 'height', 8)));
  const note = (ctx.params.note ?? '').trim();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  targets.forEach((index) => {
    const page = pages[index];
    if (!page) return;
    const { width, height } = page.getSize();
    const x = pct(xPct, width);
    const boxW = pct(wPct, width);
    const boxH = pct(hPct, height);
    const y = height - pct(yPct, height) - boxH;
    page.drawRectangle({ x, y, width: boxW, height: boxH, color: colour, opacity, borderColor: colour, borderWidth: 1.5 });
    if (note) {
      page.drawText(note, { x: x + 6, y: y + boxH - 16, size: 10, font, color: rgb(0.1, 0.1, 0.12) });
    }
  });
  ctx.progress(90, 'Writing annotations');
  return [{
    name: `${pdfName(ctx)}-annotated.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

export const stampImages: EngineFn = async (ctx) => {
  if (ctx.files.length < 2) throw new UserError('Add the PDF plus at least one image to place on it.');
  const { doc } = await loadPdf(ctx);
  const images: Awaited<ReturnType<PDFDocument['embedPng']>>[] = [];
  for (let i = 1; i < ctx.files.length; i++) {
    images.push(await embedImage(doc, ctx.files[i].path, ctx.files[i].name));
  }
  const widthPct = Math.min(100, Math.max(2, paramInt(ctx.params, 'width', 25)));
  const margin = Math.min(120, Math.max(0, paramInt(ctx.params, 'margin', 18)));
  const opacity = Math.min(1, Math.max(0.05, paramInt(ctx.params, 'opacity', 100) / 100));
  const position = ctx.params.position ?? 'bottom-right';
  doc.getPages().forEach((page, n) => {
    const { width, height } = page.getSize();
    images.forEach((image) => {
      const w = pct(widthPct, width);
      const h = (image.height / image.width) * w;
      let x = margin;
      let y = height - h - margin;
      if (position.startsWith('bottom')) y = margin;
      if (position.endsWith('right')) x = width - w - margin;
      if (position === 'center') { x = (width - w) / 2; y = (height - h) / 2; }
      page.drawImage(image, { x, y, width: w, height: h, opacity });
    });
    if (n % 10 === 0) ctx.progress(Math.round(((n + 1) / doc.getPageCount()) * 85), `Page ${n + 1}`);
  });
  return [{
    name: `${pdfName(ctx)}-with-images.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

export const addBlank: EngineFn = async (ctx) => {
  const { doc } = await loadPdf(ctx);
  const count = Math.min(50, Math.max(1, paramInt(ctx.params, 'count', 1)));
  const raw = (ctx.params.after ?? 'end').trim().toLowerCase();
  const total = doc.getPageCount();
  let at = total;
  if (raw !== 'end' && raw !== '') {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > total) {
      throw new UserError(`"${raw}" is not a page between 0 and ${total}.`);
    }
    at = Math.trunc(parsed);
  }
  const sample = doc.getPage(Math.max(0, Math.min(total - 1, at - 1)));
  const size: [number, number] = sample ? [sample.getWidth(), sample.getHeight()] : [595.28, 841.89];
  for (let i = 0; i < count; i++) doc.insertPage(Math.min(total, at + i), size);
  ctx.progress(90, `Inserted ${count} page${count === 1 ? '' : 's'}`);
  return [{
    name: `${pdfName(ctx)}-padded.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

export const crop: EngineFn = async (ctx) => {
  const { doc } = await loadPdf(ctx);
  const top = Math.min(45, Math.max(0, paramInt(ctx.params, 'top', 5)));
  const bottom = Math.min(45, Math.max(0, paramInt(ctx.params, 'bottom', 5)));
  const left = Math.min(45, Math.max(0, paramInt(ctx.params, 'left', 5)));
  const right = Math.min(45, Math.max(0, paramInt(ctx.params, 'right', 5)));
  if (top + bottom >= 90 || left + right >= 90) throw new UserError('Those margins would crop everything away.');
  doc.getPages().forEach((page, i) => {
    const { width, height } = page.getSize();
    const x = pct(left, width);
    const y = pct(bottom, height);
    const w = width - pct(left + right, width);
    const h = height - pct(top + bottom, height);
    page.setCropBox(x, y, w, h);
    if (i % 10 === 0) ctx.progress(Math.round(((i + 1) / doc.getPageCount()) * 85), `Page ${i + 1}`);
  });
  return [{
    name: `${pdfName(ctx)}-cropped.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

// ---- image extraction ---------------------------------------------------

function unfilter(data: Buffer, width: number, height: number, colors: number, bpc: number) {
  const rowLen = Math.ceil((colors * bpc * width) / 8);
  const bpp = Math.max(1, Math.ceil((colors * bpc) / 8));
  const out = Buffer.alloc(rowLen * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = data[pos++];
    const row = data.subarray(pos, pos + rowLen);
    pos += rowLen;
    const cur = out.subarray(y * rowLen, (y + 1) * rowLen);
    const prev = y > 0 ? out.subarray((y - 1) * rowLen, y * rowLen) : null;
    for (let x = 0; x < rowLen; x++) {
      const raw = row[x] ?? 0;
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let value = raw;
      if (filter === 1) value = raw + a;
      else if (filter === 2) value = raw + b;
      else if (filter === 3) value = raw + ((a + b) >> 1);
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      }
      cur[x] = value & 0xff;
    }
  }
  return out;
}

export const extractImages: EngineFn = async (ctx) => {
  const { doc } = await loadPdf(ctx);
  const outputs: EngineOutput[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    const dict = object.dict;
    if (dict.get(PDFName.of('Subtype'))?.toString() !== '/Image') continue;
    const width = Number(dict.get(PDFName.of('Width'))?.toString() ?? 0);
    const height = Number(dict.get(PDFName.of('Height'))?.toString() ?? 0);
    if (!width || !height) { skipped++; continue; }
    const filterRef = dict.get(PDFName.of('Filter'));
    const filters = filterRef instanceof PDFArray
      ? filterRef.asArray().map((f) => f.toString().replace('/', ''))
      : filterRef ? [filterRef.toString().replace('/', '')] : [];
    const contents = Buffer.from(object.contents);
    const key = `${width}x${height}:${contents.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      if (filters.includes('DCTDecode')) {
        outputs.push({ name: `image-${outputs.length + 1}.jpg`, mime: 'image/jpeg', buffer: contents });
        continue;
      }
      if (filters.includes('JPXDecode') || filters.includes('JBIG2Decode')) { skipped++; continue; }
      let pixels = contents;
      if (filters.includes('FlateDecode')) pixels = zlib.inflateSync(contents);
      if (filters.includes('ASCIIHexDecode')) {
        const text = pixels.toString('latin1').replace(/>.*$/s, '').replace(/\s+/g, '');
        pixels = Buffer.from(text, 'hex');
      }
      const space = dict.get(PDFName.of('ColorSpace'))?.toString() ?? '/DeviceRGB';
      const colors = /Gray/i.test(space) ? 1 : /CMYK/i.test(space) ? 4 : 3;
      const bpc = Number(dict.get(PDFName.of('BitsPerComponent'))?.toString() ?? 8);
      if (bpc !== 8) { skipped++; continue; }
      const params = dict.get(PDFName.of('DecodeParms'));
      let predictor = 1;
      if (params instanceof PDFDict) predictor = Number(params.get(PDFName.of('Predictor'))?.toString() ?? 1);
      const rows = predictor >= 10 ? unfilter(pixels, width, height, colors, bpc) : pixels;
      if (colors === 4) { skipped++; continue; }
      if (rows.length < width * height * colors) { skipped++; continue; }
      const png = await sharp(rows, { raw: { width, height, channels: colors as 1 | 3 } }).png().toBuffer();
      outputs.push({ name: `image-${outputs.length + 1}.png`, mime: 'image/png', buffer: png });
    } catch {
      skipped++;
    }
    ctx.progress(Math.min(92, 20 + outputs.length * 4), `Found ${outputs.length} image${outputs.length === 1 ? '' : 's'}`);
  }
  if (!outputs.length) {
    throw new UserError(`No extractable raster images were found${skipped ? ` (${skipped} used an unsupported encoding)` : ''}. Scanned pages need the PDF-to-image tool instead.`);
  }
  return outputs;
};

export const sign: EngineFn = async (ctx) => {
  if (ctx.files.length < 2) throw new UserError('Add the PDF and an image of your signature.');
  const { doc } = await loadPdf(ctx);
  const image = await embedImage(doc, ctx.files[1].path, ctx.files[1].name);
  const pages = doc.getPages();
  const rawPage = (ctx.params.page ?? '1').trim().toLowerCase();
  const pageIndex = rawPage === 'last' ? pages.length - 1 : Math.max(0, Math.min(pages.length - 1, paramInt(ctx.params, 'page', 1) - 1));
  const page = pages[pageIndex];
  const { width, height } = page.getSize();
  const w = pct(Math.min(80, Math.max(5, paramInt(ctx.params, 'width', 25))), width);
  const h = (image.height / image.width) * w;
  const x = pct(Math.min(100, Math.max(0, paramInt(ctx.params, 'x', 65))), width);
  const y = height - pct(Math.min(100, Math.max(0, paramInt(ctx.params, 'y', 78))), height) - h;
  page.drawImage(image, { x: Math.min(x, width - w), y: Math.max(0, Math.min(y, height - h)), width: w, height: h });
  ctx.progress(90, `Signed page ${pageIndex + 1}`);
  return [{
    name: `${pdfName(ctx)}-signed.pdf`,
    mime: 'application/pdf',
    buffer: Buffer.from(await doc.save()),
  }];
};

// ---- pdf.js text + raster helpers ---------------------------------------

async function textByPage(ctx: EngineCtx) {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add a PDF.');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(await fs.readFile(file.path));
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lines = new Map<number, string[]>();
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = Math.round(item.transform[5]);
      const list = lines.get(y) ?? [];
      list.push(item.str);
      lines.set(y, list);
    }
    const ordered = [...lines.entries()].sort((a, b) => b[0] - a[0]).map(([, parts]) => parts.join(' ').replace(/\s+/g, ' ').trim());
    pages.push(ordered.join('\n'));
    ctx.progress(10 + Math.round((p / doc.numPages) * 60), `Reading page ${p} of ${doc.numPages}`);
  }
  const empty = pages.every((p) => !p.trim());
  if (empty) throw new UserError('This PDF has no text layer (it looks scanned). That needs OCR.');
  return pages;
}

async function renderPages(ctx: EngineCtx, scale = 2) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const canvas = await import('@napi-rs/canvas');
  const g = globalThis as Record<string, unknown>;
  if (canvas.Path2D) g.Path2D ??= canvas.Path2D;
  if (canvas.ImageData) g.ImageData ??= canvas.ImageData;
  const data = new Uint8Array(await fs.readFile(ctx.files[0].path));
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;
  const pages: Buffer[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const viewport = page.getViewport({ scale });
    const surface = canvas.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    await page.render({ canvasContext: surface.getContext('2d'), viewport } as never).promise;
    pages.push(surface.toBuffer('image/png'));
    ctx.progress(5 + Math.round((p / doc.numPages) * 60), `Rendered ${p} of ${doc.numPages}`);
  }
  await doc.destroy();
  return pages;
}

// ---- exports ------------------------------------------------------------

export const toDocx: EngineFn = async (ctx) => {
  const pages = await textByPage(ctx);
  const docxModule = (await import('docx')) as unknown as { default?: typeof import('docx') };
  const docx = docxModule.default ?? (docxModule as unknown as typeof import('docx'));
  const children: InstanceType<typeof docx.Paragraph>[] = [];
  pages.forEach((text, i) => {
    children.push(new docx.Paragraph({ text: `Page ${i + 1}`, heading: docx.HeadingLevel.HEADING_2 }));
    for (const line of text.split('\n')) {
      children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: line, size: 22 })] }));
    }
  });
  const document = new docx.Document({ sections: [{ children }] });
  const buffer = await docx.Packer.toBuffer(document);
  ctx.progress(92, 'Writing DOCX');
  return [{
    name: `${pdfName(ctx)}.docx`,
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer,
  }];
};

export const toPptx: EngineFn = async (ctx) => {
  const pages = await renderPages(ctx, 1.6);
  const mod = await import('pptxgenjs');
  const PptxGen = (mod.default ?? mod) as unknown as new () => {
    defineLayout: (o: { name: string; width: number; height: number }) => void;
    layout: string;
    addSlide: () => { addImage: (o: Record<string, unknown>) => void };
    write: (o: { outputType: string }) => Promise<unknown>;
  };
  const pptx = new PptxGen();
  pptx.defineLayout({ name: 'WIDE', width: 10, height: 5.63 });
  pptx.layout = 'WIDE';
  for (const png of pages) {
    const slide = pptx.addSlide();
    slide.addImage({ data: `image/png;base64,${png.toString('base64')}`, x: 0, y: 0, w: 10, h: 5.63 });
  }
  const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
  ctx.progress(92, 'Writing PPTX');
  return [{
    name: `${pdfName(ctx)}.pptx`,
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    buffer,
  }];
};

export const toXlsx: EngineFn = async (ctx) => {
  const pages = await textByPage(ctx);
  const XLSX = await xlsxModule();
  const workbook = XLSX.utils.book_new();
  pages.forEach((text, i) => {
    const rows = text.split('\n').map((line) => line.split(/\s{2,}|\t/).filter(Boolean));
    const sheet = XLSX.utils.aoa_to_sheet(rows.length ? rows : [['(no text on this page)']]);
    XLSX.utils.book_append_sheet(workbook, sheet, `Page ${i + 1}`.slice(0, 31));
  });
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  ctx.progress(92, 'Writing XLSX');
  return [{
    name: `${pdfName(ctx)}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  }];
};

export const toCsv: EngineFn = async (ctx) => {
  const pages = await textByPage(ctx);
  const quote = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const rows = pages.flatMap((text, i) =>
    text.split('\n').filter((l) => l.trim()).map((line) => `${quote(`Page ${i + 1}`)},${quote(line)}`));
  const csv = 'page,text\r\n' + rows.join('\r\n') + '\r\n';
  return [{ name: `${pdfName(ctx)}.csv`, mime: 'text/csv; charset=utf-8', buffer: Buffer.from(csv, 'utf8') }];
};

export const toTiff: EngineFn = async (ctx) => {
  const rendered = await renderPages(ctx, 2);
  const outputs: EngineOutput[] = [];
  for (let i = 0; i < rendered.length; i++) {
    // One LZW-compressed TIFF per page: every viewer and print pipeline reads it.
    const buffer = await sharp(rendered[i])
      .flatten({ background: '#ffffff' })
      .tiff({ compression: 'lzw', quality: 90 })
      .toBuffer();
    outputs.push({
      name: `${pdfName(ctx)}-page-${i + 1}.tiff`,
      mime: 'image/tiff',
      buffer,
    });
    ctx.progress(70 + Math.round(((i + 1) / rendered.length) * 25), `Page ${i + 1} to TIFF`);
  }
  return outputs;
};

export const fromImageAny: EngineFn = async (ctx) => {
  if (!ctx.files.length) throw new UserError('Add at least one image.');
  const doc = await PDFDocument.create();
  for (let i = 0; i < ctx.files.length; i++) {
    const file = ctx.files[i];
    const png = await sharp(await fs.readFile(file.path)).rotate().png().toBuffer();
    const image = await doc.embedPng(png);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    ctx.progress(Math.round(((i + 1) / ctx.files.length) * 88), `Added ${i + 1} of ${ctx.files.length}`);
  }
  return [{ name: `${pdfName(ctx)}.pdf`, mime: 'application/pdf', buffer: Buffer.from(await doc.save()) }];
};

/** Kept for parity with the first engine: a watermark that is a signature block. */
export const stampNote: EngineFn = async (ctx) => {
  const { doc } = await loadPdf(ctx);
  const note = (ctx.params.text ?? '').trim() || 'Reviewed';
  const font = await doc.embedFont(StandardFonts.HelveticaOblique);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(note, { x: 24, y: height - 28, size: 10, font, color: rgb(0.3, 0.3, 0.35), rotate: degrees(0) });
    page.drawText(note, { x: 24, y: 16, size: 10, font, color: rgb(0.3, 0.3, 0.35), opacity: 0.4 });
    page.drawText(note, { x: width - 140, y: height / 2, size: 10, font, opacity: 0.15 });
  }
  return [{ name: `${pdfName(ctx)}-stamped.pdf`, mime: 'application/pdf', buffer: Buffer.from(await doc.save()) }];
};
