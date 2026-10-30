import Link from 'next/link';
import {
  CATEGORIES, CATEGORY_COUNTS, CATEGORY_META, READY_TOOLS, TOOLS, getTool,
} from '@/lib/catalog';

export default function HomePage() {
  const readyByCat = Object.fromEntries(
    CATEGORIES.map((c) => [c, READY_TOOLS.filter((t) => t.category === c).length]),
  ) as Record<string, number>;

  const highlights = [
    'pdf/merge', 'pdf/split', 'pdf/compress', 'pdf/to-jpg', 'pdf/from-jpg', 'pdf/watermark',
    'image/compress', 'image/resize', 'image/crop-circle', 'image/combine-maker',
    'other/qr-code', 'other/unix-timestamp', 'converter/csv-to-json', 'converter/json-to-xml',
  ]
    .map((key) => {
      const [category, slug] = key.split('/');
      return getTool(category, slug);
    })
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="wrap">
      <section className="hero">
        <span className="eyebrow">Reconstructed · running locally</span>
        <h1>
          Every file tool you need,
          <br />
          <em>actually processing files.</em>
        </h1>
        <p className="lead">
          A full-stack rebuild of a 253-tool file utility site. Uploads go to a real queue, the
          work happens server-side with real document and image libraries, and results come back
          as signed, expiring download links.
        </p>
        <div className="stats">
          <div className="stat"><b>{TOOLS.length}</b><span>tools inventoried</span></div>
          <div className="stat"><b>{READY_TOOLS.length}</b><span>fully working</span></div>
          <div className="stat"><b>{CATEGORIES.length}</b><span>categories</span></div>
          <div className="stat"><b>1 h</b><span>upload retention</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Browse by category</h2>
          <p>Counts are the inspected totals; the green number is what runs here.</p>
        </div>
        <div className="grid cats">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/tools?category=${cat}`} className="card">
              <div className="card-top">
                <h3>{CATEGORY_META[cat].label}</h3>
                <span className="chip">{CATEGORY_COUNTS[cat]}</span>
              </div>
              <p>{CATEGORY_META[cat].blurb}</p>
              <p style={{ marginTop: 10, color: 'var(--accent)', fontSize: 12 }}>
                {readyByCat[cat]} working
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Working right now</h2>
          <p>
            Every card below is wired to an engine and covered by the end-to-end checks in{' '}
            <code>scripts/test-tools.mjs</code>.
          </p>
        </div>
        <div className="grid">
          {highlights.map((tool) => (
            <Link key={`${tool.category}/${tool.slug}`} href={`/${tool.category}/${tool.slug}`} className="card">
              <div className="card-top">
                <h3>{tool.name}</h3>
                <span className="badge ready">Ready</span>
              </div>
              <p>{tool.summary}</p>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 18 }}>
          <Link href="/tools" className="chip">See all {READY_TOOLS.length} working tools →</Link>
        </p>
      </section>
    </div>
  );
}
