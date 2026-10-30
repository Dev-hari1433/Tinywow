'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_META, type Category, type Tool } from '@/lib/catalog';

type Filter = 'all' | Category;

export default function CatalogBrowser({
  tools,
  initialCategory,
  initialQuery,
}: {
  tools: Tool[];
  initialCategory: Filter;
  initialQuery: string;
}) {
  const [category, setCategory] = useState<Filter>(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (category !== 'all' && tool.category !== category) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.slug.includes(q) ||
        tool.summary.toLowerCase().includes(q)
      );
    });
  }, [tools, category, query]);

  const readyCount = visible.filter((t) => t.engine).length;

  return (
    <div>
      <div className="toolbar">
        <input
          className="search"
          type="search"
          value={query}
          placeholder="Search 253 tools — merge, compress, qr…"
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tools"
        />
        <div className="tabs">
          <button className="tab" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="tab"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
      </div>

      <p className="muted-block" style={{ marginBottom: 14 }}>
        Showing {visible.length} tool{visible.length === 1 ? '' : 's'} · {readyCount} ready ·{' '}
        {visible.length - readyCount} documented as planned
      </p>

      <div className="grid">
        {visible.map((tool) => (
          <Link key={`${tool.category}/${tool.slug}`} href={`/${tool.category}/${tool.slug}`} className="card">
            <div className="card-top">
              <h3>{tool.name}</h3>
              <span className={`badge ${tool.engine ? 'ready' : 'planned'}`}>
                {tool.engine ? 'Ready' : 'Planned'}
              </span>
            </div>
            <p>{tool.summary}</p>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="muted-block" style={{ padding: '30px 0' }}>
          No tool matches “{query}”. Try a format name such as PDF, PNG or CSV.
        </p>
      )}
    </div>
  );
}
