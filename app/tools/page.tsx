import CatalogBrowser from '@/app/components/CatalogBrowser';
import { CATEGORIES, READY_TOOLS, TOOLS, type Category } from '@/lib/catalog';

export const metadata = {
  title: 'All tools — TinyClone',
  description: 'Browse every tool in the catalog, with live status for each one.',
};

type Filter = 'all' | Category;

function parseCategory(raw: string | undefined): Filter {
  return raw && (CATEGORIES as string[]).includes(raw) ? (raw as Category) : 'all';
}

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const initialCategory = parseCategory(sp.category);
  const initialQuery = typeof sp.q === 'string' ? sp.q : '';

  return (
    <div className="wrap section">
      <div className="section-head">
        <h2>All tools</h2>
        <p>
          {TOOLS.length} tools in {CATEGORIES.length} categories — {READY_TOOLS.length} of them run
          end to end in this build.
        </p>
      </div>
      <CatalogBrowser tools={TOOLS} initialCategory={initialCategory} initialQuery={initialQuery} />
    </div>
  );
}
