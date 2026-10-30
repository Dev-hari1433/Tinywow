import sharp from 'sharp';
import { EngineCtx, EngineOutput, UserError, baseName, paramInt } from './types';
import fs from 'node:fs/promises';

const MIME: Record<string, string> = {
  jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  avif: 'image/avif', tiff: 'image/tiff', gif: 'image/gif',
};
const EXT: Record<string, string> = {
  jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp', avif: 'avif', tiff: 'tiff', gif: 'gif',
};

function wantFormat(raw: string | undefined, fallback: string): string {
  const f = (raw ?? 'keep').toLowerCase();
  if (!f || f === 'keep') return fallback;
  if (!MIME[f]) throw new UserError(`Output format "${f}" is not supported.`);
  return f === 'jpg' ? 'jpeg' : f;
}

async function encode(pipeline: sharp.Sharp, format: string, quality = 90): Promise<Buffer> {
  switch (format) {
    case 'jpeg': return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case 'png': return pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
    case 'webp': return pipeline.webp({ quality }).toBuffer();
    case 'avif': return pipeline.avif({ quality: Math.min(quality, 80) }).toBuffer();
    case 'tiff': return pipeline.tiff({ quality }).toBuffer();
    case 'gif': return pipeline.gif().toBuffer();
    default: throw new UserError(`Cannot encode as ${format}.`);
  }
}

async function loadImage(ctx: EngineCtx, i = 0) {
  const file = ctx.files[i];
  if (!file) throw new UserError('Add an image first.');
  const buf = await fs.readFile(file.path);
  const meta = await sharp(buf).metadata();
  return { buf, meta, name: baseName(file.name) };
}

const FORMAT_OF: Record<string, string> = {
  'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp',
  'image/avif': 'avif', 'image/tiff': 'tiff', 'image/gif': 'gif',
};

async function sourceFormat(ctx: EngineCtx, i = 0) {
  const file = ctx.files[i];
  const buf = await fs.readFile(file.path);
  const meta = await sharp(buf).metadata();
  return (meta.format ?? FORMAT_OF[file.mime] ?? 'png') as string;
}

