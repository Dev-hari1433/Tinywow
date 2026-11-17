import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ToolIcon, iconFor } from '@/lib/tool-icon';
import Finder, { type FindableTool } from '@/app/components/Finder';
import { fileCountLine, formatsLine } from '@/lib/format-label';
import {
  CATEGORIES, CATEGORY_COUNTS, CATEGORY_META, READY_TOOLS, TOOLS, getTool, type Tool,
} from '@/lib/catalog';

const FEATURED = ['pdf/merge', 'image/compress', 'converter/csv-to-excel', 'other/qr-code'];
const SHOWCASE = [
  'pdf/merge', 'pdf/split', 'pdf/compress', 'pdf/watermark', 'image/compress', 'image/resize',
  'image/crop-circle', 'image/convert', 'converter/csv-to-excel', 'converter/json-to-xml',
  'video/trim', 'video/convert', 'other/qr-code', 'other/unix-timestamp', 'write/summarize',
  'write/rewrite', 'pdf/to-jpg', 'image/combine',
];

const SHORT_AISLE: Record<string, string> = {
  pdf: 'PDF',
  image: 'IMG',
  video: 'VID',
  write: 'TXT',
  converter: 'DATA',
  other: 'UTILITIES',
};

const ACCENT: Record<string, string> = {
  pdf: 'var(--c-pdf)',
  image: 'var(--c-image)',
  video: 'var(--c-video)',
  write: 'var(--c-write)',
  converter: 'var(--c-converter)',
  other: 'var(--c-other)',
};

const CATEGORY_COPY: Record<string, { blurb: string; icon: ReactNode }> = {
  pdf: {
    blurb: 'Merge, split, compress, protect, sign, or pull single pages out of a document.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" />
        <path d="M14 3.5V8h4.5" />
        <path d="M9 13h6M9 16.5h4" />
      </svg>
    ),
  },
  image: {
    blurb: 'Resize, crop, compress, convert, or clean up photos and screenshots.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="4.5" width="17" height="15" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" />
      </svg>
    ),
  },
  video: {
    blurb: 'Trim, convert, mute, or pull the audio out of a clip. GIFs too.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="12.5" height="12" />
        <path d="M15.5 10.5l5.5-3v9l-5.5-3z" />
      </svg>
    ),
  },
  write: {
    blurb: 'Rewrite, summarise, and tidy up text, documents, and spreadsheets.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h16" />
        <path d="M6.5 15.5l8.5-9 3 3-8.5 9H6.5z" />
      </svg>
    ),
  },
  converter: {
    blurb: 'Move data between CSV, Excel, JSON, XML, and PDF without breaking it.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 8h13l-4-4" />
        <path d="M20 16H7l4 4" />
      </svg>
    ),
  },
  other: {
    blurb: 'QR codes, timestamps, hashes, unit conversions, and colour tools.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="6.5" height="6.5" />
        <rect x="13.5" y="4" width="6.5" height="6.5" />
        <rect x="4" y="13.5" width="6.5" height="6.5" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" />
      </svg>
    ),
  },
};

/* example tools per card, matched by name so the picks survive slug changes */
const PICKS: Record<string, RegExp[]> = {
  pdf: [/^merge pdf$/i, /^split pdf$/i, /^compress pdf$/i],
  image: [/^compress image$/i, /^resize image$/i, /^convert image$/i],
  video: [/\btrim\b/i, /^convert video/i, /\bmp3\b/i],
  write: [/summar/i, /rewrit/i, /grammar|proofread/i],
  converter: [/csv to excel/i, /excel to csv/i, /json to xml/i],
  other: [/qr code/i, /timestamp/i],
};

function toFindable(t: Tool): FindableTool {
  return {
    slug: t.slug,
    category: t.category,
    name: t.name,
    accept: t.accept,
    engine: t.engine,
    summary: t.summary,
  };
}

