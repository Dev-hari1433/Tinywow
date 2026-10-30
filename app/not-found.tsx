import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap section" style={{ padding: '80px 0' }}>
      <h1 style={{ fontSize: 34 }}>That tool does not exist</h1>
      <p className="muted-block" style={{ marginTop: 10 }}>
        The URL is not in the inspected catalog. Head back to the index to pick one.
      </p>
      <p style={{ marginTop: 22 }}>
        <Link href="/tools" className="chip">Browse all tools →</Link>
      </p>
    </div>
  );
}
