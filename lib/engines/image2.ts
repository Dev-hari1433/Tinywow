// Second image engine: compositing, vector tracing, PSD, EPS, text rendering
// and metadata. Everything runs on sharp, canvas, potrace and ag-psd.
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import sharp from 'sharp';
import { EngineCtx, EngineFn, EngineOutput, UserError, baseName, paramInt } from './types';
import { parseCsv } from './data';

type Potrace = {
  trace: (buf: Buffer, opts: Record<string, unknown>, cb: (err: Error | null, svg: string) => void) => void;
};

async function loadPotrace(): Promise<Potrace> {
  const ns = (await import('potrace')) as unknown as { default?: Potrace; trace?: Potrace['trace'] };
  const mod = ns.default ?? (ns as unknown as Potrace);
  if (typeof mod?.trace !== 'function') throw new UserError('The vector tracer is unavailable in this build.');
  return mod;
}

const MIME: Record<string, string> = {
  jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif',
  tiff: 'image/tiff', gif: 'image/gif', svg: 'image/svg+xml', eps: 'application/postscript',
};
const EXT: Record<string, string> = { jpeg: 'jpg' };

type CanvasModule = typeof import('@napi-rs/canvas');
async function canvasModule(): Promise<CanvasModule> {
  const mod = (await import('@napi-rs/canvas')) as unknown as CanvasModule & { default?: CanvasModule };
  return (typeof mod.createCanvas === 'function' ? mod : (mod.default ?? mod)) as CanvasModule;
}

function hexColour(raw: string | undefined, fallback: string) {
  return /^#[0-9a-f]{3,8}$/i.test(raw ?? '') ? (raw as string) : fallback;
}

async function encode(pipeline: sharp.Sharp, format: string, quality = 90) {
  switch (format) {
    case 'jpeg': return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case 'png': return pipeline.png({ compressionLevel: 9 }).toBuffer();
    case 'webp': return pipeline.webp({ quality }).toBuffer();
    case 'avif': return pipeline.avif({ quality: Math.min(quality, 80) }).toBuffer();
    case 'tiff': return pipeline.tiff({ quality }).toBuffer();
    case 'gif': return pipeline.gif().toBuffer();
    default: throw new UserError(`Cannot encode as ${format}.`);
  }
}

async function readImage(ctx: EngineCtx, i = 0) {
  const file = ctx.files[i];
  if (!file) throw new UserError('Add an image first.');
  const buffer = await fs.readFile(file.path);
  const meta = await sharp(buffer).metadata();
  if (!meta.width || !meta.height) throw new UserError(`"${file.name}" could not be decoded as an image.`);
  return { buffer, meta, name: baseName(file.name) };
}

/** Renders wrapped text to a PNG with the bundled canvas (also used by the meme tool). */
export async function drawTextPng(opts: {
  width: number;
  height: number;
  background: string;
  lines: { text: string; size: number; colour: string; bold?: boolean; font?: string }[];
  align?: 'left' | 'center';
  padding?: number;
}) {
  const { createCanvas } = await canvasModule();
  const canvas = createCanvas(opts.width, opts.height);
  const g = canvas.getContext('2d');
  g.fillStyle = opts.background;
  g.fillRect(0, 0, opts.width, opts.height);
  g.textBaseline = 'top';
  const pad = opts.padding ?? Math.round(opts.width * 0.06);
  let y = pad;
  for (const line of opts.lines) {
    g.fillStyle = line.colour;
    g.font = `${line.bold ? 'bold ' : ''}${line.size}px ${line.font ?? 'Arial'}`;
    g.textAlign = opts.align ?? 'center';
    const x = (opts.align ?? 'center') === 'center' ? opts.width / 2 : pad;
    for (const paragraph of line.text.split(/\r?\n/)) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (g.measureText(candidate).width > opts.width - pad * 2 && current) {
          g.fillText(current, x, y);
          y += line.size * 1.3;
          current = word;
        } else {
          current = candidate;
        }
      }
      g.fillText(current, x, y);
      y += line.size * 1.35;
    }
  }
  return canvas.toBuffer('image/png');
}

// ---- engines ------------------------------------------------------------

