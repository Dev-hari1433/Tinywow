import Link from 'next/link';
import { notFound } from 'next/navigation';
import ToolWorkspace from '@/app/components/ToolWorkspace';
import { CATEGORY_META, READY_TOOLS, TOOLS, getTool, type Category } from '@/lib/catalog';

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
  const related = TOOLS.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug && t.engine,
  ).slice(0, 4);
  const readySiblings = READY_TOOLS.filter((t) => t.category === tool.category).length;

  return (
    <div className="wrap tool-page">
      <Link href={`/tools?category=${tool.category}`} className="back">
        ← {meta.label} tools
      </Link>

      <div className="tool-head">
        <div style={{ flex: '1 1 420px' }}>
          <h1>{tool.name}</h1>
          <p>{tool.summary}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${tool.engine ? 'ready' : 'planned'}`}>
            {tool.engine ? 'Ready' : 'Planned'}
          </span>
          <span className="chip">{meta.label}</span>
          {tool.engine && <span className="chip">{tool.engine}</span>}
        </div>
      </div>

      <ToolWorkspace tool={tool} />

      {related.length > 0 && (
        <div className="section">
          <div className="section-head">
            <h2>More {meta.label.toLowerCase()} tools</h2>
            <p>{readySiblings} working in this category</p>
          </div>
          <div className="grid">
            {related.map((t) => (
              <Link key={t.slug} href={`/${t.category}/${t.slug}`} className="card">
                <div className="card-top">
                  <h3>{t.name}</h3>
                  <span className="badge ready">Ready</span>
                </div>
                <p>{t.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
