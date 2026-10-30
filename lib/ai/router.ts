// Multi-provider LLM router with automatic fallback.
//
// Order of preference is the seed list below (best first). Every attempt is
// ranked: healthy models first, then by measured latency. A failing model is
// put on a cooldown and skipped; when the cooldown expires the default is tried
// again, so the chain always drifts back to the preferred model.
//
// Configure with env vars (see .env.example):
//   OPENROUTER_API_KEY, GROQ_API_KEY, MISTRAL_API_KEY, GEMINI_API_KEY, BYTEZ_API_KEY
//   AI_PREFERRED_MODEL=groq:qwen/qwen3.8-27b
//   AI_PROVIDER=groq | openrouter | mistral | gemini | bytez
//   AI_COOLDOWN_SECONDS (600), AI_TIMEOUT_MS (60000), AI_DEBUG=1
import fs from 'node:fs';
import path from 'node:path';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
  attempts: string[];
  ms: number;
}

export class AiUnavailableError extends Error {}

interface ModelSpec {
  provider: ProviderName;
  id: string;
  tier: number;
}

type ProviderName = 'groq' | 'gemini' | 'mistral' | 'openrouter' | 'bytez';

const ENV_KEY: Record<ProviderName, string> = {
  groq: 'GROQ_API_KEY',
  gemini: 'GEMINI_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  bytez: 'BYTEZ_API_KEY',
};

const ENDPOINT: Record<ProviderName, string> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  bytez: 'https://api.bytez.com/models/v2/openai/v1/chat/completions',
};

// Verified against each provider's /models endpoint. Tier 0 is the default.
const SEEDS: ModelSpec[] = [
  { provider: 'groq', id: 'qwen/qwen3.8-27b', tier: 0 },
  { provider: 'gemini', id: 'gemini-flash-lite-latest', tier: 1 },
  { provider: 'gemini', id: 'gemini-3.1-flash-lite', tier: 2 },
  { provider: 'mistral', id: 'ministral-8b-latest', tier: 3 },
  { provider: 'openrouter', id: 'nvidia/nemotron-3.5-super-vl:free', tier: 4 },
  { provider: 'openrouter', id: 'poolside/laguna-s-2.1:free', tier: 5 },
  { provider: 'openrouter', id: 'dots-studio/dots-3-note-preview:free', tier: 6 },
  { provider: 'mistral', id: 'ministral-14b-latest', tier: 7 },
  { provider: 'groq', id: 'allam-2-7b', tier: 8 },
  { provider: 'mistral', id: 'ministral-3b-latest', tier: 9 },
  { provider: 'openrouter', id: 'liquid/lfm-2.5-2.6b:free', tier: 10 },
  { provider: 'openrouter', id: 'nvidia/nemotron-3.5-lightning:free', tier: 11 },
];

const TRANSCRIBE_MODELS = ['whisper-large-v3-turbo', 'whisper-large-v3'];

const DATA_DIR = path.join(process.cwd(), '.data');
const HEALTH_FILE = path.join(DATA_DIR, 'ai-health.json');
const DISCOVERY_FILE = path.join(DATA_DIR, 'ai-models.json');

const DEFAULT_COOLDOWN_MS = Number(process.env.AI_COOLDOWN_SECONDS ?? 600) * 1000;
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 60000);
const MAX_ATTEMPTS = 6;

interface Health {
  fails: number;
  cooldownUntil: number;
  lastOk: number;
  lastMs: number;
  lastError: string | null;
}

interface State {
  health: Record<string, Health>;
  discovered: ModelSpec[];
  discoveredAt: number;
  dirty: boolean;
}

const globalRef = globalThis as unknown as { __tinycloneAi?: State };

function state(): State {
  if (!globalRef.__tinycloneAi) {
    const s: State = { health: {}, discovered: [], discoveredAt: 0, dirty: false };
    try {
      const raw = JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf8')) as {
        health?: Record<string, Health>;
        discovered?: ModelSpec[];
        discoveredAt?: number;
      };
      s.health = raw.health ?? {};
      s.discovered = raw.discovered ?? [];
      s.discoveredAt = raw.discoveredAt ?? 0;
    } catch {
      /* first run */
    }
    globalRef.__tinycloneAi = s;
  }
  return globalRef.__tinycloneAi;
}

function persist() {
  const s = state();
  if (!s.dirty) return;
  s.dirty = false;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(HEALTH_FILE, JSON.stringify({ health: s.health, discovered: s.discovered, discoveredAt: s.discoveredAt }));
  } catch {
    /* non-fatal */
  }
}

