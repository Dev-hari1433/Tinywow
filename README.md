# TinyClone

A full-stack reconstruction of **tinywow.com**'s file-tool product: the complete 253-tool
catalog, with **210 of those tools processing real files end to end** on this server.

The inspected source site, its routes, its stack and its live upload contract are documented
in [`docs/INSPECTION.md`](docs/INSPECTION.md) with the evidence IDs behind each claim.

```
253 tools in 6 categories  ·  210 working  ·  43 explicitly planned (with reasons)
```

## What works, and what is honest about the rest

Every tool keeps its inspected name, route, parameters and category. A tool is marked **Ready**
only when a real engine is wired to it; everything else is marked **Planned** and states the
concrete missing dependency when you open it. Nothing returns the input file as a fake result.

| Category | In catalog | Working |
|---|---|---|
| PDF | 47 | 35 |
| Image | 76 | 47 |
| Video | 59 | **59** |
| Converters | 13 | 11 |
| Write (AI) | 53 | **53** |
| Utilities | 5 | **5** |

## Engine toolchains

| Toolchain | Implementation |
|---|---|
| PDF | `pdf-lib` + `pdfjs-dist` + `@napi-rs/canvas` |
| Image | `sharp` + canvas + `potrace` + `ag-psd` |
| Video / audio | bundled `ffmpeg` 6.1.1 + `ffprobe` |
| Spreadsheets / data | SheetJS `xlsx`, `pdf-lib` |
| Utilities | `qrcode`, `jszip`, canvas |
| AI text | `lib/ai/router.ts` → Groq / Gemini / Mistral / OpenRouter |
| Speech | Groq Whisper (Mistral Voxtral fallback) + `yt-dlp` |
| OCR / import | Mistral OCR (Gemini vision fallback), `mammoth`, `jszip` |

## Stack

- **Next.js 15 (App Router) + React 19 + TypeScript** — server components for the catalog,
  one client component for the workspace.
- **SQLite via `node:sqlite`** — jobs, uploaded file records, outputs. No external database.
- **Filesystem storage** under `.data/` (uploads, outputs, temp), one hour retention.
- **In-process queue** with concurrency 2; each job reports progress the UI polls.
- **Signed download links** — HMAC over `jobId:outputId:exp`, checked in constant time.
- **ffmpeg 6.1.1** and **ffprobe** ship with the app (`ffmpeg-static`), so video tools need no
  system package. `FFMPEG_PATH` / `FFPROBE_PATH` override the bundled binaries.

Static file tools contact nothing. Only the AI, OCR, speech and downloader tools reach the
network, and only the bytes they need to.

## The AI fallback chain

`lib/ai/router.ts` fans every writing, summarising, translating, OCR and transcription request
across five providers:

| Provider | Env var | Role |
|---|---|---|
| Groq | `GROQ_API_KEY` | default text model (`qwen/qwen3.8-27b`) + Whisper speech-to-text |
| Gemini | `GEMINI_API_KEY` | second text model, plus vision OCR fallback |
| Mistral | `MISTRAL_API_KEY` | third text model, Mistral OCR, Voxtral transcription fallback |
| OpenRouter | `OPENROUTER_API_KEY` | every free model it lists, appended as extra backups |
| Bytez | `BYTEZ_API_KEY` | optional, only used when `BYTEZ_MODEL` names a model its catalog serves |

Behaviour:

- Models are ordered by preference, then by measured latency. The first healthy one answers.
- A failure is classified and cooled down: `429` → 60 s, `5xx` → 2 min, `401/403` and unknown
  models → 1 h. The failing model is skipped and the next one is tried, up to six attempts.
- When a cooldown expires the model re-enters the pool, and once it answers the chain drifts
  back to the default model automatically — no manual reset.
- Health and the discovered free-model list persist in `.data/ai-health.json`, so a restart does
  not lose what was learned.
- If everything is cooling, the whole set is retried rather than failing outright.

Inspect it live:

```bash
curl localhost:3000/api/ai/status     # every model, its state, latency and last error
npm run probe:ai                      # sweep every model on every provider, write .verify/ai-models.md
```

Knobs: `AI_PREFERRED_MODEL` (`groq:qwen/qwen3.8-27b`), `AI_PROVIDER`, `AI_COOLDOWN_SECONDS`,
`AI_TIMEOUT_MS`, `AI_DEBUG=1`. See [`.env.example`](.env.example).

## Pipeline

