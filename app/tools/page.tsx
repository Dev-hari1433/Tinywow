import CatalogBrowser, { type CategoryOption, type Filter } from '@/app/components/CatalogBrowser';
import { CATEGORIES, CATEGORY_META, READY_TOOLS, TOOLS, type Category } from '@/lib/catalog';

export const metadata = {
  title: 'The directory — TinyClone',
  description: 'Every tool in the catalogue, grouped by aisle, with its real status.',
};

function parseCategory(raw: string | undefined): Filter {
  if (raw === 'planned') return 'planned';
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
  const categories: CategoryOption[] = CATEGORIES.map((c) => ({
    id: c,
    label: CATEGORY_META[c].label,
  }));
  const planned = TOOLS.length - READY_TOOLS.length;

  return (
    <>
      <div className="rail page" style={{ paddingBottom: 0 }}>
        <div className="page-head">
          <div>
            <h1>Directory</h1>
            <p>
              {TOOLS.length} tools across six aisles. {READY_TOOLS.length} of them work end to end
              today; the other {planned} are shelved under planning with the missing piece named.
            </p>
          </div>
          <span className="page-note">
            {READY_TOOLS.length} working
            <br />
            {planned} planned
          </span>
        </div>
      </div>
      <CatalogBrowser
        tools={TOOLS}
        categories={categories}
        initialCategory={initialCategory}
        initialQuery={initialQuery}
      />
    </>
  );
}
