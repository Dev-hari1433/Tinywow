# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Ordinary people — not designers, developers, or power users — who need to get one everyday file
chore finished: merge a stack of scanned PDFs, shrink a photo for an email, turn a spreadsheet into
something a colleague can open, make a QR code for a poster. They arrive mid-task from a search or
a bookmark, on a personal laptop, usually in a hurry, often without knowing the vocabulary
("lossless", "DPI", "MIME type"). They do not want an account, a trial, or a tutorial.

## Product Purpose

One place for every day-to-day file job, done in the browser. Upload, choose two or three plain
options, get the finished file back. Success is a visitor who finishes their chore on the first
attempt, without reading documentation and without wondering whether the result is real.

## Positioning

Breadth plus honesty. The catalogue carries 253 real tools across six categories, and each one
states up front whether it actually runs here or is still planned — the planned ones name the
missing dependency instead of faking an output. 210 tools run end to end today. No competitor
publishes that distinction; most show a full grid whether or not anything works.

## Operating Context

- Work happens server-side on real libraries (pdf-lib, sharp, ffmpeg, xlsx, docx, pptxgenjs,
  mammoth, ag-psd, potrace, qrcode). Uploads are processed by a queue and results come back as
  signed links.
- Files live for one hour, then both the link and the file on disk expire.
- 100 MB per upload; there is no signup, no dashboard, and no stored history.
- Some tools are pure computation with no input file (QR codes, timestamps, hashes), so the form
  may be the whole interaction.
- AI-backed writing tools depend on whichever provider key is configured; they may be slower or
  unavailable.

## Capabilities and Constraints

- 253 catalogued tools in 6 categories (PDF 47, Image 76, Video 59, Write 53, Converters 13,
  Utilities 5); 210 wired to engines, 43 planned.
- Planned tools stay in the catalogue and keep their inspected name, URL and category, but must be
  grouped separately as "planning to implement in future" rather than sitting at equal weight with
  working tools.
- Tool URLs are `/{category}/{slug}` and are fixed by the catalogue; the category filter on the
  tools index supports a planned-only view.
- One server, SQLite job store, no user accounts, no session identity.
- Nothing may silently return the input file as a result.

## Brand Commitments

- The name stays TinyClone.
- The footer keeps its disclosure that this is an independent reimplementation, not affiliated
  with the site it was reconstructed from.
- The running/planned distinction is a brand commitment, not a temporary gap.

## Evidence on Hand

- A real catalogue in `lib/catalog.ts` and real engines in `lib/engines/*`, plus end-to-end checks
  in `scripts/test-tools.mjs`, `scripts/verify-routes.mjs`, `scripts/verify-ui.mjs`.
- No customers, testimonials, press, pricing, benchmarks, or user counts exist. Future work must
  not invent any.

## Product Principles

1. The result is the product: get the visitor to their finished file in as few decisions as
   possible.
2. Say what is real. A tool that cannot run says so plainly and points at one that can.
3. Plain words first, jargon second; a first-time visitor should never need the term to use the
   control.
4. No friction that is not doing work: no signup, no upsell, no modal between the visitor and the
   file.
5. Every file is private by default — processed here, deleted on a clock the visitor can see.