export const addImages: EngineFn = async (ctx) => {
  if (ctx.files.length < 2) throw new UserError('Add the base image plus at least one image to place on it.');
  const base = await readImage(ctx, 0);
  const position = ctx.params.position ?? 'bottom-right';
  const widthPct = Math.min(90, Math.max(5, paramInt(ctx.params, 'scale', 25)));
  const margin = Math.min(200, Math.max(0, paramInt(ctx.params, 'margin', 16)));
  const overlays: { input: Buffer; top: number; left: number }[] = [];
  const baseW = base.meta.width!;
  const baseH = base.meta.height!;
  let cursorY = margin;
  for (let i = 1; i < ctx.files.length; i++) {
    const buf = await fs.readFile(ctx.files[i].path);
    const resized = await sharp(buf)
      .resize({ width: Math.round((baseW * widthPct) / 100) })
      .png()
      .toBuffer();
    const meta = await sharp(resized).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    let top = margin;
    let left = margin;
    if (position === 'bottom-right') { top = baseH - h - margin; left = baseW - w - margin; }
    else if (position === 'bottom-left') { top = baseH - h - margin; left = margin; }
    else if (position === 'top-right') { top = margin; left = baseW - w - margin; }
    else if (position === 'top-left') { top = margin; left = margin; }
    else if (position === 'center') { top = Math.round((baseH - h) / 2); left = Math.round((baseW - w) / 2); }
    if (position === 'stack') { top = cursorY; left = margin; cursorY += h + Math.round(margin / 2); }
    overlays.push({ input: resized, top: Math.max(0, Math.min(baseH - h, top)), left: Math.max(0, Math.min(baseW - w, left)) });
    ctx.progress(10 + Math.round((i / ctx.files.length) * 70), `Placing image ${i}`);
  }
  const format = (ctx.params.format ?? base.meta.format ?? 'png').toLowerCase();
  const output = await encode(sharp(base.buffer).rotate().composite(overlays), format, 92);
  return [{ name: `${base.name}-with-images.${EXT[format] ?? format}`, mime: MIME[format] ?? 'image/png', buffer: output }];
};

export const collage: EngineFn = async (ctx) => {
  if (ctx.files.length < 2) throw new UserError('Add at least two images to build a collage.');
  const columns = Math.min(6, Math.max(1, paramInt(ctx.params, 'columns', 2)));
  const cell = Math.min(1200, Math.max(120, paramInt(ctx.params, 'cell', 480)));
  const gap = Math.min(80, Math.max(0, paramInt(ctx.params, 'gap', 12)));
  const background = hexColour(ctx.params.background, '#ffffff');
  const rows = Math.ceil(ctx.files.length / columns);
  const width = columns * cell + gap * (columns + 1);
  const height = rows * cell + gap * (rows + 1);
  const composites: { input: Buffer; top: number; left: number }[] = [];
  for (let i = 0; i < ctx.files.length; i++) {
    const buf = await fs.readFile(ctx.files[i].path);
    const tile = await sharp(buf)
      .resize(cell, cell, { fit: 'cover', position: 'attention' })
      .png()
      .toBuffer();
    const col = i % columns;
    const row = Math.floor(i / columns);
    composites.push({ input: tile, top: gap + row * (cell + gap), left: gap + col * (cell + gap) });
    ctx.progress(10 + Math.round(((i + 1) / ctx.files.length) * 75), `Tile ${i + 1}`);
  }
  const output = await sharp({ create: { width, height, channels: 4, background } })
    .composite(composites)
    .png()
    .toBuffer();
  return [{ name: 'collage.png', mime: 'image/png', buffer: output }];
};

