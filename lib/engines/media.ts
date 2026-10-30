// Video + audio engines backed by a bundled static ffmpeg.
// Every tool here runs a real encode; nothing is faked.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { EngineCtx, EngineFile, EngineFn, EngineOutput, UserError, baseName, paramInt } from './types';

/**
 * The bundled binaries live in node_modules; resolving them by path keeps
 * webpack from trying to bundle the executable packages.
 */
export const FFMPEG =
  process.env.FFMPEG_PATH ??
  path.join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

let cachedFfprobe: string | null = null;
async function ffprobeBinary(): Promise<string> {
  if (process.env.FFPROBE_PATH) return process.env.FFPROBE_PATH;
  if (cachedFfprobe) return cachedFfprobe;
  const fallbackDir = path.join(process.cwd(), 'node_modules', 'ffprobe-static', 'bin');
  const platformDir = process.platform === 'win32' ? 'win32' : process.platform === 'darwin' ? 'darwin' : 'linux';
  for (const arch of [process.arch, 'x64', 'arm64']) {
    const candidate = path.join(fallbackDir, platformDir, arch, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
    try {
      await fs.access(candidate);
      cachedFfprobe = candidate;
      return candidate;
    } catch { /* try the next arch */ }
  }
  cachedFfprobe = 'ffprobe';
  return cachedFfprobe;
}

interface RunOptions {
  cwd?: string;
  durationMs?: number;
  onProgress?: (pct: number, message?: string) => void;
}

function run(args: string[], options: RunOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const withProgress = Boolean(options.onProgress);
    const full = [
      '-hide_banner',
      '-nostdin',
      '-loglevel', 'error',
      '-y',
      ...(withProgress ? ['-progress', 'pipe:1', '-nostats'] : []),
      ...args,
    ];
    const child = spawn(FFMPEG, full, { cwd: options.cwd, windowsHide: true });
    let stderr = '';
    let stdout = '';
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 8000) stderr = stderr.slice(-8000);
    });
    child.stdout.on('data', (chunk: Buffer) => {
      if (!options.onProgress) return;
      stdout += chunk.toString();
      const lines = stdout.split('\n');
      stdout = lines.pop() ?? '';
      for (const line of lines) {
        const match = /^out_time_us=(\d+)/.exec(line.trim());
        if (!match || !options.durationMs) continue;
        const pct = Math.min(98, Math.round((Number(match[1]) / 1000 / options.durationMs) * 96) + 2);
        options.onProgress(pct, 'Encoding');
      }
    });
    child.on('error', (err) => reject(new UserError(`The media engine could not start (${err.message}).`)));
    child.on('close', (code) => {
      if (code === 0) return resolve();
      const tail = stderr.trim().split(/\r?\n/).filter(Boolean).slice(-2).join(' ');
      reject(new UserError(`Media processing failed${tail ? `: ${tail}` : '.'}`));
    });
  });
}

/** Runs ffmpeg with the bundled binary; shared with the PDF/TIFF engine. */
export function runFfmpeg(args: string[], options: RunOptions = {}): Promise<void> {
  return run(args, options);
}

interface ProbeInfo {
  durationMs: number;
  hasVideo: boolean;
  hasAudio: boolean;
  width: number;
  height: number;
  container: string;
}

export async function probe(file: string): Promise<ProbeInfo> {
  const binary = await ffprobeBinary();
  return new Promise((resolve, reject) => {
    const child = spawn(binary, [
      '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file,
    ], { windowsHide: true });
    let out = '';
    child.stdout.on('data', (chunk: Buffer) => { out += chunk.toString(); });
    child.on('error', (err) => reject(new UserError(`ffprobe could not start (${err.message}).`)));
    child.on('close', () => {
      try {
        const parsed = JSON.parse(out) as {
          format?: { duration?: string; format_name?: string };
          streams?: { codec_type?: string; width?: number; height?: number }[];
        };
        const streams = parsed.streams ?? [];
        const video = streams.find((s) => s.codec_type === 'video');
        resolve({
          durationMs: Math.round(Number(parsed.format?.duration ?? 0) * 1000),
          hasVideo: Boolean(video),
          hasAudio: streams.some((s) => s.codec_type === 'audio'),
          width: video?.width ?? 0,
          height: video?.height ?? 0,
          container: (parsed.format?.format_name ?? '').split(',')[0],
        });
      } catch {
        reject(new UserError('That file is not media ffmpeg can read.'));
      }
    });
  });
}

