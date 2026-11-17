'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { CATEGORY_ACCENT, ToolIcon, iconFor } from '@/lib/tool-icon';

export interface FindableTool {
  slug: string;
  category: string;
  name: string;
  accept: string[];
  engine: string | null;
  summary: string;
}

function extOf(name: string) {
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return '';
  return name.slice(dot).toLowerCase();
}

function takesFile(tool: FindableTool, ext: string) {
  if (!ext) return false;
  return tool.accept.some((entry) => entry.toLowerCase() === ext);
}

export default function Finder({
  tools,
  labels,
  popular,
  totalListed,
  totalWorking,
}: {
  tools: FindableTool[];
  labels: Record<string, string>;
  popular: FindableTool[];
  totalListed: number;
  totalWorking: number;
}) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<{ name: string; ext: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !picked) return [];

    const scored = tools
      .map((tool) => {
        let score = 0;
        if (q) {
          const inName = tool.name.toLowerCase().includes(q);
          const inSlug = tool.slug.includes(q.replace(/\s+/g, '-'));
          const inSummary = tool.summary.toLowerCase().includes(q);
          const inLabel = (labels[tool.category] ?? '').toLowerCase().includes(q);
          if (!inName && !inSlug && !inSummary && !inLabel) return null;
          score += inName ? 3 : 0;
          score += inSlug ? 1 : 0;
          score += tool.engine ? 2 : 0;
        }
        if (picked && takesFile(tool, picked.ext)) score += 6;
        if (picked && !takesFile(tool, picked.ext)) return null;
        return { tool, score };
      })
      .filter((entry): entry is { tool: FindableTool; score: number } => entry !== null);

    return scored.sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
  }, [tools, query, picked, labels]);

  function takeFile(file: File | undefined) {
    if (!file) return;
    setPicked({ name: file.name, ext: extOf(file.name) });
    setQuery('');
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/tools?q=${encodeURIComponent(q)}` : '/tools');
  }

  const idle = !query.trim() && !picked;
  const shown = matches.slice(0, 4);
  const listed = idle ? popular.map((tool) => ({ tool, score: 0 })) : shown;

  return (
    <section className="finder" aria-label="Find the right tool">
      <div className="finder-head">
        <span className="finder-title">Find a tool</span>
        <span className="finder-count">{totalWorking} ready now</span>
      </div>

      <div className="finder-body">
        <form className="search-box" role="search" onSubmit={submit}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <input
            type="search"
            value={query}
            placeholder="Merge PDF, compress image, qr code…"
            aria-label="Search tools"
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
            }}
          />
          <button type="submit">Search</button>
        </form>

        {idle ? (
          <div className="chips">
            <span className="chips-label">Popular</span>
            {popular.map((tool) => (
              <Link
                key={`${tool.category}/${tool.slug}`}
                href={`/${tool.category}/${tool.slug}`}
                className="chip"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        ) : null}

        <div
          className={`drop${dragging ? ' over' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            takeFile(e.dataTransfer.files[0]);
          }}
        >
          <span className="drop-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" />
              <path d="M14 3.5V8h4.5" />
            </svg>
          </span>
          <div className="drop-text">
            <strong>{picked ? picked.name : 'Drop a file here'}</strong>
            <small>
              {picked
                ? `Showing the tools that take ${picked.ext || 'this file'} — nothing is uploaded yet.`
                : 'We list every tool that takes that file. Nothing uploads until you run one.'}
            </small>
          </div>
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => {
              takeFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        {idle || matches.length > 0 ? (
          <>
            <div className="counter-line">
              {idle ? (
                <>
                  <b>{totalWorking}</b>
                  <span>working right now</span>
                  <em>{totalListed} listed</em>
                </>
              ) : (
                <>
                  <b>{matches.length}</b>
                  <span>{picked ? `take ${picked.ext}` : 'match'}</span>
                  <em>
                    <Link
                      href={`/tools${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`}
                    >
                      See all
                    </Link>
                  </em>
                </>
              )}
            </div>

            <div className="hits">
              {listed.map(({ tool }) => (
                <Link
                  key={`${tool.category}/${tool.slug}`}
                  href={`/${tool.category}/${tool.slug}`}
                  className="hit"
                >
                  <span
                    className="hit-icon"
                    aria-hidden="true"
                    style={{ color: CATEGORY_ACCENT[tool.category] ?? 'var(--grey)' }}
                  >
                    <ToolIcon icon={iconFor(tool)} size={14} />
                  </span>
                  <span className="hit-name">{tool.name}</span>
                  <span className="hit-cat">{labels[tool.category] ?? tool.category}</span>
                  <span className="hit-go">{tool.engine ? 'Open' : 'Planned'}</span>
                </Link>
              ))}
              {!idle && matches.length > shown.length && (
                <Link
                  href={`/tools${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`}
                  className="hit"
                >
                  <span className="hit-name">{matches.length - shown.length} more</span>
                  <span className="hit-go">In the directory</span>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="finder-empty">
            No tool here takes {picked?.ext || 'that file'} yet. The full directory lists everything,
            including what is still planned.
          </div>
        )}

        <p className="finder-foot">
          Drop a file to see what takes it · nothing uploads until you run a tool
        </p>
      </div>
    </section>
  );
}