export const chart: EngineFn = async (ctx) => {
  const rows = parseCsv(await fs.readFile(ctx.files[0].path, 'utf8'));
  if (rows.length < 2) throw new UserError('The CSV needs a header row and at least one data row.');
  const type = ctx.params.type ?? 'bar';
  const title = (ctx.params.title ?? '').trim();
  const [header, ...body] = rows;
  const labels = body.map((r) => r[0]?.trim() || '');
  const values = body.map((r) => Number(String(r[1] ?? '').replace(/[^0-9.-]/g, '')) || 0);
  const width = 960;
  const height = 600;
  const pad = { top: title ? 90 : 50, right: 50, bottom: 90, left: 80 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...values, 1);
  const palette = ['#2f6fed', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    `<text x="${width / 2}" y="46" font-family="Helvetica,Arial" font-size="28" font-weight="bold" text-anchor="middle" fill="#111827">${esc(title || header[1] || 'Chart')}</text>`,
    `<line x1="${pad.left}" y1="${pad.top + plotH}" x2="${pad.left + plotW}" y2="${pad.top + plotH}" stroke="#cbd5e1" stroke-width="2"/>`,
    `<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top + plotH}" stroke="#cbd5e1" stroke-width="2"/>`,
  ];
  for (let g = 0; g <= 4; g++) {
    const y = pad.top + plotH - (plotH * g) / 4;
    const value = Math.round((max * g) / 4);
    parts.push(`<line x1="${pad.left}" y1="${y}" x2="${pad.left + plotW}" y2="${y}" stroke="#eef2f7" stroke-width="1"/>`);
    parts.push(`<text x="${pad.left - 12}" y="${y + 5}" font-family="Helvetica,Arial" font-size="14" text-anchor="end" fill="#64748b">${value}</text>`);
  }
  if (type === 'pie') {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const cx = width / 2;
    const cy = pad.top + plotH / 2;
    const r = Math.min(plotW, plotH) / 2 - 10;
    let angle = -Math.PI / 2;
    values.forEach((value, i) => {
      const slice = (value / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle + slice);
      const y2 = cy + r * Math.sin(angle + slice);
      const large = slice > Math.PI ? 1 : 0;
      parts.push(`<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${palette[i % palette.length]}"/>`);
      angle += slice;
    });
    labels.forEach((label, i) => {
      parts.push(`<rect x="${width - 180}" y="${pad.top + i * 24}" width="14" height="14" fill="${palette[i % palette.length]}"/>`);
      parts.push(`<text x="${width - 160}" y="${pad.top + 12 + i * 24}" font-family="Helvetica,Arial" font-size="14" fill="#111827">${esc(label)}</text>`);
    });
  } else if (type === 'line') {
    const step = plotW / Math.max(1, values.length - 1 || 1);
    const points = values.map((value, i) =>
      `${(pad.left + i * step).toFixed(1)},${(pad.top + plotH - (value / max) * plotH).toFixed(1)}`).join(' ');
    parts.push(`<polyline points="${points}" fill="none" stroke="${palette[0]}" stroke-width="4" stroke-linejoin="round"/>`);
    values.forEach((value, i) => {
      const cx2 = pad.left + i * step;
      const cy2 = pad.top + plotH - (value / max) * plotH;
      parts.push(`<circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="5" fill="${palette[0]}"/>`);
      parts.push(`<text x="${cx2.toFixed(1)}" y="${height - pad.bottom + 28}" font-family="Helvetica,Arial" font-size="13" text-anchor="middle" fill="#475569">${esc(labels[i] ?? '')}</text>`);
    });
  } else {
    const slot = plotW / Math.max(1, values.length);
    values.forEach((value, i) => {
      const barH = (value / max) * plotH;
      const x = pad.left + slot * i + slot * 0.15;
      const w = slot * 0.7;
      parts.push(`<rect x="${x.toFixed(1)}" y="${(pad.top + plotH - barH).toFixed(1)}" width="${w.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="${palette[i % palette.length]}"/>`);
      parts.push(`<text x="${(x + w / 2).toFixed(1)}" y="${(pad.top + plotH - barH - 8).toFixed(1)}" font-family="Helvetica,Arial" font-size="14" text-anchor="middle" fill="#334155">${value}</text>`);
      parts.push(`<text x="${(x + w / 2).toFixed(1)}" y="${height - pad.bottom + 28}" font-family="Helvetica,Arial" font-size="13" text-anchor="middle" fill="#475569">${esc(labels[i] ?? '')}</text>`);
    });
  }
  parts.push('</svg>');
  const buffer = await sharp(Buffer.from(parts.join(''))).png().toBuffer();
  ctx.progress(90, 'Rendering chart');
  return [{ name: `${baseName(ctx.files[0].name)}-${type}.png`, mime: 'image/png', buffer }];
};