const MIME: Record<string, string> = {
  mp4: 'video/mp4', mov: 'video/quicktime', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
  webm: 'video/webm', gif: 'image/gif', webp: 'image/webp', apng: 'image/apng',
  mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg',
  m4a: 'audio/mp4', m4r: 'audio/mp4', aac: 'audio/aac', heic: 'image/heic',
};
const EXT: Record<string, string> = { webp: 'webp', apng: 'png' };
const AUDIO_TARGETS = new Set(['mp3', 'wav', 'flac', 'ogg', 'm4a', 'm4r', 'aac']);
const VIDEO_TARGETS = new Set(['mp4', 'mov', 'mkv', 'avi', 'webm', 'gif', 'webp', 'apng']);

const AUDIO_CODEC: Record<string, string[]> = {
  mp3: ['-c:a', 'libmp3lame', '-b:a', '192k', '-id3v2_version', '3'],
  wav: ['-c:a', 'pcm_s16le'],
  flac: ['-c:a', 'flac'],
  ogg: ['-c:a', 'libvorbis', '-b:a', '192k'],
  m4a: ['-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart'],
  m4r: ['-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart'],
  aac: ['-c:a', 'aac', '-b:a', '192k', '-f', 'adts'],
};

function videoCodec(target: string, crf: number, scale?: string) {
  const filters = scale ? ['-vf', scale] : [];
  switch (target) {
    case 'mp4':
    case 'mov':
      return [...filters, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart'];
    case 'mkv':
      return [...filters, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k'];
    case 'avi':
      return [...filters, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'libmp3lame', '-b:a', '192k'];
    case 'webm':
      return [...filters, '-c:v', 'libvpx-vp9', '-crf', String(Math.min(60, crf + 6)), '-b:v', '0',
        '-row-mt', '1', '-c:a', 'libopus', '-b:a', '128k'];
    default:
      return filters;
  }
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

function scaleFilter(width: number, height: number, fit: 'decrease' | 'increase' | 'fill' = 'decrease') {
  return `scale=${even(width)}:${even(height)}:force_original_aspect_ratio=${fit},pad=${even(width)}:${even(height)}:(ow-iw)/2:(oh-ih)/2:color=black`;
}

/** Copy the upload into a scratch dir so ffmpeg gets a simple, stable filename. */
async function scratch(ctx: EngineCtx, index = 0, dir?: string) {
  const work = dir ?? await fs.mkdtemp(path.join(os.tmpdir(), 'tinyclone-media-'));
  const file = ctx.files[index];
  if (!file) throw new UserError('Add a media file first.');
  const ext = path.extname(file.name).toLowerCase() || '.bin';
  const input = path.join(work, `input${ext}`);
  await fs.copyFile(file.path, input);
  return { work, input, name: baseName(file.name), file };
}

async function finish(work: string, output: string, name: string, mime: string): Promise<EngineOutput[]> {
  try {
    const buffer = await fs.readFile(output);
    if (!buffer.length) throw new UserError('The media engine produced an empty file.');
    return [{ name, mime, buffer }];
  } finally {
    await fs.rm(work, { recursive: true, force: true }).catch(() => {});
  }
}

function targetFormat(ctx: EngineCtx, fallback: string) {
  const raw = (ctx.fixed.format ?? ctx.params.format ?? fallback).toLowerCase();
  const normalised = raw === 'jpg' || raw === 'jpeg' ? 'mp4' : raw;
  if (AUDIO_TARGETS.has(normalised) || VIDEO_TARGETS.has(normalised)) return normalised;
  throw new UserError(`Output format "${raw}" is not supported by the media engine.`);
}

async function transcode(
  ctx: EngineCtx,
  target: string,
  opts: { crf?: number; scale?: string; start?: number; durationMs?: number; extra?: string[] } = {},
): Promise<EngineOutput[]> {
  const { work, input, name } = await scratch(ctx);
  const info = await probe(input);
  if (!info.durationMs && !info.hasAudio && !info.hasVideo) {
    throw new UserError('That file has no audio or video stream to convert.');
  }
  const ext = EXT[target] ?? target;
  const output = path.join(work, `output.${ext}`);
  const args: string[] = [];
  if (opts.start && opts.start > 0) args.push('-ss', String(opts.start));
  args.push('-i', input);
  if (opts.durationMs && opts.durationMs > 0) args.push('-t', (opts.durationMs / 1000).toFixed(3));

  if (AUDIO_TARGETS.has(target)) {
    args.push('-vn', ...(AUDIO_CODEC[target] ?? []));
  } else if (target === 'gif') {
    const fps = Math.min(30, Math.max(1, paramInt(ctx.params, 'fps', 10)));
    const width = Math.min(1600, Math.max(64, paramInt(ctx.params, 'width', 480)));
    args.push('-an', '-filter_complex',
      `[0:v] fps=${fps},scale=${width}:-1:flags=lanczos,split [a][b];[a] palettegen [p];[b][p] paletteuse`,
      '-loop', '0');
  } else if (target === 'webp' || target === 'apng') {
    const fps = Math.min(30, Math.max(1, paramInt(ctx.params, 'fps', 12)));
    const width = Math.min(1600, Math.max(64, paramInt(ctx.params, 'width', 640)));
    const codec = target === 'webp'
      ? ['-c:v', 'libwebp', '-lossless', '0', '-q:v', '70', '-loop', '0']
      : ['-c:v', 'apng', '-plays', '0'];
    args.push('-an', '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos`, ...codec);
  } else if (info.hasVideo) {
    args.push(...videoCodec(target, opts.crf ?? 24, opts.scale));
  } else {
    // Audio-only upload being placed in a video container: keep the audio, no video track.
    args.push('-vn', '-c:a', 'aac', '-b:a', '192k', ...(target === 'mp4' || target === 'mov' ? ['-movflags', '+faststart'] : []));
  }
  if (opts.extra?.length) args.push(...opts.extra);
  if (target === 'm4r') args.push('-f', 'ipod');
  args.push(output);

  ctx.progress(8, 'Preparing media');
  await run(args, {
    cwd: work,
    durationMs: opts.durationMs ?? info.durationMs,
    onProgress: ctx.progress,
  });
  ctx.progress(96, 'Packaging');
  return finish(work, output, `${name}.${ext}`, MIME[target] ?? 'application/octet-stream');
}

function inputExt(ctx: EngineCtx) {
  const ext = path.extname(ctx.files[0]?.name ?? '').toLowerCase().replace('.', '');
  return ext === 'jpeg' ? 'jpg' : ext;
}

// ---- engines ------------------------------------------------------------

export const convert: EngineFn = async (ctx) => {
  const target = targetFormat(ctx, inputExt(ctx) || 'mp4');
  return transcode(ctx, target);
};

export const compress: EngineFn = async (ctx) => {
  const quality = (ctx.params.quality ?? 'balanced').toLowerCase();
  const crf = quality === 'high' ? 20 : quality === 'small' ? 32 : 26;
  const resize = ctx.params.resolution ?? 'keep';
  const target = targetFormat(ctx, inputExt(ctx) || 'mp4');
  const info = await probe(ctx.files[0].path);
  const width = resize === '1080' ? 1920 : resize === '720' ? 1280 : resize === '480' ? 854 : 0;
  const scale = width && info.hasVideo
    ? `scale=${even(width)}:${even(Math.round(width * (info.height / Math.max(1, info.width))))}:force_original_aspect_ratio=decrease:force_divisible_by=2`
    : undefined;
  ctx.progress(6, `Re-encoding at CRF ${crf}`);
  return transcode(ctx, target, { crf, scale });
};

export const trim: EngineFn = async (ctx) => {
  const start = seconds(ctx.params.start ?? '0');
  const end = seconds(ctx.params.end ?? '');
  const info = await probe(ctx.files[0].path);
  const total = info.durationMs / 1000;
  if (start >= total) throw new UserError(`The clip is only ${total.toFixed(1)}s long, so ${start}s is past the end.`);
  const stop = end && end > start ? end : total;
  const span = Math.min(stop, total) - start;
  if (span <= 0.1) throw new UserError('Pick an end time after the start time.');
  const target = targetFormat(ctx, inputExt(ctx) || 'mp4');
  return transcode(ctx, target, { start, durationMs: Math.round(span * 1000) });
};

export const mute: EngineFn = async (ctx) => {
  const { work, input, name } = await scratch(ctx);
  const ext = inputExt(ctx) || 'mp4';
  const output = path.join(work, `output.${ext}`);
  ctx.progress(20, 'Dropping the audio track');
  await run(['-i', input, '-c:v', 'copy', '-an', output], { cwd: work });
  return finish(work, output, `${name}-muted.${ext}`, MIME[ext] ?? 'video/mp4');
};

export const resize: EngineFn = async (ctx) => {
  const info = await probe(ctx.files[0].path);
  const requestedW = paramInt(ctx.params, 'width', 0);
  const requestedH = paramInt(ctx.params, 'height', 0);
  if (!requestedW && !requestedH) throw new UserError('Set a width or a height.');
  const ratio = info.width && info.height ? info.width / info.height : 16 / 9;
  const width = requestedW || Math.round((requestedH || 720) * ratio);
  const height = requestedH || Math.round((requestedW || 1280) / ratio);
  const target = targetFormat(ctx, inputExt(ctx) || 'mp4');
  return transcode(ctx, target, { crf: 22, scale: scaleFilter(width, height) });
};

export const toGif: EngineFn = async (ctx) => {
  ctx.progress(5, 'Building the palette');
  return transcode(ctx, 'gif');
};

export const toWebp: EngineFn = async (ctx) => {
  ctx.progress(5, 'Encoding animated WebP');
  return transcode(ctx, 'webp');
};

export const audio: EngineFn = async (ctx) => {
  const target = targetFormat(ctx, 'mp3');
  ctx.progress(5, 'Extracting audio');
  return transcode(ctx, target);
};

export const subtitles: EngineFn = async (ctx) => {
  if (ctx.files.length < 2) throw new UserError('Add the video and its .srt subtitle file.');
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'tinyclone-subs-'));
  try {
    const video = ctx.files[0];
    const subs = ctx.files[1];
    if (!/\.(srt|vtt|ass)$/i.test(subs.name)) throw new UserError('The second file must be .srt, .vtt or .ass.');
    const ext = path.extname(video.name).toLowerCase() || '.mp4';
    const input = path.join(work, `input${ext}`);
    const subPath = `subs${path.extname(subs.name).toLowerCase()}`;
    await fs.copyFile(video.path, input);
    await fs.copyFile(subs.path, path.join(work, subPath));
    const info = await probe(input);
    const output = path.join(work, 'output.mp4');
    const size = Math.min(48, Math.max(10, paramInt(ctx.params, 'fontSize', 22)));
    ctx.progress(10, 'Burning in subtitles');
    await run([
      '-i', 'input' + ext,
      '-vf', `subtitles=${subPath}:force_style='FontSize=${size},Outline=1.4,Shadow=0,MarginV=28'`,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', 'output.mp4',
    ], { cwd: work, durationMs: info.durationMs, onProgress: ctx.progress });
    return finish(work, output, `${baseName(video.name)}-subtitled.mp4`, 'video/mp4');
  } catch (err) {
    await fs.rm(work, { recursive: true, force: true }).catch(() => {});
    throw err;
  }
};

export const stillFrame: EngineFn = async (ctx) => {
  const { work, input, name } = await scratch(ctx);
  const output = path.join(work, 'output.jpg');
  const at = seconds(ctx.params.at ?? '1');
  ctx.progress(30, 'Grabbing a frame');
  await run(['-ss', String(at), '-i', input, '-frames:v', '1', '-q:v', '2', output], { cwd: work });
  return finish(work, output, `${name}-frame.jpg`, 'image/jpeg');
};

function seconds(raw: string): number {
  if (!raw) return 0;
  const parts = raw.trim().split(':').map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p))) throw new UserError(`"${raw}" is not a time. Use seconds or mm:ss.`);
  return parts.reduce((acc, part) => acc * 60 + part, 0);
}

/** Returns the ffmpeg path so health checks and tests can report it. */
export async function mediaStack() {
  try {
    await fs.access(FFMPEG);
    return { ffmpeg: FFMPEG, ffprobe: await ffprobeBinary() };
  } catch {
    return { ffmpeg: null, ffprobe: null };
  }
}

export type { EngineFile };
