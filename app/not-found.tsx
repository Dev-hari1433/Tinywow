import Link from 'next/link';
import { CATEGORIES, CATEGORY_COUNTS, CATEGORY_META } from '@/lib/catalog';

export default function NotFound() {
  return (
    <div className="rail page">
      <div className="page-head">
        <div>
          <h1>That item is not in the directory</h1>
          <p>
            The URL does not match anything in the inspected catalogue. Pick an aisle below, or
            search the full directory by name or format.
          </p>
        </div>
        <Link href="/tools" className="link-u">
          Full directory
        </Link>
      </div>

      <div className="index">
        {CATEGORIES.map((cat, i) => (
          <Link key={cat} href={`/tools?category=${cat}`} className="strip">
            <div>
              <div className="strip-name">
                {CATEGORY_META[cat].label} · {CATEGORY_COUNTS[cat]} tools
              </div>
              <div className="strip-spec">{CATEGORY_META[cat].blurb}</div>
            </div>
            <span className="link-u">Open aisle →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
