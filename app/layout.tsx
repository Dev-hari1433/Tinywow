import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import './icon-preview.css';

export const metadata: Metadata = {
  title: 'TinyClone — every file job, in one place',
  description:
    'Merge, shrink, convert and edit everyday files in the browser. 253 tools listed, 210 working today, no account, files deleted after an hour.',
};

const AISLES = [
  { cat: 'pdf', label: 'PDF' },
  { cat: 'image', label: 'Image' },
  { cat: 'video', label: 'Video' },
  { cat: 'write', label: 'Write' },
  { cat: 'converter', label: 'Converters' },
  { cat: 'other', label: 'Utilities' },
];

const LEFT_NAV = AISLES.slice(0, 3);
const RIGHT_NAV = AISLES.slice(3);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <div className="rail topbar-in">
            <span>Free · no account · files deleted an hour after you take them</span>
            <nav aria-label="Shortcuts">
              <Link href="/tools?category=planned">Planned</Link>
              <Link href="/#how">How it works</Link>
            </nav>
          </div>
        </div>

        <header className="masthead">
          <div className="rail masthead-in">
            <Link href="/" className="wordmark" aria-label="TinyClone home">
              TinyClone
            </Link>

            <nav className="nav-group aisles" aria-label="Categories">
              {AISLES.map((aisle) => (
                <Link key={aisle.cat} href={`/tools?category=${aisle.cat}`} className="nav-item">
                  {aisle.label}
                </Link>
              ))}
            </nav>

            <Link href="/tools" className="nav-cta">
              All tools
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="rail">
            <div className="footer-top">
              <div>
                <div className="footer-mark">TinyClone</div>
                <p className="micro" style={{ marginTop: 16, color: 'rgba(255,255,255,0.55)' }}>
                  253 tools listed · 210 working
                </p>
              </div>
              <div className="footer-col">
                <h3>Categories</h3>
                <ul>
                  {AISLES.map((aisle) => (
                    <li key={aisle.cat}>
                      <Link href={`/tools?category=${aisle.cat}`}>{aisle.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="footer-col">
                <h3>Working tools</h3>
                <ul>
                  <li>
                    <Link href="/tools">All 210 tools</Link>
                  </li>
                  <li>
                    <Link href="/tools?category=planned">Planned tools</Link>
                  </li>
                  <li>
                    <Link href="/pdf/merge">Merge PDF</Link>
                  </li>
                  <li>
                    <Link href="/image/compress">Compress Image</Link>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h3>About</h3>
                <ul>
                  <li>
                    <Link href="/#how">How it works</Link>
                  </li>
                  <li>
                    <Link href="/#shelf">What is on the shelf</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>
                An independent reimplementation, not affiliated with the site it was reconstructed
                from.
              </span>
              <span>Files are processed on this server and deleted after one hour.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
