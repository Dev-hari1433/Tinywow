'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Tool } from '@/lib/catalog';
import { fileCountLine, formatsLine } from '@/lib/format-label';
import { CATEGORY_ACCENT, ToolIcon, iconFor } from '@/lib/tool-icon';

export type Filter = 'all' | 'planned' | string;

export interface CategoryOption {
  id: string;
  label: string;
}

export default function CatalogBrowser({
  tools,
  categories,
  initialCategory,
  initialQuery,
}: {
  tools: Tool[];
  categories: CategoryOption[];
  initialCategory: Filter;
  initialQuery: string;
}) {
  const [category, setCategory] = useState<Filter>(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  const labels = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.label])),
    [categories],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (category === 'planned') {
        if (tool.engine) return false;
      } else if (category !== 'all' && tool.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.slug.includes(q) ||
        tool.summary.toLowerCase().includes(q)
      );
    });
  }, [tools, category, query]);

  const readyCount = visible.filter((t) => t.engine).length;

  const groups = useMemo(() => {
    const out: { id: string; label: string; tools: Tool[]; planned: boolean }[] = [];
    for (const cat of categories) {
      if (category !== 'all' && category !== cat.id) continue;
      const rows = visible.filter((t) => t.category === cat.id && t.engine);
      if (rows.length) out.push({ id: cat.id, label: cat.label, tools: rows, planned: false });
    }
    const plannedRows = visible.filter((t) => !t.engine);
    if (plannedRows.length) {
      out.push({
        id: 'planned',
        label: 'Planning to implement in future',
        tools: plannedRows,
        planned: true,
      });
    }
    return out;
  }, [categories, visible, category]);

  return (
    <div>
      <div className="directory-bar">
        <div className="rail directory-inner">
          <div className="directory-search">
            <input
              type="search"
              value={query}
              placeholder="Search 253 tools — merge, compress, qr, csv…"
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools"
            />
            {query && (
              <button type="button" className="clear" onClick={() => setQuery('')}>
                Clear
              </button>
            )}
          </div>
          <div className="filters" role="group" aria-label="Filter by category">
            <button
              type="button"
              className="filter"
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              All categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="filter"
                aria-pressed={category === cat.id}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              className="filter planned-filter"
              aria-pressed={category === 'planned'}
              onClick={() => setCategory('planned')}
            >
              Planned
            </button>
          </div>
        </div>
      </div>

      <div className="rail">
        <div className="result-line">
          <span>
            Showing <b>{visible.length}</b> of {tools.length} tools
          </span>
          <span>
            <b>{readyCount}</b> working
          </span>
          <span>{visible.length - readyCount} planned</span>
        </div>

        {groups.map((group) => (
          <section key={group.id} aria-label={group.label}>
            <div className="group-row">
              <h3>{group.label}</h3>
              <span>
                {group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'} ·{' '}
                {group.tools.filter((t) => t.engine).length} working
              </span>
            </div>
            <div className="index">
              {group.tools.map((tool) => (
                <Link
                  key={`${tool.category}/${tool.slug}`}
                  href={`/${tool.category}/${tool.slug}`}
                  className={`strip${tool.engine ? '' : ' out'}`}
                >
                  <span
                    className="icon-tile sm"
                    aria-hidden="true"
                    style={
                      { '--accent': CATEGORY_ACCENT[tool.category] ?? 'var(--ink)' } as CSSProperties
                    }
                  >
                    <ToolIcon icon={iconFor(tool)} size={14} />
                  </span>
                  <div>
                    <div className="strip-name">{tool.name}</div>
                    <div className="strip-spec">
                      <b>{labels[tool.category] ?? tool.category}</b>
                      <span>
                        {tool.engine
                          ? formatsLine(tool.accept, tool.minFiles).toLowerCase() ===
                            (labels[tool.category] ?? '').toLowerCase()
                            ? fileCountLine(tool.minFiles, tool.maxFiles)
                            : formatsLine(tool.accept, tool.minFiles)
                          : 'not built yet'}
                      </span>
                    </div>
                  </div>
                  <span className="strip-go">{tool.engine ? 'Ready' : 'Planned'}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {visible.length === 0 && (
          <div className="empty-state">
            <h3>Nothing on the shelf matches “{query}”</h3>
            <p>
              Try the format instead of the job — PDF, PNG, CSV, MP4 — or{' '}
              <Link href="/tools" style={{ borderBottom: '1px solid var(--ink)' }}>
                clear the filter and browse all 253 tools
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
