import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { generateText, transcribeAudio } from '../ai/router';
import { FFMPEG } from './media';
import { DATA_DIR } from '../data-dir';
import { EngineCtx, EngineOutput, UserError, baseName } from './types';

const run = promisify(execFile);

const PYTHON = process.env.PYTHON_PATH ?? (process.platform === 'win32' ? 'python' : 'python3');
const SEGMENT_SECONDS = 900; // 15 min per transcription request keeps us under Groq's 25 MB limit

async function ffmpeg(args: string[]) {
  try {
    await run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
      maxBuffer: 64 * 1024 * 1024,
      timeout: 900_000,
    });
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? (err as Error).message;
    throw new UserError(`ffmpeg failed: ${stderr.slice(0, 300)}`);
  }
}

let ytDlpChecked: boolean | null = null;

async function ytDlpAvailable(): Promise<boolean> {
  if (ytDlpChecked !== null) return ytDlpChecked;
  try {
    await run(PYTHON, ['-c', 'import yt_dlp'], { timeout: 20_000 });
    ytDlpChecked = true;
  } catch {
    ytDlpChecked = false;
  }
  return ytDlpChecked;
}

/** yt-dlp needs ffmpeg and ffprobe next to each other; the static packages keep them apart. */
let cachedToolDir: string | null = null;

async function findFfprobe(): Promise<string | null> {
  if (process.env.FFPROBE_PATH) return process.env.FFPROBE_PATH;
  const name = process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
  const platform = process.platform === 'win32' ? 'win32' : process.platform === 'darwin' ? 'darwin' : 'linux';
  const base = path.join(process.cwd(), 'node_modules', 'ffprobe-static', 'bin');
  for (const dir of [path.join(base, platform, process.arch), path.join(base, platform, 'x64')]) {
    try {
      await fs.access(path.join(dir, name));
      return path.join(dir, name);
    } catch {
      /* try the next layout */
    }
  }
  return null;
}

async function toolDir(): Promise<string> {
  if (cachedToolDir) return cachedToolDir;
  const dir = path.join(DATA_DIR, 'bin');
  await fs.mkdir(dir, { recursive: true });
  const place = async (src: string) => {
    const dest = path.join(dir, path.basename(src));
    try {
      await fs.access(dest);
      return;
    } catch {
      /* not placed yet */
    }
    try {
      await fs.link(src, dest);
    } catch {
      await fs.copyFile(src, dest);
    }
  };
  await place(FFMPEG);
  const probe = await findFfprobe();
  if (probe) await place(probe);
  cachedToolDir = dir;
  return dir;
}

async function ytDlp(args: string[], cwd: string) {
  if (!(await ytDlpAvailable())) {
    throw new UserError(
      'The downloader (yt-dlp) is not installed. Run: python -m pip install yt-dlp — then retry.',
    );
  }
  try {
    return await run(PYTHON, ['-m', 'yt_dlp', '--no-playlist', '--no-warnings', '--ffmpeg-location', await toolDir(), ...args], {
      cwd,
      maxBuffer: 64 * 1024 * 1024,
      timeout: 1_200_000,
    });
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? (err as Error).message;
    throw new UserError(`The download failed: ${stderr.split('\n').filter(Boolean).slice(-3).join(' ').slice(0, 300)}`);
  }
}

/** Rejects anything that is not a public http(s) URL, so the server cannot be pointed inward. */
function safeUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new UserError('Paste a full link, including https://.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UserError('Only http and https links work.');
  const host = url.hostname.toLowerCase();
  const blocked = host === 'localhost' || host === '::1' || host.endsWith('.local') ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host === '0.0.0.0';
  if (blocked) throw new UserError('That address is not reachable from the public internet.');
  return url;
}