export const convert = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const format = wantFormat(ctx.fixed.format ?? ctx.params.format, await sourceFormat(ctx));
  const quality = Math.min(100, Math.max(1, paramInt(ctx.params, 'quality', 90)));
  const { buf, name } = await loadImage(ctx);
  ctx.progress(50, `Encoding ${format.toUpperCase()}`);
  const out = await encode(sharp(buf).rotate(), format, quality);
  return [{ name: `${name}.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const compress = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const format = wantFormat(ctx.params.format, await sourceFormat(ctx));
  const quality = Math.min(100, Math.max(1, paramInt(ctx.params, 'quality', 72)));
  const { buf, name } = await loadImage(ctx);
  ctx.progress(60, 'Re-encoding');
  const out = await encode(sharp(buf).rotate(), format, quality);
  return [{ name: `${name}-compressed.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const resize = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const width = paramInt(ctx.params, 'width', 0) || undefined;
  const height = paramInt(ctx.params, 'height', 0) || undefined;
  if (!width && !height) throw new UserError('Set a width or a height.');
  const fit = (ctx.params.fit ?? 'inside') as keyof sharp.FitEnum;
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  ctx.progress(55, 'Resampling');
  const out = await encode(
    sharp(buf).rotate().resize({ width, height, fit, withoutEnlargement: false }),
    format,
    Math.min(100, Math.max(1, paramInt(ctx.params, 'quality', 90))),
  );
  return [{ name: `${name}-${width ?? 'auto'}x${height ?? 'auto'}.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const crop = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const left = Math.max(0, paramInt(ctx.params, 'left', 0));
  const top = Math.max(0, paramInt(ctx.params, 'top', 0));
  const maxW = (meta.width ?? 0) - left;
  const maxH = (meta.height ?? 0) - top;
  const width = Math.min(paramInt(ctx.params, 'width', maxW), maxW);
  const height = Math.min(paramInt(ctx.params, 'height', maxH), maxH);
  if (width <= 0 || height <= 0) throw new UserError('That crop box is outside the image.');
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  ctx.progress(55, 'Cropping');
  const out = await encode(sharp(buf).extract({ left, top, width, height }), format, 92);
  return [{ name: `${name}-cropped.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const grayscale = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  const out = await encode(sharp(buf).grayscale(), format, 92);
  return [{ name: `${name}-grayscale.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const flip = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const axis = ctx.params.axis ?? 'horizontal';
  let pipeline = sharp(buf);
  if (axis === 'horizontal' || axis === 'both') pipeline = pipeline.flop();
  if (axis === 'vertical' || axis === 'both') pipeline = pipeline.flip();
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  const out = await encode(pipeline, format, 92);
  return [{ name: `${name}-flipped.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const pixelate = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const block = Math.max(2, paramInt(ctx.params, 'size', 12));
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  const out = await encode(
    sharp(buf)
      .resize(Math.max(1, Math.round(w / block)), Math.max(1, Math.round(h / block)), { kernel: 'nearest' })
      .resize(w, h, { kernel: 'nearest' }),
    format,
    92,
  );
  return [{ name: `${name}-pixelated.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const border = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const width = Math.min(400, Math.max(1, paramInt(ctx.params, 'width', 16)));
  const color = /^#[0-9a-f]{3,8}$/i.test(ctx.params.color ?? '') ? ctx.params.color : '#111827';
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  const out = await encode(
    sharp(buf).extend({ top: width, bottom: width, left: width, right: width, background: color }),
    format,
    92,
  );
  return [{ name: `${name}-bordered.${EXT[format]}`, mime: MIME[format], buffer: out }];
};

export const profile = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name } = await loadImage(ctx);
  const size = Math.min(2048, Math.max(64, paramInt(ctx.params, 'size', 512)));
  const out = await sharp(buf).rotate().resize(size, size, { fit: 'cover', position: 'attention' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  return [{ name: `${name}-profile.jpg`, mime: 'image/jpeg', buffer: out }];
};

export const circle = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name } = await loadImage(ctx);
  const size = Math.min(2048, Math.max(32, paramInt(ctx.params, 'size', 512)));
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );
  const out = await sharp(buf)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  return [{ name: `${name}-circle.png`, mime: 'image/png', buffer: out }];
};

export const combine = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  if (ctx.files.length < 2) throw new UserError('Add at least two images to stack.');
  const buffers: Buffer[] = [];
  const metas: sharp.Metadata[] = [];
  for (let i = 0; i < ctx.files.length; i++) {
    const buf = await fs.readFile(ctx.files[i].path);
    buffers.push(buf);
    metas.push(await sharp(buf).metadata());
    ctx.progress(Math.round(((i + 1) / ctx.files.length) * 40), `Reading ${i + 1}`);
  }
  const width = Math.max(...metas.map((m) => m.width ?? 0));
  const prepared: Buffer[] = [];
  const heights: number[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const scaled = sharp(buffers[i]).resize({ width, fit: 'inside', withoutEnlargement: false });
    const b = await scaled.png().toBuffer();
    const m = await sharp(b).metadata();
    prepared.push(b);
    heights.push(m.height ?? 0);
    ctx.progress(40 + Math.round(((i + 1) / buffers.length) * 40), `Scaling ${i + 1}`);
  }
  const totalHeight = heights.reduce((a, b) => a + b, 0);
  let y = 0;
  const composites = prepared.map((input, i) => {
    const top = y;
    y += heights[i];
    return { input, top, left: 0 };
  });
  const out = await sharp({
    create: { width, height: totalHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  }).composite(composites).png().toBuffer();
  return [{ name: 'combined.png', mime: 'image/png', buffer: out }];
};

export const splitImage = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { buf, name, meta } = await loadImage(ctx);
  const columns = Math.min(10, Math.max(1, paramInt(ctx.params, 'columns', 2)));
  const rows = Math.min(10, Math.max(1, paramInt(ctx.params, 'rows', 2)));
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const tileW = Math.floor(width / columns);
  const tileH = Math.floor(height / rows);
  if (tileW < 1 || tileH < 1) throw new UserError('Image is too small for that grid.');
  const outputs: EngineOutput[] = [];
  const format = wantFormat(ctx.params.format, meta.format ?? 'png');
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const out = await encode(
        sharp(buf).extract({ left: c * tileW, top: r * tileH, width: tileW, height: tileH }),
        format,
        92,
      );
      outputs.push({
        name: `${name}-r${r + 1}c${c + 1}.${EXT[format]}`,
        mime: MIME[format],
        buffer: out,
      });
      ctx.progress(Math.round((outputs.length / (rows * columns)) * 95), `Tile ${outputs.length}`);
    }
  }
  return outputs;
};