```
browser                         server
───────                         ──────
POST /api/upload        →  validate size/type, write .data/uploads/<uuid>
                        ←  [{ id, name, size }]
POST /api/jobs          →  validate tool + declared params + file ids
                           enqueue(jobId)
                        ←  { jobId }
GET  /api/jobs/:id      →  { status, progress, message, outputs[] }
                           outputs[].url = signed, expiring link
GET  /api/download/...  →  verify HMAC + expiry, stream bytes
```

Engines run server-side in `lib/engines/*`, receive uploaded paths plus validated params, and
return `{ name, mime, buffer }` outputs. The queue records failures with a user-facing message,
which is what the UI renders (for example `Those pages do not exist in a 3-page document.`).

## Layout

```
app/
  page.tsx                     home: counts, categories, working highlights
  tools/page.tsx               searchable catalog (253 entries, ready/planned badges)
  [category]/[tool]/page.tsx   per-tool page; 404 when the route is not in the catalog
  api/upload|jobs|download/…   the pipeline endpoints
  api/ai/status                live AI fallback chain
lib/
  catalog.ts                   generated: 253 tools, params, engine id, file limits
  ai/router.ts                 providers, free-model discovery, fallback, health, OCR, STT
  engines/pdf.ts, pdf2.ts      merge/split/watermark + overlays, signing, Office exports
  engines/image.ts, image2.ts  resize/convert + collage, charts, tracing, PSD, EPS
  engines/media.ts             ffmpeg: transcode, compress, trim, GIF/WebP, subtitles
  engines/ai.ts                53 write tools, PDF summariser and translator
  engines/speech.ts            transcription, podcast summaries, YouTube, social downloads
  engines/extra.ts             upscale, OCR, Word/PowerPoint/web page → PDF
  engines/data.ts              CSV/JSON/XML/Excel/PDF tables
  engines/other.ts             QR, lorem, timestamps, meme, ZIP
  engines/index.ts             engine registry + per-engine file constraints
  queue.ts, db.ts, signed.ts   job runner, storage, signing
scripts/
  gen-catalog.mjs              rebuilds lib/catalog.ts from the inspected inventory
  probe-ai.mjs                 sweeps every AI model and reports pass/fail + latency
  test-tools.mjs               end-to-end HTTP proof for the 142 offline tools
  test-ai.mjs                  end-to-end HTTP proof for the network-backed tools
  verify-semantics.mjs         page counts, rotation, watermark text, pixel dimensions
  verify-routes.mjs            every catalog route renders with the right status
  verify-ui.mjs                headless-Chrome proof of the real React workspace
docs/INSPECTION.md             source-site inspection + evidence ledger
```

## Run it

```bash
npm install
cp .env.example .env.local   # add whichever provider keys you have
npm run build
npm start                    # http://localhost:3000
```

Development: `npm run dev`. If port 3000 is taken, `PORT=3100 npm start`.

The downloader tools need `python -m pip install yt-dlp`; everything else is bundled.

## Verify it

Start the server first; each script talks to it over HTTP (or CDP for the UI one).
The scripts assume port 3000 — pass `BASE` for any other port.

```bash
npm run test:tools       # 142/142 offline tools + 9/9 platform checks
npm run test:ai          # 61/61 network-backed tools (downloaders skip without a link)
npm run test:routes      # 253/253 tool pages render correctly
npm run test:ui          # 3/3 real-browser checks
npm run test:semantics   # 14/14 output-correctness checks
npm run probe:ai         # every model on every provider, with latency

BASE=http://127.0.0.1:3100 npm run test:tools
TEST_LIVE=1 ONLY=youtube BASE=http://127.0.0.1:3100 npm run test:ai
```

`test:tools` builds real fixtures — two 3-page PDFs, a PDF with an embedded photo, PNG/JPG/GIF/
TIFF/WebP images, a real 2-second H.264/AAC clip transcoded into MP4/AVI/MKV/MOV/WebM plus MP3/
WAV/M4A/AAC/OGG audio, an SRT, an XLSX workbook, a DOCX, a PPTX, an SVG, a TTF font and a PSD —
then for each working tool uploads those files, creates a job, polls it, downloads every output
and inspects the bytes with the matching library: PDFs must parse, images must decode, media must
expose real streams and a duration through `ffprobe`, OOXML packages must contain their document
part, XLSX must have rows, ZIPs must list entries. It also asserts the negative paths — planned
tools refused with their reason, unsigned and tampered downloads rejected, empty uploads rejected,
merge refusing a single file.