function srtTime(seconds: number): string {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const rest = ms % 1000;
  const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(rest, 3)}`;
}

function toSrt(segments: { start: number; end: number; text: string }[]): string {
  return segments
    .map((s, i) => `${i + 1}\n${srtTime(s.start)} --> ${srtTime(s.end)}\n${s.text.trim()}\n`)
    .join('\n');
}

/** Extracts mono speech-friendly audio, splitting it so each request stays small. */
async function speechParts(input: string, dir: string): Promise<string[]> {
  const pattern = path.join(dir, 'part-%03d.mp3');
  await ffmpeg([
    '-i', input,
    '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'libmp3lame', '-b:a', '48k',
    '-f', 'segment', '-segment_time', String(SEGMENT_SECONDS), pattern,
  ]);
  const files = (await fs.readdir(dir)).filter((f) => /^part-\d+\.mp3$/.test(f)).sort();
  if (!files.length) throw new UserError('No audio track was found in that file.');
  return files.map((f) => path.join(dir, f));
}

async function transcribeFile(file: string): Promise<{ text: string; segments: { start: number; end: number; text: string }[]; model: string }> {
  const dir = path.join(os.tmpdir(), `tc-speech-${crypto.randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  try {
    const parts = await speechParts(file, dir);
    let text = '';
    const segments: { start: number; end: number; text: string }[] = [];
    let model = '';
    for (let i = 0; i < parts.length; i++) {
      const buffer = await fs.readFile(parts[i]);
      if (buffer.length > 24 * 1024 * 1024) throw new UserError('That audio chunk is too large to transcribe.');
      const res = await transcribeAudio(buffer, `part-${i + 1}.mp3`, 'audio/mpeg');
      model = res.model;
      text += `${res.text}\n`;
      const offset = i * SEGMENT_SECONDS;
      for (const seg of res.segments ?? []) segments.push({ start: seg.start + offset, end: seg.end + offset, text: seg.text });
    }
    return { text: text.trim(), segments, model };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** audio-to-text, to-text, transcribe-podcast */
export const transcribe = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add an audio or video file.');
  ctx.progress(10, 'Extracting audio');
  const res = await transcribeFile(file.path);
  if (!res.text) throw new UserError('The transcription came back empty — is there speech in that file?');
  ctx.progress(90, 'Writing transcript');
  const base = baseName(file.name);
  const outputs: EngineOutput[] = [
    { name: `${base}-transcript.txt`, mime: 'text/plain; charset=utf-8', buffer: Buffer.from(res.text + '\n', 'utf8') },
  ];
  if (res.segments.length) {
    outputs.push({ name: `${base}.srt`, mime: 'application/x-subrip', buffer: Buffer.from(toSrt(res.segments), 'utf8') });
  }
  return outputs;
};

/** summarize-podcast: transcript + summary */
export const summarize = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add the audio or video file to summarise.');
  ctx.progress(10, 'Transcribing');
  const res = await transcribeFile(file.path);
  if (!res.text) throw new UserError('No speech was recognised in that file.');

  ctx.progress(75, 'Summarising');
  let summary: string;
  try {
    const r = await generateText(
      [{
        role: 'user',
        content:
          'Summarise this transcript for a busy listener: a 2-sentence overview, then 5 bullet takeaways, ' +
          `then timestamps of the most interesting moments if they are obvious.\n\n"""\n${res.text.slice(0, 24000)}\n"""`,
      }],
      { system: 'You are a precise podcast editor. Return only the summary.', temperature: 0.3, maxTokens: 1200 },
    );
    summary = r.text;
  } catch {
    summary = 'The summary service is unavailable right now. The full transcript is attached.';
  }

  const base = baseName(file.name);
  return [
    { name: `${base}-summary.txt`, mime: 'text/plain; charset=utf-8', buffer: Buffer.from(summary + '\n', 'utf8') },
    { name: `${base}-transcript.txt`, mime: 'text/plain; charset=utf-8', buffer: Buffer.from(res.text + '\n', 'utf8') },
  ];
};

async function downloadAudio(url: string): Promise<{ file: string; dir: string }> {
  const dir = path.join(os.tmpdir(), `tc-yt-${crypto.randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  await ytDlp(['-x', '--audio-format', 'mp3', '-o', 'audio.%(ext)s', url], dir);
  const file = path.join(dir, 'audio.mp3');
  await fs.access(file).catch(() => {
    throw new UserError('The download produced no audio. The link may be private, region-locked or unsupported.');
  });
  return { file, dir };
}

/** youtube-to-text, youtube-transcript, summarize-youtube */
export const youtube = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const url = safeUrl(ctx.params.url ?? '').toString();
  ctx.progress(8, 'Downloading audio');
  const { file, dir } = await downloadAudio(url);
  try {
    ctx.progress(35, 'Transcribing');
    const res = await transcribeFile(file);
    if (!res.text) throw new UserError('No speech was recognised in that video.');
    const base = 'youtube';
    const outputs: EngineOutput[] = [
      { name: `${base}-transcript.txt`, mime: 'text/plain; charset=utf-8', buffer: Buffer.from(`${url}\n\n${res.text}\n`, 'utf8') },
    ];
    if (res.segments.length) {
      outputs.push({ name: `${base}.srt`, mime: 'application/x-subrip', buffer: Buffer.from(toSrt(res.segments), 'utf8') });
    }
    if (ctx.fixed.route === 'summarize-youtube') {
      ctx.progress(80, 'Summarising');
      try {
        const r = await generateText(
          [{ role: 'user', content: `Summarise this video transcript: 2-sentence overview, then 5 bullets.\n\n"""\n${res.text.slice(0, 24000)}\n"""` }],
          { system: 'You are a precise editor. Return only the summary.', temperature: 0.3, maxTokens: 1000 },
        );
        outputs.unshift({ name: `${base}-summary.txt`, mime: 'text/plain; charset=utf-8', buffer: Buffer.from(r.text + '\n', 'utf8') });
      } catch {
        /* transcript alone is still useful */
      }
    }
    return outputs;
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};

/** from-fb / from-inst / from-tiktok / from-twitter */
export const social = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const url = safeUrl(ctx.params.url ?? '').toString();
  const dir = path.join(os.tmpdir(), `tc-dl-${crypto.randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  try {
    ctx.progress(15, 'Downloading');
    await ytDlp(['-f', 'best', '-o', 'video.%(ext)s', url], dir);
    const files = (await fs.readdir(dir)).filter((f) => f.startsWith('video.'));
    if (!files.length) throw new UserError('The download produced no file. The link may be private or unsupported.');
    const name = files[0];
    const buffer = await fs.readFile(path.join(dir, name));
    const ext = path.extname(name).toLowerCase();
    const mime = ext === '.webm' ? 'video/webm' : ext === '.mkv' ? 'video/x-matroska' : ext === '.mp3' ? 'audio/mpeg' : 'video/mp4';
    return [{ name: `download${ext}`, mime, buffer }];
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
};