export default function HomePage() {
  const findable: FindableTool[] = TOOLS.map(toFindable);
  const labels = Object.fromEntries(
    CATEGORIES.map((c) => [c, CATEGORY_META[c].label]),
  ) as Record<string, string>;

  const readyByCat = Object.fromEntries(
    CATEGORIES.map((c) => [c, READY_TOOLS.filter((t) => t.category === c).length]),
  ) as Record<string, number>;

  const examplesByCat = Object.fromEntries(
    CATEGORIES.map((cat) => {
      const ready = READY_TOOLS.filter((tool) => tool.category === cat);
      const picked: Tool[] = [];
      for (const pattern of PICKS[cat] ?? []) {
        const hit = ready.find(
          (tool) => pattern.test(tool.name) && !picked.some((p) => p.slug === tool.slug),
        );
        if (hit) picked.push(hit);
      }
      const fill = ready
        .filter((tool) => !picked.some((p) => p.slug === tool.slug))
        .sort(
          (a, b) =>
            Number(Boolean(a.engine?.startsWith('ai.'))) -
            Number(Boolean(b.engine?.startsWith('ai.'))),
        );
      return [cat, [...picked, ...fill].slice(0, 3)];
    }),
  ) as Record<string, Tool[]>;

  const featured = FEATURED.map((key) => {
    const [c, s] = key.split('/');
    return getTool(c, s);
  }).filter((t): t is Tool => Boolean(t && t.engine));

  const popular = featured.map(toFindable);

  const showcase = SHOWCASE.map((key) => {
    const [c, s] = key.split('/');
    return getTool(c, s);
  })
    .filter((t): t is Tool => Boolean(t && t.engine))
    .slice(0, 16);

  const planned = TOOLS.filter((t) => !t.engine);

  return (
    <>
      <section className="hero">
        <div className="rail hero-in">
          <div>
            <h1 className="hero-title">
              Every file job,
              <span>done in one place.</span>
            </h1>
            <p className="hero-lede">
              {READY_TOOLS.length} tools that actually run: merge a PDF, shrink a photo, turn a
              spreadsheet into something anyone can open. Pick one, add your file, take the finished
              copy. No account, nothing to install.
            </p>
            <div className="hero-actions">
              <Link href="/tools" className="btn">
                Browse all {READY_TOOLS.length} tools
              </Link>
              <Link href="#how" className="link-u">
                How it works
              </Link>
            </div>
            <ul className="hero-facts">
              <li>
                <b>{READY_TOOLS.length}</b> ready to use now
              </li>
              <li>
                <b>{TOOLS.length}</b> tools listed
              </li>
              <li>Files deleted after 1 hour</li>
              <li>No signup, no install</li>
            </ul>
          </div>

          <Finder
            tools={findable}
            labels={labels}
            popular={popular}
            totalListed={TOOLS.length}
            totalWorking={READY_TOOLS.length}
          />
        </div>
      </section>

      <section className="cats" aria-labelledby="browse-heading">
        <div className="rail">
          <div className="section-head">
            <div>
              <h2 id="browse-heading">Browse by category</h2>
              <p>
                Six groups, {TOOLS.length} tools. Each card shows what is ready today and three
                tools to start with.
              </p>
            </div>
            <Link href="/tools" className="link-u">
              See every tool
            </Link>
          </div>

          <div className="cat-grid">
            {CATEGORIES.map((cat) => (
              <article
                key={cat}
                className="cat-card"
                style={{ '--accent': ACCENT[cat] } as CSSProperties}
              >
                <div className="cat-head">
                  <span className="cat-icon" aria-hidden="true">
                    {CATEGORY_COPY[cat].icon}
                  </span>
                  <span className="cat-status">{readyByCat[cat]} ready</span>
                </div>
                <h3 className="cat-name">
                  <Link href={`/tools?category=${cat}`} className="cat-stretch">
                    {CATEGORY_META[cat].label}
                  </Link>
                </h3>
                <p className="cat-desc">{CATEGORY_COPY[cat].blurb}</p>
                <ul className="cat-list">
                  {examplesByCat[cat].map((tool) => (
                    <li key={tool.slug}>
                      <Link href={`/${tool.category}/${tool.slug}`}>{tool.name}</Link>
                    </li>
                  ))}
                </ul>
                <span className="cat-go">
                  All {CATEGORY_COUNTS[cat]} {CATEGORY_META[cat].label.toLowerCase()} tools
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="shelf">
        <div className="rail">
          <div className="section-head">
            <div>
              <h2>Best of TinyClone</h2>
              <p>
                Four tools people reach for most. Each one is wired to a real engine and covered
                by the end-to-end checks in this repo.
              </p>
            </div>
            <Link href="/tools" className="link-u">
              View all {READY_TOOLS.length}
            </Link>
          </div>

          <div className="feature-grid">
            {featured.map((tool) => (
              <Link
                key={`${tool.category}/${tool.slug}`}
                href={`/${tool.category}/${tool.slug}`}
                className="feature"
                style={{ '--accent': ACCENT[tool.category] } as CSSProperties}
              >
                <div className="feature-plate">
                  <span className="feature-glyph" aria-hidden="true">
                    <ToolIcon icon={iconFor(tool)} size={54} />
                  </span>
                  <em className="feature-format">
                    {formatsLine(tool.accept, tool.minFiles, 1) === 'no file needed'
                      ? SHORT_AISLE[tool.category]
                      : formatsLine(tool.accept, tool.minFiles, 1)}
                  </em>
                </div>
                <div className="feature-name">{tool.name}</div>
                <div className="feature-spec">
                  {CATEGORY_META[tool.category].label} · {fileCountLine(tool.minFiles, tool.maxFiles)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="services">
        <div className="rail">
          <div className="service">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
            </svg>
            <div>
              <b>No account</b>
              <p>Nothing to sign up for. Open a tool and use it.</p>
            </div>
          </div>
          <div className="service">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8.2" />
              <path d="M12 7.4V12l3.2 2" />
            </svg>
            <div>
              <b>Deleted in an hour</b>
              <p>Links and files both expire on the same clock.</p>
            </div>
          </div>
          <div className="service">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="4.5" width="17" height="15" />
              <path d="M3.5 9.5h17M7.5 14h5" />
            </svg>
            <div>
              <b>Processed here</b>
              <p>The work happens on this server, not a third party.</p>
            </div>
          </div>
          <div className="service">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.6 3.4H20v7.4l-8.6 8.6-7.4-7.4z" />
              <circle cx="16.6" cy="7.4" r="1.3" />
            </svg>
            <div>
              <b>Free to use</b>
              <p>No price, no trial, no card. Every tool in the list is free.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="rail">
          <div className="section-head">
            <div>
              <h2>How it works</h2>
              <p>Three steps, whichever aisle you are in.</p>
            </div>
          </div>

          <div className="steps">
            <div className="step-item">
              <span className="step-num">01</span>
              <div className="step-name">Drop the file</div>
              <div className="step-spec">Up to 100 MB, one or many</div>
            </div>
            <div className="step-item">
              <span className="step-num">02</span>
              <div className="step-name">Pick an option</div>
              <div className="step-spec">Plain words, sensible defaults</div>
            </div>
            <div className="step-item">
              <span className="step-num">03</span>
              <div className="step-name">Take the copy</div>
              <div className="step-spec">Signed link, valid for one hour</div>
            </div>
            <div className="step-item">
              <span className="step-num">04</span>
              <div className="step-name">Not sure which tool?</div>
              <div className="step-spec">
                <Link href="/tools" style={{ borderBottom: '1px solid var(--ink)', color: 'var(--ink)' }}>
                  Search the directory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="rail">
          <div className="section-head">
            <div>
              <h2>On the shelf today</h2>
              <p>
                A slice of the {READY_TOOLS.length} tools that work end to end right now. Every one
                of them is listed in the directory under its aisle.
              </p>
            </div>
            <Link href="/tools" className="link-u">
              The full directory
            </Link>
          </div>

          <div className="index">
            {showcase.map((tool) => (
              <Link
                key={`${tool.category}/${tool.slug}`}
                href={`/${tool.category}/${tool.slug}`}
                className="strip"
              >
                <span className="icon-tile sm" aria-hidden="true">
                  <ToolIcon icon={iconFor(tool)} size={14} />
                </span>
                <div>
                  <div className="strip-name">{tool.name}</div>
                  <div className="strip-spec">
                    <span>{CATEGORY_META[tool.category].label}</span>
                    <span>
                      {formatsLine(tool.accept, tool.minFiles).toLowerCase() ===
                      CATEGORY_META[tool.category].label.toLowerCase()
                        ? fileCountLine(tool.minFiles, tool.maxFiles)
                        : formatsLine(tool.accept, tool.minFiles)}
                    </span>
                  </div>
                </div>
                <span className="strip-go">Open</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="planned">
        <div className="rail">
          <div className="planned-head">
            <div>
              <h2>Planning to implement in future</h2>
              <p>
                {planned.length} catalogued tools are not built yet. They keep their real name, URL
                and aisle, and each one says what it is waiting on. Nothing here quietly returns
                your file unchanged.
              </p>
            </div>
            <Link href="/tools?category=planned" className="link-u">
              All {planned.length} planned
            </Link>
          </div>
          <div className="planned-links">
            {planned.slice(0, 16).map((tool) => (
              <Link key={`${tool.category}/${tool.slug}`} href={`/${tool.category}/${tool.slug}`}>
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
