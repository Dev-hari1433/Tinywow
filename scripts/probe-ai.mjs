// Probes every AI model reachable with the configured keys and prints a table.
//   node scripts/probe-ai.mjs
// Exits non-zero when no model works, so it can gate a deploy.
import fs from 'node:fs';
import path from 'node:path';

// ---------- env ----------
const envFile = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const KEY = {
  groq: process.env.GROQ_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
  mistral: process.env.MISTRAL_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
  bytez: process.env.BYTEZ_API_KEY,
};

const ENDPOINT = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  bytez: 'https://api.bytez.com/models/v2/openai/v1/chat/completions',
};

const TIMEOUT = Number(process.env.PROBE_TIMEOUT_MS ?? 30000);

function headers(provider) {
  if (provider === 'bytez') return { Authorization: KEY.bytez };
  if (provider === 'openrouter') {
    return { Authorization: `Bearer ${KEY.openrouter}`, 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'TinyClone probe' };
  }
  return { Authorization: `Bearer ${KEY[provider]}` };
}

async function json(url, opts = {}) {
  const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
}

// ---------- discover every candidate ----------
const candidates = [];

if (KEY.openrouter) {
  const { status, body } = await json('https://openrouter.ai/api/v1/models', { headers: headers('openrouter') });
  if (status === 200) {
    const free = (body.data ?? []).filter((m) => Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0);
    for (const m of free) candidates.push({ provider: 'openrouter', id: m.id });
    console.log(`openrouter: ${free.length} free models of ${body.data.length}`);
  } else {
    console.log(`openrouter: model list failed (${status})`);
  }
}

if (KEY.groq) {
  const { status, body } = await json('https://api.groq.com/openai/v1/models', { headers: headers('groq') });
  if (status === 200) {
    const skip = /whisper|guard|orpheus|tts|embed/i;
    const chat = (body.data ?? []).map((m) => m.id).filter((id) => !skip.test(id));
    for (const id of chat) candidates.push({ provider: 'groq', id });
    console.log(`groq: ${chat.length} chat models`);
  } else {
    console.log(`groq: model list failed (${status})`);
  }
}

if (KEY.mistral) {
  const { status, body } = await json('https://api.mistral.ai/v1/models', { headers: headers('mistral') });
  if (status === 200) {
    const skip = /embed|ocr|tts|transcribe|realtime|moderation|vibe|code|fim/i;
    const chat = (body.data ?? []).map((m) => m.id).filter((id) => !skip.test(id));
    for (const id of chat) candidates.push({ provider: 'mistral', id });
    console.log(`mistral: ${chat.length} chat models`);
  } else {
    console.log(`mistral: model list failed (${status})`);
  }
}

if (KEY.gemini) {
  const { status, body } = await json(`https://generativelanguage.googleapis.com/v1beta/models?key=${KEY.gemini}`);
  if (status === 200) {
    const chat = (body.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      .filter((id) => /gemini|gemma/.test(id) && !/image|tts|embedding|aqa|lite-preview-0/.test(id) || /flash-lite|flash-latest|pro-latest/.test(id));
    const unique = [...new Set(chat)];
    for (const id of unique) candidates.push({ provider: 'gemini', id });
    console.log(`gemini: ${unique.length} chat models`);
  } else {
    console.log(`gemini: model list failed (${status})`);
  }
}

if (KEY.bytez) {
  for (const id of (process.env.BYTEZ_MODELS ?? 'Qwen/Qwen3-4B,meta-llama/Llama-3.1-8B-Instruct').split(',')) {
    candidates.push({ provider: 'bytez', id: id.trim() });
  }
  console.log('bytez: probing the configured ids (the key is accepted; its catalog decides)');
}

// ---------- test each ----------
async function probe({ provider, id }) {
  const started = Date.now();
  try {
    const res = await fetch(ENDPOINT[provider], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers(provider) },
      body: JSON.stringify({ model: id, messages: [{ role: 'user', content: 'Reply with exactly: OK' }], max_tokens: 24 }),
      signal: AbortSignal.timeout(TIMEOUT),
    });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    const content = body?.choices?.[0]?.message?.content;
    const ok = res.ok && typeof content === 'string' && content.trim().length > 0;
    const failure = body?.error?.message ?? body?.error?.type ?? body?.message ?? body?.error ?? body;
    const reason = ok
      ? content.trim().replace(/\s+/g, ' ').slice(0, 28)
      : (typeof failure === 'string' ? failure : JSON.stringify(failure)).replace(/\s+/g, ' ').slice(0, 90);
    return { provider, id, status: res.status, ok, ms: Date.now() - started, reason };
  } catch (err) {
    return { provider, id, status: 0, ok: false, ms: Date.now() - started, reason: String(err.message ?? err).slice(0, 90) };
  }
}

const results = [];
const queue = [...candidates];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const next = queue.shift();
    results.push(await probe(next));
  }
});
await Promise.all(workers);

results.sort((a, b) => Number(b.ok) - Number(a.ok) || a.ms - b.ms);

console.log('\nprovider   model                                   result   ms     note');
console.log('---------  --------------------------------------  -------  -----  ----');
for (const r of results) {
  console.log(
    `${r.provider.padEnd(10)} ${r.id.slice(0, 38).padEnd(38)}  ${(r.ok ? 'PASS' : `FAIL`).padEnd(7)}  ${String(r.ms).padStart(5)}  ${r.reason}`,
  );
}

const working = results.filter((r) => r.ok);
console.log(`\n${working.length}/${results.length} models answered`);

fs.mkdirSync(path.join(process.cwd(), '.verify'), { recursive: true });
const report = [
  `# AI model probe — ${new Date().toISOString()}`,
  '',
  `Providers with a key: ${Object.entries(KEY).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}`,
  '',
  '| Provider | Model | Result | Latency | Note |',
  '| --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.provider} | \`${r.id}\` | ${r.ok ? 'PASS' : 'FAIL'} | ${r.ms} ms | ${r.reason.replace(/\|/g, '\\|')} |`),
  '',
  `**${working.length} of ${results.length} models answered.**`,
  '',
  'The runtime fallback order puts the fastest working models first and cools down failures for 10 minutes.',
].join('\n');
fs.writeFileSync(path.join(process.cwd(), '.verify', 'ai-models.md'), report);

if (!working.length) {
  console.error('\nNo model answered. Check the keys and network.');
  process.exitCode = 1;
}