`test:ai` drives the same pipeline for the model-backed tools and checks the content, not the
status code: a rewrite must differ from its input, `ai-detector` must return a score, a
translation must contain translated words and a real PDF, OCR must read the rendered
`HELLO WORLD`, a transcript must contain the spoken words, summaries must mention the source.

`test:semantics` reads the produced bytes for correctness: a merged PDF has exactly 6 pages, split
produces three 1-page files, rotate sets 90° on every page, the watermark string survives a round
trip through the extract-text tool, `resize` returns exactly 160×120, `crop` returns the requested
box, grayscale channel means match, the circle crop clears its corners, CSV→JSON preserves a
quoted comma, and split CSV respects its row budget.

Latest run on this machine (production build, port 3100):
**142/142 tools · 9/9 platform · 61/61 AI tools · 253/253 routes · 14/14 semantics.**

`probe:ai` swept 76 candidate models and 19 answered; the rest are rate-limited or
region-gated free models, which is exactly what the fallback chain exists for.

## Tool coverage

- **PDF (35):** merge, split, compress, rotate, rearrange, delete pages, create, extract text,
  PDF→text, render to JPG/PNG, JPG/PNG/GIF/TIFF/WebP→PDF, watermark, add text, edit, annotate,
  add images, insert blank pages, crop, extract embedded images, sign, summarise, translate,
  PDF→Word/PowerPoint/Excel/CSV/TIFF, and Word/PowerPoint/web page→PDF.
- **Image (47):** compress, resize, crop, upscale 2-4x, grayscale, flip, pixelate, border, profile
  photo, circle crop, combine, split grid, add images, collage, CSV→chart PNG, text→PNG,
  font→PNG, remove a flat background colour, EXIF/metadata report, OCR to text,
  JPG/PNG/TIFF→SVG tracing, SVG→PNG, PSD→JPG/PNG, PNG→EPS, and format conversions.
- **Video/audio (59 — all of them):** every inspected conversion, compress (also AVI/MKV/MOV),
  cutter, extract audio, mute, resize, video→GIF, video→animated WebP, burn-in subtitles,
  audio/video→text with SRT, podcast transcription and summaries, YouTube transcripts and
  summaries, plus Facebook/Instagram/TikTok/X downloads.
- **Write (53 — all of them):** the full set from paraphrasing and grammar fixing through
  articles, legal drafts, ad copy, scripts, translations and the local word counter.
- **Converters (11):** CSV↔JSON/Excel, JSON↔XML, XML→CSV/Excel, Excel→XML/PDF, split CSV/Excel.
- **Utilities (5):** QR code, lorem ipsum, Unix timestamp, meme maker, ZIP.

### Planned (43), and exactly what each needs

| Blocker | Tools |
|---|---|
| AI image models (segmentation, inpainting, generation) | `ai-image-generator`, `remove-bg`, `remove-objects`, `remove-person`, `remove-text-photo`, `remove-watermark-photo`, `unblur`, `colorize-photo`, `cleanup-picture`, `change-bg-photo`, `blur-background`, `translate` (12) |
| Ghostscript / qpdf | `pdf/protect`, `pdf/unlock`, `pdf/from-eps`, `image/eps-to-jpg|png|svg` (6) |
| Calibre | `pdf/from-azw3|epub|mobi`, `pdf/to-azw3|epub|mobi`, `converter/epub-to-azw3|mobi` (8) |
| HEVC still-image decoder | `image/heic-to-jpg|png|avif`, `pdf/from-heic` (4) |
| A Visio reader | `image/vsd-to-*`, `image/vsdx-to-*` (8) |
| PSD vector export | `image/psd-to-ai`, `image/psd-to-svg` (2) |
| Outlook MSG parser | `pdf/from-msg` (1) |
| Watermark removal | `pdf/remove-watermark` (1) |
| APNG encoder | `image/gif-to-apng` (1) |

## Security and data handling

- Uploads capped at 100 MB, empty files rejected, names sanitised before storage.
- Only parameters declared in the catalog reach an engine; select values are validated against
  their option list.
- Download links are HMAC-signed and expire after one hour; verification is constant-time.
- Files and outputs are deleted after the same hour (`sweepExpired` in `lib/db.ts`).
- URL-based tools refuse non-http(s) schemes and private/loopback hosts before fetching.
- Uploaded SVG/PSD/font files are parsed by libraries, never executed.
- API keys live in `.env.local`, which is gitignored; the browser never sees them.
- This is a local demo: there is no auth, no rate limiting and no metering layer, unlike the
  original site's account/subscription system.

Not affiliated with the site it was reconstructed from.
