import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import ToolWorkspace from '@/app/components/ToolWorkspace';
import { CATEGORY_META, READY_TOOLS, TOOLS, getTool, type Category } from '@/lib/catalog';
import { formatsLine } from '@/lib/format-label';
import { CATEGORY_ACCENT, ToolIcon, iconFor } from '@/lib/tool-icon';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool } = await params;
  const found = getTool(category, tool);
  if (!found) return { title: 'Tool not found — TinyClone' };
  return { title: `${found.name} — TinyClone`, description: found.summary };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: slug } = await params;
  const tool = getTool(category, slug);
  if (!tool) notFound();

  const meta = CATEGORY_META[tool.category as Category];
  const accent = CATEGORY_ACCENT[tool.category] ?? 'var(--ink)';
  const related = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug && t.engine,
  ).slice(0, 6);
  const readySiblings = READY_TOOLS.filter((t) => t.category === tool.category).length;

  return (
    <div className="rail page" style={{ '--accent': accent } as CSSProperties}>
      <Link href={`/tools?category=${tool.category}`} className="crumb">
        ← {meta.label} category
      </Link>

      <div className="item-head">
        <div>
          <div className="item-title">
            <span className="icon-tile lg" aria-hidden="true">
              <ToolIcon icon={iconFor(tool)} size={26} />
            </span>
            <h1>{tool.name}</h1>
          </div>
          <p className="item-summary">{tool.summary}</p>
          <div className="spec-strip">
            <div className="spec-cell">
              <span>Category</span>
              <b>{meta.label}</b>
            </div>
            <div className="spec-cell">
              <span>Files</span>
              <b>
                {tool.minFiles === 0
                  ? '—'
                  : tool.maxFiles > 1
                    ? `${tool.minFiles}–${tool.maxFiles}`
                    : '1'}
              </b>
            </div>
            <div className="spec-cell">
              <span>Takes</span>
              <b>{formatsLine(tool.accept, tool.minFiles)}</b>
            </div>
            <div className="spec-cell">
              <span>Cost</span>
              <b>free</b>
            </div>
            <div className="spec-cell">
              <span>Ready</span>
              <b>{readySiblings} tools</b>
            </div>
          </div>
        </div>
        <span className={`stock-plate${tool.engine ? '' : ' out'}`}>
          {tool.engine ? 'Ready to run' : 'Planned'}
        </span>
      </div>

      <ToolWorkspace tool={tool} />

      {related.length > 0 && (
        <div className="also">
          <div className="section-head">
            <h2>More in {meta.label}</h2>
            <Link href={`/tools?category=${tool.category}`} className="link-u">
              All {meta.label} tools
            </Link>
          </div>
          <div className="index">
            {related.map((t) => (
              <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="strip">
                <span className="icon-tile sm" aria-hidden="true">
                  <ToolIcon icon={iconFor(t)} size={14} />
                </span>
                <div>
                  <div className="strip-name">{t.name}</div>
                  <div className="strip-spec">
                    <b>{meta.label}</b>
                    <span>{formatsLine(t.accept, t.minFiles)}</span>
                  </div>
                </div>
                <span className="strip-go">Open</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