export const textToImage: EngineFn = async (ctx) => {
  const text = (ctx.params.text ?? '').trim();
  if (!text) throw new UserError('Type the text to render.');
  const width = Math.min(2400, Math.max(120, paramInt(ctx.params, 'width', 1000)));
  const size = Math.min(220, Math.max(10, paramInt(ctx.params, 'size', 48)));
  const lines = text.split(/\r?\n/).length;
  const height = Math.min(2400, Math.max(120, paramInt(ctx.params, 'height', 0) || size * 1.6 * lines + size * 2));
  const buffer = await drawTextPng({
    width,
    height,
    background: hexColour(ctx.params.background, '#0b1020'),
    lines: [{ text, size, colour: hexColour(ctx.params.color, '#ffffff'), bold: ctx.params.bold === 'yes' }],
  });
  return [{ name: 'text-image.png', mime: 'image/png', buffer }];
};

export const fontToPng: EngineFn = async (ctx) => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add a .ttf or .otf font file.');
  const { createCanvas, GlobalFonts } = await canvasModule();
  const family = `Uploaded${Date.now().toString(36)}`;
  if (!GlobalFonts.registerFromPath(file.path, family)) {
    throw new UserError(`"${file.name}" is not a font this build can load.`);
  }
  const text = (ctx.params.text ?? 'The quick brown fox jumps over the lazy dog').trim();
  const size = Math.min(400, Math.max(12, paramInt(ctx.params, 'size', 72)));
  const colour = hexColour(ctx.params.color, '#111827');
  const background = hexColour(ctx.params.background, '#ffffff');
  const probe = createCanvas(10, 10).getContext('2d');
  probe.font = `${size}px ${family}`;
  const width = Math.min(4000, Math.ceil(probe.measureText(text).width) + size * 2);
  const height = Math.ceil(size * 2.2);
  const canvas = createCanvas(width, height);
  const g = canvas.getContext('2d');
  g.fillStyle = background;
  g.fillRect(0, 0, width, height);
  g.fillStyle = colour;
  g.font = `${size}px ${family}`;
  g.textBaseline = 'middle';
  g.fillText(text, size, height / 2);
  ctx.progress(85, 'Rendering sample');
  return [{ name: `${baseName(file.name)}-sample.png`, mime: 'image/png', buffer: canvas.toBuffer('image/png') }];
};

export const transparent: EngineFn = async (ctx) => {
  const { buffer, meta, name } = await readImage(ctx);
  const tolerance = Math.min(100, Math.max(0, paramInt(ctx.params, 'tolerance', 24)));
  const { data, info } = await sharp(buffer).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const idx = (x: number, y: number) => (y * width + x) * 4;
  // Sample the four corners; the most common colour is treated as background.
  const corners = [idx(0, 0), idx(width - 1, 0), idx(0, height - 1), idx(width - 1, height - 1)];
  const tally = new Map<string, { count: number; r: number; g: number; b: number }>();
  for (const c of corners) {
    const key = `${data[c]},${data[c + 1]},${data[c + 2]}`;
    const entry = tally.get(key) ?? { count: 0, r: data[c], g: data[c + 1], b: data[c + 2] };
    entry.count++;
    tally.set(key, entry);
  }
  const bg = [...tally.values()].sort((a, b) => b.count - a.count)[0];
  const limit = (tolerance / 100) * 441;
  const visit = new Uint8Array(width * height);
  const queue: number[] = [];
  for (let x = 0; x < width; x++) { queue.push(x, (height - 1) * width + x); }
  for (let y = 0; y < height; y++) { queue.push(y * width, y * width + width - 1); }
  while (queue.length) {
    const pixel = queue.pop()!;
    if (visit[pixel]) continue;
    visit[pixel] = 1;
    const i = pixel * 4;
    const distance = Math.sqrt(
      (data[i] - bg.r) ** 2 + (data[i + 1] - bg.g) ** 2 + (data[i + 2] - bg.b) ** 2,
    );
    if (distance > limit) continue;
    data[i + 3] = 0;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) queue.push(pixel - 1);
    if (x < width - 1) queue.push(pixel + 1);
    if (y > 0) queue.push(pixel - width);
    if (y < height - 1) queue.push(pixel + width);
  }
  ctx.progress(85, 'Clearing background');
  const out = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return [{ name: `${name}-transparent.png`, mime: 'image/png', buffer: out }];
};

