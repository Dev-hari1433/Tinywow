# tinywow.com — inspection report (REA + live runtime)

Date: 2026-10-29. Target: https://tinywow.com (public site, no account).

## Evidence ledger

| ID | Operation | What it establishes |
|---|---|---|
| `ev_c0c9335f3768ff8828e2479c811d35d6184c2bddad5c09174d037f0ea4261527` | REA `capture_browser_scenario` (launch Chromium 156.0.8078.48) | `https://tinywow.com/` resolves and renders; HTTP reachable |
| `ev_869aee5912b0dc2567fc625b8d0722038ee994f1ef039c8ccdf97ef09d20950c` | REA `capture_browser_scenario` (DOM + accessibility + screenshot + storage) | Homepage DOM captured, 1,161,165 bytes; screenshot sha256 `6345fbc9…3aabd` |
| `ev_42cc2062bbd581d32601c479e77a0aa549e2dd05682b1cd68946c3991471e7f6` | REA `capture_browser_scenario` on `/pdf/merge` | Tool page loads; `input[type=file]` present and attachable |
| `ev_8338c35643e57b53f65a04bb66a846de0a645e1ea8f005f1e402394b4f6d53ef` | REA `list_browser_targets` (CDP `127.0.0.1:9222`) | Live page title/URL identity for the tool under test |
| `.rea-capture/network.json`, `.rea-capture/probe-log.txt`, `.rea-capture/result.png` | CDP runtime probe (2 × 582-byte PDFs uploaded to the live merge tool) | Upload contract, status codes, response bodies, CDN URLs |

REA `fill` accepts text only, so the file-upload step was driven over CDP and the
resulting trace retained as an artifact. All other site facts below are read from
the served HTML/JS bundles and the live network trace.

## 1. Feature surface

`253` distinct tool routes in `6` categories (extracted from the rendered
navigation of `/` plus `/tools/{category}`):

| Category | Tools | Route prefix |
|---|---|---|
| image | 76 | `/image/*` |
| video | 59 | `/video/*` |
| write | 53 | `/write/*` |
| pdf | 47 | `/pdf/*` |
| converter | 13 | `/converter/*` |
| other | 5 | `/other/*` |

Supporting routes: `/tools`, `/tools/{category}`, search (`GET /tools?…`),
`/about`, `/contact`, `/privacy`, `/tos`, `/support-tinywow`, `/login`,
`/register`, `/password/email`, `/logout-js`, `/files` ("my files"),
`/blog`.

## 2. Stack as served

- Server-rendered **Laravel** (blade) — `window.Laravel` with `csrfToken`,
  `meta[name=csrf-token]`, `/login`, `/register`, `/password/email` routes.
- Front end: **Vue 2 + Vuex + vue-router**, webpack chunked per tool
  (`/js/scripts/pdf-merge.<hash>.js`, `uploadBlock`, `result-blocks`,
  `processing-loader`, `fileuploader`, `popular-tools`, …), axios with
  `baseURL = https://tinywow.com`.
- **Pusher/Laravel Echo** over WSS (`host tinywow.com:443`, `cluster mt1`,
  auth at `/broadcasting/auth`) for task progress.
- Storage/CDN: **DigitalOcean Spaces** (`tinywow.nyc3.cdn.digitaloceanspaces.com`)
  in time-stamped prefixes (`/2026-10-29_09-29/pdf_merge/<32-char>.pdf`).
- Payments: **Stripe** (`js.stripe.com/v3`, `/user/subscription/*`,
  `/user/creditcard/*`); bot protection: **Cloudflare Turnstile**
  (`challenges.cloudflare.com/turnstile`, site key `0x4AAAAAABmDsKgGHhVUvoMC`).
- Analytics/ads: GTM/gtag, PostHog, Freestar/Primis ad stack.
- Tailwind + Bootstrap 4 for the shell; Poppins webfont.

## 3. Observed API contract (live, HTTP 200)

Upload (multipart, `POST https://tinywow.com/file/upload`) — verified twice:

```json
{ "status": true, "file_id": 95721596,
  "url": "https://tinywow.nyc3.cdn.digitaloceanspaces.com/2026-10-29_09-29/pdf_merge/d8Uxgf0bnDORqOXNJfiDHzeRquZmhkxqSWL9QdmN.pdf" }
```

Other endpoints present in the page config (`window.ajaxUrls`):
`POST /file/upload-content`, `POST /file/upload`, `GET /main/search-tools`,
`POST /task/mark-downloaded/{taskId}` (download accounting + credit decrement),
`GET /task/other-tools/{taskId}`, `/files/files-modal`, `/files/delete/{id}`,
`/files/delete-all`, `/files/check-exists`, `/files/check-before-download/{id}`.

Per-tool conversion is invoked through a component `api_url` prop; results are
rendered from `{ taskId, downloadUrl }` and progress arrives over the websocket
channel. Job model is therefore: **upload → task → progress → download link**.

Client-side limits published to the UI (`window.fileUploader`):
general 612 MB, PDF 512 MB, video 512 MB, image 200 MB, chunked uploads above
90 MB. Files are deleted one hour after upload (stated in page copy and in the
`task.mark-downloaded` flow).

## 4. Per-tool interaction model (inferred from the merge walkthrough)

1. Drop/select ≥1 input file → N × `POST /file/upload` → `file_id` + CDN URL.
2. Tool-specific options (page order, quality, format…) held in Vuex.
3. Submit → `api_url` returns a `taskId`; progress via Echo/Pusher.
4. Result block offers `downloadUrl`; clicking it calls
   `/task/mark-downloaded/{taskId}` before the browser fetches from Spaces.
5. Anonymous use is allowed (`window.loggedIn = 0`); free usage is metered
   (`window.dataTool.limit_count`), deeper use is gated behind Stripe plans.

## 5. Where the work actually is

The shell is trivial; the 253 tools each need a real processing engine:

- **pdf (47)** — server-side PDF/libreoffice/ghostscript work.
- **image (76)** — sharp/ImageMagick/OpenCV; ~20 are AI (removal/upscale/colourise)
  and need model APIs.
- **video (59)** — ffmpeg; several are platform downloaders (YT/TikTok/IG/FB/X).
- **write (53)** — LLM calls; unusable without an API key.
- **converter (13)** — deterministic format transforms.
- **other (5)** — QR, lorem, zip, meme, timestamps (mostly client-side).

## 6. Honest scope statement

253 working tools is a multi-engine product, not a single build: it needs
ffmpeg, LibreOffice, Ghostscript, an image pipeline, an LLM provider and
per-platform download logic, plus storage, queues and metering for each.
The clone below is built as a **registry-driven platform**: one pipeline
(upload → job → worker → artifact → signed download) plus a catalogue that
describes every tool, with engines implemented for real in the order chosen.