const keyOf = (m: ModelSpec) => `${m.provider}:${m.id}`;

function apiKey(provider: ProviderName): string | undefined {
  return process.env[ENV_KEY[provider]]?.trim() || undefined;
}

function headersFor(provider: ProviderName): Record<string, string> {
  const key = apiKey(provider);
  if (!key) return {};
  if (provider === 'bytez') return { Authorization: key };
  if (provider === 'openrouter') {
    return {
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'TinyClone',
    };
  }
  return { Authorization: `Bearer ${key}` };
}

/** Models from providers that have a key in the environment. */
function candidates(): ModelSpec[] {
  const forced = process.env.AI_PROVIDER?.trim().toLowerCase() as ProviderName | undefined;
  const preferred = process.env.AI_PREFERRED_MODEL?.trim();
  const out: ModelSpec[] = [];

  const push = (m: ModelSpec) => {
    if (!apiKey(m.provider)) return;
    if (forced && m.provider !== forced) return;
    if (m.provider === 'bytez' && !process.env.BYTEZ_MODEL) return; // needs an explicit model id
    if (!out.some((x) => keyOf(x) === keyOf(m))) out.push(m);
  };

  if (preferred) {
    const [provider, ...rest] = preferred.split(':');
    if (rest.length && apiKey(provider as ProviderName)) {
      push({ provider: provider as ProviderName, id: rest.join(':'), tier: -1 });
    }
  }
  for (const m of SEEDS) push(m);
  for (const m of state().discovered) push(m);
  if (process.env.BYTEZ_MODEL && apiKey('bytez')) {
    push({ provider: 'bytez', id: process.env.BYTEZ_MODEL, tier: 9 });
  }
  return out.sort((a, b) => a.tier - b.tier);
}

/** Free OpenRouter models, refreshed at most every 6 hours, appended as backups. */
async function discoverOpenRouterFree(): Promise<void> {
  const s = state();
  if (!apiKey('openrouter')) return;
  if (Date.now() - s.discoveredAt < 6 * 60 * 60 * 1000 && s.discovered.length) return;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: headersFor('openrouter'),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      data?: { id: string; pricing?: { prompt?: string; completion?: string } }[];
    };
    const known = new Set(SEEDS.filter((m) => m.provider === 'openrouter').map((m) => m.id));
    const free = (data.data ?? [])
      .filter((m) => Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0)
      .map((m) => m.id)
      .filter((id) => !known.has(id))
      .slice(0, 12);
    s.discovered = free.map((id, i) => ({ provider: 'openrouter' as ProviderName, id, tier: 20 + i }));
    s.discoveredAt = Date.now();
    s.dirty = true;
    persist();
  } catch {
    /* discovery is best effort */
  }
}

function cooldownFor(status: number, message: string): number {
  if (status === 429) return Math.min(DEFAULT_COOLDOWN_MS, 60_000);
  if (status === 401 || status === 403) return 60 * 60 * 1000;
  if (status === 404 || /model/i.test(message) && /not|does not|unsupported/i.test(message)) return 60 * 60 * 1000;
  if (status >= 500) return Math.min(DEFAULT_COOLDOWN_MS, 120_000);
  return DEFAULT_COOLDOWN_MS;
}

function markOk(m: ModelSpec, ms: number) {
  const s = state();
  const h = s.health[keyOf(m)];
  const recovered = !!h?.fails;
  s.health[keyOf(m)] = { fails: 0, cooldownUntil: 0, lastOk: Date.now(), lastMs: ms, lastError: null };
  if (recovered && process.env.AI_DEBUG) console.warn(`[ai] ${keyOf(m)} recovered`);
  s.dirty = true;
  persist();
}

function markFail(m: ModelSpec, status: number, message: string) {
  const s = state();
  const prev = s.health[keyOf(m)];
  const fails = (prev?.fails ?? 0) + 1;
  s.health[keyOf(m)] = {
    fails,
    cooldownUntil: Date.now() + cooldownFor(status, message),
    lastOk: prev?.lastOk ?? 0,
    lastMs: prev?.lastMs ?? 0,
    lastError: message.slice(0, 240),
  };
  s.dirty = true;
  persist();
  if (process.env.AI_DEBUG) console.warn(`[ai] ${keyOf(m)} failed (${status}): ${message.slice(0, 120)}`);
}