export const metadata: EngineFn = async (ctx) => {
  const { buffer, name } = await readImage(ctx);
  const meta = await sharp(buffer).metadata();
  const report: Record<string, unknown> = {
    file: ctx.files[0].name,
    bytes: buffer.length,
    format: meta.format,
    width: meta.width,
    height: meta.height,
    megapixels: meta.width && meta.height ? Number(((meta.width * meta.height) / 1e6).toFixed(2)) : null,
    colourSpace: meta.space,
    channels: meta.channels,
    depth: meta.depth,
    densityDpi: meta.density,
    hasAlpha: meta.hasAlpha,
    orientation: meta.orientation,
    hasIccProfile: Boolean(meta.icc),
    animatedFrames: meta.pages ?? null,
    exifBytes: meta.exif?.length ?? 0,
  };
  try {
    const exifr = (await import('exifr')) as unknown as {
      parse: (b: Buffer) => Promise<Record<string, unknown> | undefined>;
      default?: { parse: (b: Buffer) => Promise<Record<string, unknown> | undefined> };
    };
    const parser = exifr.parse ?? exifr.default?.parse;
    const exif = parser ? await parser(buffer) : undefined;
    if (exif && Object.keys(exif).length) report.exif = exif;
  } catch {
    report.exif = 'not readable by this build';
  }
  return [{
    name: `${name}-metadata.json`,
    mime: 'application/json',
    buffer: Buffer.from(JSON.stringify(report, null, 2) + '\n', 'utf8'),
  }];
};

async function trace(buffer: Buffer, threshold: number): Promise<string> {
  const prepared = await sharp(buffer)
    .rotate()
    .flatten({ background: '#ffffff' })
    .grayscale()
    .threshold(threshold)
    .png()
    .toBuffer();
  const potrace = await loadPotrace();
  return new Promise<string>((resolve, reject) => {
    potrace.trace(prepared, {
      threshold: 128,
      turdSize: 2,
      optCurve: true,
      color: '#000000',
      background: '#ffffff',
    }, (err, svg) => (err ? reject(new UserError(`Could not trace that image: ${err.message}`)) : resolve(svg)));
  });
}

export const toSvg: EngineFn = async (ctx) => {
  const { buffer, name } = await readImage(ctx);
  const threshold = Math.min(255, Math.max(1, paramInt(ctx.params, 'threshold', 160)));
  ctx.progress(35, 'Tracing outlines');
  const svg = await trace(buffer, threshold);
  if (!svg.includes('<path')) throw new UserError('That image has no clear outlines to vectorise. Try a logo or line art.');
  ctx.progress(92, 'Writing SVG');
  return [{ name: `${name}.svg`, mime: 'image/svg+xml', buffer: Buffer.from(svg, 'utf8') }];
};

export const svgToPng: EngineFn = async (ctx) => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add an SVG file.');
  const raw = await fs.readFile(file.path);
  if (!/^\s*(<\?xml|<svg)/i.test(raw.subarray(0, 400).toString('utf8'))) {
    throw new UserError('That file does not look like SVG markup.');
  }
  const width = Math.min(6000, Math.max(16, paramInt(ctx.params, 'width', 1024)));
  const background = ctx.params.background === 'transparent' ? { r: 255, g: 255, b: 255, alpha: 0 } : undefined;
  ctx.progress(50, 'Rasterising');
  const out = await sharp(raw, { density: 300 })
    .resize({ width })
    .flatten(background ? { background } : { background: '#ffffff' })
    .png()
    .toBuffer();
  return [{ name: `${baseName(file.name)}.png`, mime: 'image/png', buffer: out }];
};

