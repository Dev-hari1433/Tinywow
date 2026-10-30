import fs from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import { EngineCtx, EngineOutput, UserError, baseName, paramInt } from './types';

export const qr = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const text = (ctx.params.text ?? '').trim();
  if (!text) throw new UserError('Enter the text or URL to encode.');
  const size = Math.min(2048, Math.max(64, paramInt(ctx.params, 'size', 512)));
  const buffer = await QRCode.toBuffer(text, {
    type: 'png',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1020ff', light: '#ffffffff' },
  });
  return [{ name: 'qr-code.png', mime: 'image/png', buffer }];
};

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et ' +
  'dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea ' +
  'commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur ' +
  'excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

export const lorem = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const paragraphs = Math.min(50, Math.max(1, paramInt(ctx.params, 'paragraphs', 3)));
  const out: string[] = [];
  let seed = 7;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let p = 0; p < paragraphs; p++) {
    const sentences = 3 + Math.floor(next() * 3);
    const parts: string[] = [];
    for (let s = 0; s < sentences; s++) {
      const length = 8 + Math.floor(next() * 10);
      const words: string[] = [];
      for (let w = 0; w < length; w++) words.push(WORDS[Math.floor(next() * WORDS.length)]);
      const sentence = words.join(' ');
      parts.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
    }
    out.push(parts.join(' '));
  }
  return [{
    name: 'lorem-ipsum.txt',
    mime: 'text/plain; charset=utf-8',
    buffer: Buffer.from(`${out.join('\n\n')}\n`, 'utf8'),
  }];
};

export const meme = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add a background image.');
  const top = (ctx.params.top ?? '').trim();
  const bottom = (ctx.params.bottom ?? '').trim();
  if (!top && !bottom) throw new UserError('Type the top text, the bottom text, or both.');
  const { createCanvas, loadImage } = await import('@napi-rs/canvas');
  const image = await loadImage(await fs.readFile(file.path));
  const width = image.width;
  const height = image.height;
  const canvas = createCanvas(width, height);
  const g = canvas.getContext('2d');
  g.drawImage(image, 0, 0, width, height);
  const size = Math.min(220, Math.max(14, paramInt(ctx.params, 'size', Math.round(width / 9))));
  g.font = `bold ${size}px "Arial Black", Impact, Arial, sans-serif`;
  g.textAlign = 'center';
  g.lineJoin = 'round';
  g.fillStyle = '#ffffff';
  g.strokeStyle = '#000000';
  g.lineWidth = Math.max(2, size / 9);

  const draw = (text: string, fromTop: boolean) => {
    if (!text) return;
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (g.measureText(candidate).width > width * 0.92 && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    lines.forEach((line, i) => {
      const y = fromTop ? size * 1.1 + i * size * 1.05 : height - size * 0.5 - (lines.length - 1 - i) * size * 1.05;
      g.strokeText(line, width / 2, y, width * 0.94);
      g.fillText(line, width / 2, y, width * 0.94);
    });
  };

  draw(top, true);
  draw(bottom, false);
  ctx.progress(85, 'Rendering meme');
  return [{
    name: `${baseName(file.name)}-meme.png`,
    mime: 'image/png',
    buffer: canvas.toBuffer('image/png'),
  }];
};

export const zip = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  if (!ctx.files.length) throw new UserError('Add the files to zip.');
  const jszipModule = (await import('jszip')) as unknown as { default?: typeof import('jszip') };
  const JSZip = jszipModule.default ?? (jszipModule as unknown as typeof import('jszip'));
  const archive = new JSZip();
  const used = new Map<string, number>();
  for (let i = 0; i < ctx.files.length; i++) {
    const file = ctx.files[i];
    const safe = path.basename(file.name).replace(/[\\/:*?"<>|]+/g, '_') || `file-${i + 1}`;
    const seen = used.get(safe) ?? 0;
    used.set(safe, seen + 1);
    const entry = seen ? safe.replace(/(\.[^.]+)?$/, `-${seen + 1}$1`) : safe;
    archive.file(entry, await fs.readFile(file.path));
    ctx.progress(10 + Math.round(((i + 1) / ctx.files.length) * 80), `Added ${entry}`);
  }
  const buffer = await archive.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  const raw = (ctx.params.name ?? 'archive').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\.zip$/i, '') || 'archive';
  return [{ name: `${raw}.zip`, mime: 'application/zip', buffer }];
};

export const timestamp = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const raw = (ctx.params.value ?? '').trim();
  if (!raw) throw new UserError('Enter a Unix timestamp or a date.');
  let ms: number;
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    ms = Math.abs(n) > 1e11 ? n : n * 1000;
  } else {
    const parsed = Date.parse(raw);
    if (Number.isNaN(parsed)) throw new UserError(`"${raw}" is not a date I can read.`);
    ms = parsed;
  }
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new UserError('That value is out of range.');
  const lines = [
    `Input:        ${raw}`,
    `Unix (s):     ${Math.floor(ms / 1000)}`,
    `Unix (ms):    ${ms}`,
    `ISO 8601:     ${date.toISOString()}`,
    `UTC:          ${date.toUTCString()}`,
    `Local:        ${date.toString()}`,
  ];
  return [{
    name: 'timestamp.txt',
    mime: 'text/plain; charset=utf-8',
    buffer: Buffer.from(lines.join('\n') + '\n', 'utf8'),
  }];
};