/** Healthy models first (by preference then latency); cooled-down ones last. */
function ranked(models: ModelSpec[]): ModelSpec[] {
  const s = state();
  const now = Date.now();
  const live = models.filter((m) => (s.health[keyOf(m)]?.cooldownUntil ?? 0) <= now);
  const cooling = models.filter((m) => (s.health[keyOf(m)]?.cooldownUntil ?? 0) > now);
  const score = (m: ModelSpec) => m.tier * 10000 + (s.health[keyOf(m)]?.lastMs || 5000);
  live.sort((a, b) => score(a) - score(b));
  // If everything is cooling, retry the whole set rather than failing outright.
  return live.length ? [...live, ...cooling] : models;
}

async function callChat(
  model: ModelSpec,
  messages: ChatMessage[],
  opts: ChatOptions,
): Promise<string> {
  const body: Record<string, unknown> = {
    model: model.id,
    messages: opts.system ? [{ role: 'system', content: opts.system }, ...messages] : messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const res = await fetch(ENDPOINT[model.provider], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headersFor(model.provider) },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(opts.timeoutMs ?? TIMEOUT_MS),
  });

  const raw = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  if (!res.ok) {
    const err = data as { error?: { message?: string } | string; message?: string };
    const msg = typeof err?.error === 'string' ? err.error : err?.error?.message ?? err?.message ?? raw.slice(0, 200);
    const error = new Error(`${model.provider} ${res.status}: ${msg}`) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }

  const choice = (data as {
    choices?: { message?: { content?: string | { text?: string }[]; reasoning?: string } }[];
  }).choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === 'string' && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content.map((p) => p?.text ?? '').join('').trim();
    if (joined) return joined;
  }
  if (choice?.message?.reasoning?.trim()) return choice.message.reasoning.trim();
  throw new Error(`${model.provider}: empty response`);
}

/** Generates text, walking the fallback chain until a model answers. */
export async function generateText(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
  await discoverOpenRouterFree();
  const pool = ranked(candidates());
  if (!pool.length) {
    throw new AiUnavailableError(
      'No AI provider is configured. Set OPENROUTER_API_KEY, GROQ_API_KEY, GEMINI_API_KEY or MISTRAL_API_KEY in .env.local.',
    );
  }

  const attempts: string[] = [];
  const started = Date.now();
  for (const model of pool.slice(0, MAX_ATTEMPTS)) {
    const t0 = Date.now();
    try {
      const text = await callChat(model, messages, opts);
      markOk(model, Date.now() - t0);
      attempts.push(`${keyOf(model)} ok`);
      return { text, provider: model.provider, model: model.id, attempts, ms: Date.now() - started };
    } catch (err) {
      const status = (err as Error & { status?: number }).status ?? 0;
      markFail(model, status, (err as Error).message ?? 'unknown');
      attempts.push(`${keyOf(model)} failed: ${(err as Error).message.slice(0, 120)}`);
    }
  }
  throw new AiUnavailableError(
    `Every AI model failed. Last errors: ${attempts.slice(-3).join(' | ')}`,
  );
}

/** Speech-to-text: Groq Whisper first, then Mistral Voxtral. */
export async function transcribeAudio(
  buffer: Buffer,
  filename: string,
  mime: string,
  language?: string,
): Promise<{ text: string; segments: { start: number; end: number; text: string }[]; provider: string; model: string }> {
  const groq = apiKey('groq');
  const mistral = apiKey('mistral');
  const errors: string[] = [];

  if (groq) {
    for (const model of TRANSCRIBE_MODELS) {
      try {
        const form = new FormData();
        form.append('file', new Blob([new Uint8Array(buffer)], { type: mime }), filename);
        form.append('model', model);
        form.append('response_format', 'verbose_json');
        if (language) form.append('language', language);
        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groq}` },
          body: form,
          signal: AbortSignal.timeout(180000),
        });
        const raw = await res.text();
        if (!res.ok) throw new Error(`groq ${res.status}: ${raw.slice(0, 160)}`);
        const data = JSON.parse(raw) as {
          text?: string;
          segments?: { start: number; end: number; text: string }[];
        };
        return {
          text: (data.text ?? '').trim(),
          segments: data.segments ?? [],
          provider: 'groq',
          model,
        };
      } catch (err) {
        errors.push((err as Error).message);
      }
    }
  }

  if (mistral) {
    try {
      const form = new FormData();
      form.append('file', new Blob([new Uint8Array(buffer)], { type: mime }), filename);
      form.append('model', 'voxtral-mini-latest');
      const res = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${mistral}` },
        body: form,
        signal: AbortSignal.timeout(180000),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(`mistral ${res.status}: ${raw.slice(0, 160)}`);
      const data = JSON.parse(raw) as { text?: string; segments?: { start: number; end: number; text: string }[] };
      return { text: (data.text ?? '').trim(), segments: data.segments ?? [], provider: 'mistral', model: 'voxtral-mini-latest' };
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  throw new AiUnavailableError(
    `No speech-to-text provider answered. ${errors.slice(-2).join(' | ') || 'Set GROQ_API_KEY or MISTRAL_API_KEY.'}`,
  );
}

const OCR_PROMPT =
  'Transcribe every piece of text in this image exactly as it appears. Keep line breaks, table rows and '
  + 'headings. Return only the transcription, with no commentary.';

/** Gemini's OpenAI-compatible endpoint accepts inline images, so it doubles as an OCR fallback. */
async function geminiOcr(buffer: Buffer, mime: string): Promise<string> {
  if (!apiKey('gemini')) throw new Error('no gemini key');
  let lastError = '';
  for (const model of ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite']) {
    try {
      const res = await fetch(ENDPOINT.gemini, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headersFor('gemini') },
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 2500,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: OCR_PROMPT },
              { type: 'image_url', image_url: { url: `data:${mime};base64,${buffer.toString('base64')}` } },
            ],
          }],
        }),
        signal: AbortSignal.timeout(90000),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(`gemini ${res.status}: ${raw.slice(0, 160)}`);
      const data = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      if (text) return text;
      throw new Error('gemini returned no text');
    } catch (err) {
      lastError = (err as Error).message;
    }
  }
  throw new Error(lastError);
}