export const psd: EngineFn = async (ctx) => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add a .psd file.');
  const format = (ctx.fixed.format ?? ctx.params.format ?? 'png').toLowerCase();
  const buffer = await fs.readFile(file.path);
  let rgba: { data: Buffer; width: number; height: number } | null = null;
  try {
    const psdModule = (await import('ag-psd')) as unknown as {
      default?: Record<string, unknown>;
      readPsd?: (b: Buffer, o?: Record<string, unknown>) => {
        width: number; height: number;
        imageData?: { data: Uint8ClampedArray; width: number; height: number };
        canvas?: { toBuffer: (mime: string) => Buffer };
      };
      initializeCanvas?: (createCanvas: unknown, createCanvasFromData?: unknown) => void;
    };
    const agpsd = (psdModule.readPsd ? psdModule : (psdModule.default ?? psdModule)) as {
      readPsd: (b: Buffer, o?: Record<string, unknown>) => {
        width: number; height: number;
        imageData?: { data: Uint8ClampedArray; width: number; height: number };
        canvas?: { toBuffer: (mime: string) => Buffer };
      };
      initializeCanvas?: (createCanvas: unknown, createCanvasFromData?: unknown) => void;
    };
    const canvasMod = (await import('@napi-rs/canvas')) as unknown as {
      createCanvas?: unknown;
      loadImage?: unknown;
      default?: { createCanvas?: unknown; loadImage?: unknown };
    };
    const createCanvas = canvasMod.createCanvas ?? canvasMod.default?.createCanvas;
    const loadImage = canvasMod.loadImage ?? canvasMod.default?.loadImage;
    if (createCanvas) agpsd.initializeCanvas?.(createCanvas, loadImage);
    const parsed = agpsd.readPsd(buffer, { skipLayerImageData: true, skipThumbnail: true, useImageData: true });
    if (parsed.imageData) {
      rgba = { data: Buffer.from(parsed.imageData.data), width: parsed.imageData.width, height: parsed.imageData.height };
    } else if (parsed.canvas) {
      const png = parsed.canvas.toBuffer('image/png');
      const raw = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      rgba = { data: raw.data, width: raw.info.width, height: raw.info.height };
    }
  } catch (err) {
    throw new UserError(`That PSD could not be read (${(err as Error).message}).`);
  }
  if (!rgba) throw new UserError('This PSD has no flattened preview to export. Re-save it with "Maximise Compatibility".');
  ctx.progress(70, 'Encoding composite');
  const out = await encode(sharp(rgba.data, { raw: { width: rgba.width, height: rgba.height, channels: 4 } }), format, 92);
  return [{ name: `${baseName(file.name)}.${EXT[format] ?? format}`, mime: MIME[format] ?? 'image/png', buffer: out }];
};

/** Writes a real EPS Level 2 file with a Flate-compressed raster image. */
export const toEps: EngineFn = async (ctx) => {
  const { buffer, name } = await readImage(ctx);
  const { data, info } = await sharp(buffer).rotate().flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const deflated = zlib.deflateSync(data);
  const hex = deflated.toString('hex');
  const lines: string[] = [];
  for (let i = 0; i < hex.length; i += 72) lines.push(hex.slice(i, i + 72));
  const header = [
    '%!PS-Adobe-3.0 EPSF-3.0',
    `%%BoundingBox: 0 0 ${width} ${height}`,
    `%%HiResBoundingBox: 0 0 ${width} ${height}`,
    '%%Creator: TinyClone',
    '%%EndComments',
    'gsave',
    `${width} ${height} scale`,
    '<< /ImageType 1',
    `   /Width ${width}`,
    `   /Height ${height}`,
    '   /BitsPerComponent 8',
    '   /Decode [0 1 0 1 0 1]',
    `   /ImageMatrix [${width} 0 0 ${-height} 0 ${height}]`,
    '   /DataSource currentfile /ASCIIHexDecode filter /FlateDecode filter',
    '>> image',
  ];
  const eps = `${header.join('\n')}\n${lines.join('\n')}\n>\ngrestore\nshowpage\n%%EOF\n`;
  ctx.progress(88, 'Writing EPS');
  return [{ name: `${name}.eps`, mime: 'application/postscript', buffer: Buffer.from(eps, 'latin1') }];
};