/** OCR: Mistral OCR first, then Gemini vision. Retries 429s before moving on. */
export async function ocrImage(buffer: Buffer, mime: string): Promise<{ markdown: string; pages: number }> {
  const key = apiKey('mistral');
  const errors: string[] = [];

  if (key) {
    const body = JSON.stringify({
      model: process.env.MISTRAL_OCR_MODEL ?? 'mistral-ocr-latest',
      document: { type: 'image_url', image_url: `data:${mime};base64,${buffer.toString('base64')}` },
    });
    const waits = [3000, 8000, 15000];
    for (let attempt = 0; attempt <= waits.length; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, waits[attempt - 1]));
      try {
        const res = await fetch('https://api.mistral.ai/v1/ocr', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.timeout(90000),
        });
        const raw = await res.text();
        if (!res.ok) {
          errors.push(`mistral ocr ${res.status}: ${raw.slice(0, 120)}`);
          if (res.status === 429) continue;
          break;
        }
        const data = JSON.parse(raw) as { pages?: { markdown?: string }[] };
        const pages = data.pages ?? [];
        const markdown = pages.map((p) => p.markdown ?? '').join('\n\n').trim();
        if (markdown) return { markdown, pages: pages.length };
        errors.push('mistral ocr returned no text');
        break;
      } catch (err) {
        errors.push((err as Error).message);
      }
    }
  }

  try {
    const markdown = await geminiOcr(buffer, mime);
    if (markdown.trim()) return { markdown: markdown.trim(), pages: 1 };
  } catch (err) {
    errors.push((err as Error).message);
  }

  throw new AiUnavailableError(
    `OCR failed. Set MISTRAL_API_KEY or GEMINI_API_KEY. ${errors.slice(-2).join(' | ')}`,
  );
}

export interface AiStatusRow {
  model: string;
  provider: string;
  status: 'ready' | 'cooling';
  cooldownSeconds: number;
  lastMs: number;
  lastError: string | null;
}

export function aiStatus(): { rows: AiStatusRow[]; providers: Record<string, boolean>; preferred: string } {
  const models = candidates();
  const s = state();
  const now = Date.now();
  const rows = ranked(models).map((m) => {
    const h = s.health[keyOf(m)];
    const cooling = (h?.cooldownUntil ?? 0) > now;
    return {
      model: m.id,
      provider: m.provider,
      status: cooling ? ('cooling' as const) : ('ready' as const),
      cooldownSeconds: cooling ? Math.ceil(((h?.cooldownUntil ?? 0) - now) / 1000) : 0,
      lastMs: h?.lastMs ?? 0,
      lastError: h?.lastError ?? null,
    };
  });
  return {
    rows,
    providers: Object.fromEntries(
      (Object.keys(ENV_KEY) as ProviderName[]).map((p) => [p, !!apiKey(p)]),
    ),
    preferred: rows[0] ? `${rows[0].provider}:${rows[0].model}` : '',
  };
}

/** Clears every cooldown so the default model is tried first again. */
export function resetAiHealth() {
  const s = state();
  s.health = {};
  s.dirty = true;
  persist();
}
